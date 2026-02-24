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
}
