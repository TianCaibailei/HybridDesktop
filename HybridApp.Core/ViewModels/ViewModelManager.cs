using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using HybridApp.Core.Attributes;
using Microsoft.Web.WebView2.Core;

namespace HybridApp.Core.ViewModels
{
    /// <summary>
    /// 全局 ViewModel 管理中心，负责维护后端 VM 实例、路由消息以及状态同步
    /// </summary>
    public class ViewModelManager
    {
        private readonly Dictionary<string, SyncViewModelBase> _vms = new Dictionary<string, SyncViewModelBase>();
        private CoreWebView2 _webView;

        /// <summary>
        /// 命令元数据缓存：_commands[vmName][methodName] = CommandInfo
        /// </summary>
        private readonly Dictionary<string, Dictionary<string, CommandInfo>> _commands = new();

        /// <summary>
        /// 命令元数据，记录方法反射信息、参数列表和返回值类型
        /// </summary>
        private class CommandInfo
        {
            public MethodInfo Method;
            public ParameterInfo[] Parameters;
            public bool HasReturnValue; // true = 非 void，需要回传结果
        }

        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
            WriteIndented = false
        };

        /// <summary>
        /// 挂载 WebView2 并开始监听消息
        /// </summary>
        public void Attach(CoreWebView2 webView)
        {
            _webView = webView;
            _webView.WebMessageReceived += OnWebMessageReceived;
        }

        /// <summary>
        /// 注册 ViewModel，使其具备双向同步能力
        /// </summary>
        public void Register(SyncViewModelBase vm)
        {
            if (_vms.ContainsKey(vm.VmName))
                throw new ArgumentException($"ViewModel with name '{vm.VmName}' is already registered.");

            _vms[vm.VmName] = vm;

            // 自动配置同步联动：当后端 C# 属性变化时，自动序列化并推送到前端
            vm.AttachSyncAction((vmName, propName, value) =>
            {
                var message = new
                {
                    type = "STATE_SYNC",
                    payload = new { vmName, propName, value }
                };
                
                try
                {
                    string json = JsonSerializer.Serialize(message, _jsonOptions);
                    _webView.PostWebMessageAsJson(json);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"[SyncError] Failed to push state to web: {ex.Message}");
                }
            });

