using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.Json;
using HybridApp.Core.Attributes;

namespace HybridApp.Core.ViewModels
{
    /// <summary>
    /// 同步 ViewModel 基类，提供属性变更通知、自动深度同步功能。
    /// 自动递归监听所有实现 INotifyPropertyChanged 的嵌套子对象，
    /// 以及 INotifyCollectionChanged (如 ObservableCollection) 的集合变更，
    /// 无需用户手动编写事件订阅代码。
    /// </summary>
    public abstract class SyncViewModelBase : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;
        
        /// <summary>
        /// ViewModel 的唯一标识符，用于前端路由
        /// </summary>
        public string VmName { get; }
        
        private Action<string, string, object> _syncAction;

        /// <summary>
        /// 存储每个被监听属性的事件处理器引用，确保可以正确 -= 取消订阅。
        /// Key = "属性路径:对象HashCode"，Value = handler 引用
        /// </summary>
        private readonly Dictionary<string, PropertyChangedEventHandler> _watchedHandlers = new();
        
        /// <summary>
        /// 存储集合变更事件处理器引用
        /// </summary>
        private readonly Dictionary<string, NotifyCollectionChangedEventHandler> _watchedCollectionHandlers = new();

        /// <summary>
        /// 防止循环引用导致的无限递归
        /// </summary>
        private readonly HashSet<object> _watchedObjects = new(ReferenceEqualityComparer.Instance);

        protected SyncViewModelBase(string vmName)
        {
            VmName = vmName;
        }

        /// <summary>
        /// 挂载同步回调动作，并自动初始化深度监听
        /// </summary>
        public void AttachSyncAction(Action<string, string, object> syncAction)
        {
            _syncAction = syncAction;
            InitDeepSync();
        }

        /// <summary>
        /// 设置属性并触发同步。当属性值实际改变时，会发送消息给前端。
        /// 自动对实现 INotifyPropertyChanged 的新/旧值进行深度监听管理。
        /// </summary>
        protected virtual bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (Equals(backingStore, value)) return false;
            
            // 自动取消旧值的深度监听
            if (backingStore is INotifyPropertyChanged oldNpc)
                UnwatchProperty(propertyName, oldNpc);
            if (backingStore is INotifyCollectionChanged oldNcc)
                UnwatchCollection(propertyName, oldNcc);

            backingStore = value;
            OnPropertyChanged(propertyName);
            
            // 触发双向同步回调
            _syncAction?.Invoke(VmName, propertyName, value); 

            // 自动对新值建立深度监听
            if (value is INotifyPropertyChanged newNpc)
                WatchProperty(propertyName, newNpc);
            if (value is INotifyCollectionChanged newNcc)
                WatchCollection(propertyName, newNcc);

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
                    var rawJson = value.GetRawText();
                    var convertedValue = JsonSerializer.Deserialize(rawJson, prop.PropertyType, new JsonSerializerOptions 
                    { 
                        PropertyNameCaseInsensitive = true 
                    });
                    
