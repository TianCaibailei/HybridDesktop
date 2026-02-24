using System;
using System.ComponentModel;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace HybridApp.Core.ViewModels
{
    /// <summary>
    /// 同步 ViewModel 基类，提供属性变更通知和自动同步功能
    /// </summary>
    public abstract class SyncViewModelBase : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;
        
        /// <summary>
        /// ViewModel 的唯一标识符，用于前端路由
        /// </summary>
        public string VmName { get; }
        
        private Action<string, string, object> _syncAction;

        protected SyncViewModelBase(string vmName)
        {
            VmName = vmName;
        }

        /// <summary>
        /// 挂载同步回调动作
        /// </summary>
        public void AttachSyncAction(Action<string, string, object> syncAction)
        {
            _syncAction = syncAction;
        }

        /// <summary>
        /// 设置属性并触发同步。当属性值实际改变时，会发送消息给前端。
        /// </summary>
        protected virtual bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (Equals(backingStore, value)) return false;
            
            backingStore = value;
            OnPropertyChanged(propertyName);
            
            // 触发双向同步回调
            _syncAction?.Invoke(VmName, propertyName, value); 
            return true;
        }

        /// <summary>
        /// 手动触发属性同步。
        /// 用于复杂对象（如嵌套对象、列表）内部成员改变，但对象引用未变的情况。
        /// </summary>
        public void ManualSync(string propertyName)
        {
            var propInfo = this.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
            if (propInfo == null) return;

            var value = propInfo.GetValue(this);
            OnPropertyChanged(propertyName);
            _syncAction?.Invoke(VmName, propertyName, value);
        }

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        /// <summary>
        /// 使用反射自动将前端传来的 JsonElement 转换为属性对应的类型并赋值。
        /// 内部做了容错处理，确保前端非法传值不会导致后端崩溃。
        /// </summary>
        public virtual void SetPropertyByName(string propName, JsonElement value)
        {
            try
            {
                var prop = this.GetType().GetProperty(propName, 
                    BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                
                if (prop != null && prop.CanWrite)
                {
                    // 利用 JsonSerializer 自动处理复杂的类型转换（包括嵌套对象反序列化）
                    // 默认使用 CamelCase 选项由 ViewModelManager 提供
                    var rawJson = value.GetRawText();
                    var convertedValue = JsonSerializer.Deserialize(rawJson, prop.PropertyType, new JsonSerializerOptions 
                    { 
                        PropertyNameCaseInsensitive = true 
                    });
                    
                    prop.SetValue(this, convertedValue);
                    
                    // 注意：反射赋值不会自动触发 SetProperty 里的 _syncAction（防止死循环推送），
                    // 但需要手动触发 WPF 侧的 PropertyChanged 以同步 UI
                    OnPropertyChanged(propName);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[SyncError] Failed to set property '{VmName}.{propName}': {ex.Message}");
            }
        }
    }
}