            // 扫描并缓存该 VM 上所有 [SyncCommand] 标记的方法元数据
            RegisterCommands(vm);
        }

        /// <summary>
        /// 通过反射扫描 VM 上的 [SyncCommand] 方法，缓存方法签名用于后续调用和前端代码生成
        /// </summary>
        private void RegisterCommands(SyncViewModelBase vm)
        {
            var methods = vm.GetType().GetMethods(BindingFlags.Public | BindingFlags.Instance)
                .Where(m => m.GetCustomAttribute<SyncCommandAttribute>() != null);

            var cmdDict = new Dictionary<string, CommandInfo>();
            foreach (var method in methods)
            {
                cmdDict[method.Name] = new CommandInfo
                {
                    Method = method,
                    Parameters = method.GetParameters(),
                    HasReturnValue = method.ReturnType != typeof(void)
                };
            }

            if (cmdDict.Count > 0)
                _commands[vm.VmName] = cmdDict;
        }

        /// <summary>
        /// 消息循环核心逻辑
        /// </summary>
        private void OnWebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                using var doc = JsonDocument.Parse(e.WebMessageAsJson);
                var root = doc.RootElement;

                // 安全读取 type 字段
                if (!root.TryGetProperty("type", out var typeProp)) return;
                
                string msgType = typeProp.GetString();
                
                switch (msgType)
                {
                    case "STATE_SET":
                        ProcessStateSet(root);
                        break;
                    case "INIT_REQUEST":
                        SendFullState();
                        break;
                    case "COMMAND":
                        ProcessCommand(root);
                        break;
                }
            }
            catch (JsonException jex)
            {
                System.Diagnostics.Debug.WriteLine($"[ManagerError] Invalid JSON received: {jex.Message}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[ManagerError] Unexpected error processing message: {ex.Message}");
            }
        }

        /// <summary>
        /// 处理前端发起的属性更新请求 (STATE_SET)
        /// </summary>
        private void ProcessStateSet(JsonElement root)
        {
            if (!root.TryGetProperty("payload", out var payload)) return;
            
            // 使用 TryGetProperty 安全获取指令详情
            if (payload.TryGetProperty("vmName", out var vmNameElement) &&
                payload.TryGetProperty("propName", out var propNameElement) &&
                payload.TryGetProperty("value", out var valueElement))
            {
                string vmName = vmNameElement.GetString();
                string propName = propNameElement.GetString();

                if (_vms.TryGetValue(vmName, out var vm))
                {
                    vm.SetPropertyByName(propName, valueElement);
                }
            }
        }

        /// <summary>
        /// 处理前端发起的命令调用请求 (COMMAND)
        /// 从缓存的元数据中查找方法，按参数名从 JSON 中解析强类型参数，调用方法
        /// 如果方法有返回值，将结果序列化后回传前端
        /// </summary>
        private void ProcessCommand(JsonElement root)
        {
            if (!root.TryGetProperty("payload", out var payload)) return;

            if (!payload.TryGetProperty("vmName", out var vmNameEl) ||
                !payload.TryGetProperty("methodName", out var methodNameEl))
                return;

            string vmName = vmNameEl.GetString();
            string methodName = methodNameEl.GetString();

            // 可选：前端传来的 requestId，用于将返回值回传给对应的 Promise
            string requestId = null;
            if (payload.TryGetProperty("requestId", out var reqIdEl))
                requestId = reqIdEl.GetString();

            if (!_commands.TryGetValue(vmName, out var cmdDict) ||
                !cmdDict.TryGetValue(methodName, out var cmdInfo) ||
                !_vms.TryGetValue(vmName, out var vm))
            {
                System.Diagnostics.Debug.WriteLine($"[CommandError] Command not found: {vmName}.{methodName}");
                SendCommandResponse(requestId, false, null, $"Command not found: {vmName}.{methodName}");
                return;
            }

            try
            {
                // 从 JSON args 对象中按参数名逐个解析强类型参数
                payload.TryGetProperty("args", out var argsEl);

                var parameters = cmdInfo.Parameters;
                var invokeArgs = new object[parameters.Length];

                for (int i = 0; i < parameters.Length; i++)
                {
                    var param = parameters[i];
                    if (argsEl.ValueKind == JsonValueKind.Object &&
                        argsEl.TryGetProperty(param.Name, out var paramEl))
                    {
                        invokeArgs[i] = JsonSerializer.Deserialize(
                            paramEl.GetRawText(), param.ParameterType,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    }
                    else if (param.HasDefaultValue)
                    {
                        invokeArgs[i] = param.DefaultValue;
                    }
                    else
                    {
                        invokeArgs[i] = param.ParameterType.IsValueType
                            ? Activator.CreateInstance(param.ParameterType)
                            : null;
                    }
                }

                // 调用目标方法
                var result = cmdInfo.Method.Invoke(vm, invokeArgs);

                // 如果有返回值，回传给前端
                if (cmdInfo.HasReturnValue && requestId != null)
                {
                    SendCommandResponse(requestId, true, result, null);
                }
            }
            catch (Exception ex)
            {
                var innerMsg = ex.InnerException?.Message ?? ex.Message;
                System.Diagnostics.Debug.WriteLine($"[CommandError] Failed to invoke {vmName}.{methodName}: {innerMsg}");
                SendCommandResponse(requestId, false, null, innerMsg);
            }
        }

        /// <summary>
        /// 将命令执行结果回传给前端（仅在有 requestId 时发送）
        /// </summary>
        private void SendCommandResponse(string requestId, bool success, object result, string error)
        {
            if (requestId == null || _webView == null) return;

            try
            {
                var response = new
                {
                    type = "COMMAND_RESPONSE",
                    payload = new { requestId, success, result, error }
                };
                string json = JsonSerializer.Serialize(response, _jsonOptions);
                _webView.PostWebMessageAsJson(json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[CommandError] Failed to send response: {ex.Message}");
            }
        }

        /// <summary>
        /// 向前端推送当前所有已注册 VM 的全量状态快照
        /// </summary>
        public void SendFullState()
        {
            if (_webView == null) return;

            var stateDict = new Dictionary<string, object>();
            foreach (var kvp in _vms)
            {
                stateDict[kvp.Key] = kvp.Value; 
            }

            var message = new
            {
                type = "INIT_RESPONSE",
                state = stateDict
            };

            try
            {
                string json = JsonSerializer.Serialize(message, _jsonOptions);
                _webView.PostWebMessageAsJson(json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[ManagerError] Failed to send full state: {ex.Message}");
            }
        }
    }
}
