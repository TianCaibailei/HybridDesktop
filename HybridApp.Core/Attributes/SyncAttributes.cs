using System;

namespace HybridApp.Core.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class SyncViewModelAttribute : Attribute
    {
        public string Name { get; }
        public string Description { get; set; }
        
        public SyncViewModelAttribute(string name)
        {
            Name = name;
        }
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class SyncPropertyAttribute : Attribute
    {
        public string Description { get; set; }
    }

    /// <summary>
    /// 标记可被前端通过命令总线调用的方法。
    /// 方法参数将通过反射自动从前端 JSON 中解析为强类型。
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class SyncCommandAttribute : Attribute
    {
        /// <summary>
        /// 方法功能描述，将被生成为前端 TypeScript 函数的 JSDoc 注释
        /// </summary>
        public string Description { get; set; }
    }

    /// <summary>
    /// 标记可被前端监听的后端事件。
    /// 当后端触发该事件时，会自动通过 WebSocket/WebView 将事件及参数推送到前端。
    /// </summary>
    [AttributeUsage(AttributeTargets.Event)]
    public class SyncEventAttribute : Attribute
    {
        /// <summary>
        /// 事件功能描述，将被生成为前端 TypeScript 函数的 JSDoc 注释
        /// </summary>
        public string Description { get; set; }
    }
}
