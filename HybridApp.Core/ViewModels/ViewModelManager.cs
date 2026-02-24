using System;
using System.Collections.Generic;
using System.Text.Json;
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
