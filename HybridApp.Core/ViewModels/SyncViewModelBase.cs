using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading;
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
        public string VmType { get; }
        
        private Action<string, string, string, object> _syncAction;
        private SynchronizationContext _syncContext; // 用于跨线程触发 PropertyChanged 事件

        /// <summary>
        /// 存储每个被监听属性的事件处理器引用，确保可以正确 -= 取消订阅。
        /// Key = "属性路径:对象HashCode"，Value = handler 引用
        /// </summary>
        private readonly Dictionary<string, PropertyChangedEventHandler> _watchedHandlers = new Dictionary<string, PropertyChangedEventHandler>();
        
        /// <summary>
        /// 存储集合变更事件处理器引用
        /// </summary>
        private readonly Dictionary<string, NotifyCollectionChangedEventHandler> _watchedCollectionHandlers = new Dictionary<string, NotifyCollectionChangedEventHandler>();

        /// <summary>
        /// 防止循环引用导致的无限递归
        /// </summary>
        private readonly HashSet<object> _watchedObjects = new(ReferenceEqualityComparer.Instance);

        protected SyncViewModelBase(string vmName, string vmType = null)
        {
            VmName = vmName;
            VmType = vmType ?? ResolveVmType(GetType());
        }

        private static string ResolveVmType(Type type)
        {
            var attr = (SyncViewModelAttribute)Attribute.GetCustomAttribute(
                type,
                typeof(SyncViewModelAttribute),
                inherit: true);
            return attr?.Name ?? type.Name;
        }

        /// <summary>
        /// 挂载同步回调动作，并自动初始化深度监听
        /// </summary>
        /// <param name="syncAction">同步回调动作</param>
        /// <param name="syncContext">同步上下文，用于跨线程触发 PropertyChanged。不传则自动使用 SynchronizationContext.Current</param>
        public void AttachSyncAction(Action<string, string, string, object> syncAction, SynchronizationContext syncContext = null)
        {
            _syncAction = syncAction;
            _syncContext = syncContext ?? SynchronizationContext.Current;
            InitDeepSync();
        }

        public void AttachSyncAction(Action<string, string, object> syncAction, SynchronizationContext syncContext = null)
        {
            AttachSyncAction((_, vmName, propName, value) => syncAction?.Invoke(vmName, propName, value), syncContext);
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
            // 如果提供了同步上下文且当前不在 UI 线程，则切换到 UI 线程触发事件
            // 这确保 WinForms DataBindings 等 UI 绑定不会跨线程报错
            if (_syncContext != null && _syncContext != SynchronizationContext.Current)
            {
                _syncContext.Post((a)=> {
                    OnPropertyChanged(propertyName);
                    // 触发双向同步回调
                    _syncAction?.Invoke(VmType, VmName, propertyName, value);
                },null);
            }
            else
            {
                OnPropertyChanged(propertyName);

                // 触发双向同步回调
                _syncAction?.Invoke(VmType, VmName, propertyName, value);
            }
            

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
            void Sync()
            {
                var propInfo = this.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
                if (propInfo == null) return;

                var value = propInfo.GetValue(this);
                OnPropertyChanged(propertyName);
                _syncAction?.Invoke(VmType, VmName, propertyName, value);
            }

            if (_syncContext != null && _syncContext != SynchronizationContext.Current)
            {
                _syncContext.Post(_ => Sync(), null);
            }
            else
            {
                Sync();
            }
        }

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        /// <summary>
        /// 使用反射自动将前端传来的 JsonElement 转换为属性对应的类型并赋值。
        /// 内部做了容错处理，确保前端非法传值不会导致后端崩溃。
        /// 支持基于路径的深度属性修改（如 "Config.InternalCamera.ResolutionX" 或 "Materials[0].Priority"）。
        /// </summary>
        public virtual void SetPropertyByName(string propPath, JsonElement value)
        {
            try
            {
                if (string.IsNullOrEmpty(propPath)) return;

                // 按 . 和 [ ] 拆分路径，例如 "Materials[0].Priority" -> ["Materials", "0", "Priority"]
                var pathParts = propPath.Split(new[] { '.', '[', ']' }, StringSplitOptions.RemoveEmptyEntries);
                if (pathParts.Length == 0) return;

                object currentTarget = this;
                PropertyInfo targetProp = null;
                object targetCollection = null;
                int targetIndex = -1;

                // 遍历路径节点，直到倒数第一个（即真正的目标属性/元素）
                for (int i = 0; i < pathParts.Length - 1; i++)
                {
                    var part = pathParts[i];

                    // 尝试作为集合索引
                    if (int.TryParse(part, out int index))
                    {
                        if (currentTarget is System.Collections.IList list)
                        {
                            currentTarget = list[index];
                            if (currentTarget == null) return; // 提前退出，防止接下来的解引用空异常
                            continue;
                        }
                    }

                    // 作为普通属性
                    var prop = currentTarget.GetType().GetProperty(part, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop == null) return; // 路径不合法

                    var nextTarget = prop.GetValue(currentTarget);
                    if (nextTarget == null) return; // 对象尚未实例化
                    
                    currentTarget = nextTarget;
                }

                var lastPart = pathParts[pathParts.Length - 1];
                
                // 判断最后一个节点是属性还是索引
                if (int.TryParse(lastPart, out targetIndex) && currentTarget is System.Collections.IList finalCollection)
                {
                    targetCollection = finalCollection;
                }
                else
                {
                    targetProp = currentTarget.GetType().GetProperty(lastPart, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (targetProp == null || !targetProp.CanWrite) return;
                }

                var rawJson = value.GetRawText();
                Type convertType;

                if (targetCollection != null)
                {
                    // 获取集合元素的类型
                    var collectionType = targetCollection.GetType();
                    convertType = collectionType.IsArray 
                        ? collectionType.GetElementType() 
                        : collectionType.GetGenericArguments().FirstOrDefault() ?? typeof(object);
                }
                else
                {
                    convertType = targetProp.PropertyType;
                }

                // 反序列化
                var convertedValue = JsonSerializer.Deserialize(rawJson, convertType, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // 赋值并在当前对象上下文内尝试触发事件
                if (targetCollection != null)
                {
                    // 对 IList<T> 的具体元素进行赋值
                    ((System.Collections.IList)targetCollection)[targetIndex] = convertedValue;
                }
                else
                {
                    targetProp.SetValue(currentTarget, convertedValue);
                    
                    // 如果这个对象自身就是 INotifyPropertyChanged，我们需要手动触发它的 PropertyChanged。
                    // 但是因为我们现在可能在它外部反向赋值（除非它是 this），如果没有公共的 RaisePropertyChanged，
                    // 它往往不会触发通知。所以更好的做法是：目标属性的 Setter 通常会自己触发 OnPropertyChanged。
                }

                // 为了保险，并且保证前端收到反馈（虽然现在我们提倡仅靠这部分进行纯写入）：
                // 如果这是 Root 上的属性赋值，因为其自身 Setter 会触发 OnPropertyChanged，我们不需要过多干预。
                // 如果是深层级（如 Config.Camera.Res），Camera.ResolutionX 内部 setter 如果有 Set(ref, val) 它自己也会触发通知，
                // 然后由于我们实现了 WatchProperty(RootName, target)，它会最终调用 this.ManualSync().
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[SyncError] Failed to set deep property '{VmName}.{propPath}': {ex.Message}");
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
