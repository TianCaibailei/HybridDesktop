using System;

namespace HybridApp.Core.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class SyncViewModelAttribute : Attribute
    {
        public string Name { get; }
        public SyncViewModelAttribute(string name)
        {
            Name = name;
        }
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class SyncPropertyAttribute : Attribute
    {
    }
}