                    prop.SetValue(this, convertedValue);
                    OnPropertyChanged(propName);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[SyncError] Failed to set property '{VmName}.{propName}': {ex.Message}");
            }
        }

        #region Deep Sync 自动深度监听

        /// <summary>
        /// 初始化深度同步：扫描所有标记了 [SyncProperty] 的属性，
        /// 对实现 INotifyPropertyChanged / INotifyCollectionChanged 的属性自动建立递归监听。
        /// </summary>
        private void InitDeepSync()
        {
            _watchedObjects.Clear();
            _watchedObjects.Add(this); // 把自身加入防循环集合

            var properties = this.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (var prop in properties)
            {
                // 仅监听标记了 [SyncProperty] 的属性
                if (prop.GetCustomAttribute<SyncPropertyAttribute>() == null) continue;

                var value = prop.GetValue(this);
                if (value == null) continue;

                if (value is INotifyPropertyChanged npc)
                    WatchProperty(prop.Name, npc);

                if (value is INotifyCollectionChanged ncc)
                    WatchCollection(prop.Name, ncc);
            }
        }

        /// <summary>
        /// 递归监听一个 INotifyPropertyChanged 对象。
        /// 当该对象的任何属性变化时，自动触发 ManualSync(rootPropertyName)。
        /// 同时递归深入其子属性，支持多层嵌套。
        /// </summary>
        private void WatchProperty(string rootPropertyName, INotifyPropertyChanged target)
        {
            if (target == null) return;

            // 循环引用防护
            if (!_watchedObjects.Add(target)) return;

            var handlerKey = BuildHandlerKey(rootPropertyName, target);

            // 避免重复订阅
            if (_watchedHandlers.ContainsKey(handlerKey)) return;

            PropertyChangedEventHandler handler = (sender, e) =>
            {
                // 子对象变化 → 自动触发根属性同步
                ManualSync(rootPropertyName);
            };

            target.PropertyChanged += handler;
            _watchedHandlers[handlerKey] = handler;

            // 递归深入子属性
            WatchNestedProperties(rootPropertyName, target);
        }

        /// <summary>
        /// 取消对一个 INotifyPropertyChanged 对象的递归监听
        /// </summary>
        private void UnwatchProperty(string rootPropertyName, INotifyPropertyChanged target)
        {
            if (target == null) return;

            var handlerKey = BuildHandlerKey(rootPropertyName, target);

            if (_watchedHandlers.TryGetValue(handlerKey, out var handler))
            {
                target.PropertyChanged -= handler;
                _watchedHandlers.Remove(handlerKey);
            }

            _watchedObjects.Remove(target);

            // 递归取消子属性的监听
            UnwatchNestedProperties(rootPropertyName, target);
        }

        /// <summary>
        /// 监听 INotifyCollectionChanged（如 ObservableCollection）的集合变更。
        /// 集合的增删改操作都会自动触发 ManualSync。
        /// </summary>
        private void WatchCollection(string rootPropertyName, INotifyCollectionChanged target)
        {
            if (target == null) return;

            var handlerKey = BuildHandlerKey(rootPropertyName, target);

            if (_watchedCollectionHandlers.ContainsKey(handlerKey)) return;

            NotifyCollectionChangedEventHandler handler = (sender, e) =>
            {
                // 新增的元素如果实现了 INPC，也需要监听
                if (e.NewItems != null)
                {
                    foreach (var item in e.NewItems)
                    {
                        if (item is INotifyPropertyChanged npc)
                            WatchProperty(rootPropertyName, npc);
                    }
                }

                // 移除的元素需要取消监听
                if (e.OldItems != null)
                {
                    foreach (var item in e.OldItems)
                    {
                        if (item is INotifyPropertyChanged npc)
                            UnwatchProperty(rootPropertyName, npc);
                    }
                }

                // 集合变化 → 自动触发根属性同步
                ManualSync(rootPropertyName);
            };

            target.CollectionChanged += handler;
            _watchedCollectionHandlers[handlerKey] = handler;

            // 对集合中已有的 INPC 元素建立监听
            if (target is System.Collections.IEnumerable enumerable)
            {
                foreach (var item in enumerable)
                {
                    if (item is INotifyPropertyChanged npc)
                        WatchProperty(rootPropertyName, npc);
                }
            }
        }

        /// <summary>
        /// 取消对 INotifyCollectionChanged 的监听
        /// </summary>
        private void UnwatchCollection(string rootPropertyName, INotifyCollectionChanged target)
        {
            if (target == null) return;

            var handlerKey = BuildHandlerKey(rootPropertyName, target);

            if (_watchedCollectionHandlers.TryGetValue(handlerKey, out var handler))
            {
                target.CollectionChanged -= handler;
                _watchedCollectionHandlers.Remove(handlerKey);
            }

            // 取消集合中元素的属性监听
            if (target is System.Collections.IEnumerable enumerable)
            {
                foreach (var item in enumerable)
                {
                    if (item is INotifyPropertyChanged npc)
                        UnwatchProperty(rootPropertyName, npc);
                }
            }
        }

        /// <summary>
        /// 递归深入对象的所有子属性，建立监听
        /// </summary>
        private void WatchNestedProperties(string rootPropertyName, object target)
        {
            var properties = target.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (var prop in properties)
            {
                // 跳过索引器属性（如 ObservableCollection 的 this[int]），无法通过无参 GetValue 访问
                if (prop.GetIndexParameters().Length > 0) continue;

                object value;
                try { value = prop.GetValue(target); }
                catch { continue; }

                if (value == null) continue;

                if (value is INotifyPropertyChanged npc)
                    WatchProperty(rootPropertyName, npc);

                if (value is INotifyCollectionChanged ncc)
                    WatchCollection(rootPropertyName, ncc);
            }
        }

        /// <summary>
        /// 递归取消对象子属性的监听
        /// </summary>
        private void UnwatchNestedProperties(string rootPropertyName, object target)
        {
            var properties = target.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (var prop in properties)
            {
                // 跳过索引器属性
                if (prop.GetIndexParameters().Length > 0) continue;

                object value;
                try { value = prop.GetValue(target); }
                catch { continue; }

                if (value == null) continue;

                if (value is INotifyPropertyChanged npc)
                    UnwatchProperty(rootPropertyName, npc);

                if (value is INotifyCollectionChanged ncc)
                    UnwatchCollection(rootPropertyName, ncc);
            }
        }

        /// <summary>
        /// 构建唯一的 handler key，使用属性名 + 对象运行时 HashCode
        /// </summary>
        private static string BuildHandlerKey(string rootPropertyName, object target)
        {
            return $"{rootPropertyName}:{RuntimeHelpers.GetHashCode(target)}";
        }

        #endregion
    }
}
