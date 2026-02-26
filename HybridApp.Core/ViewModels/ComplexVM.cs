using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using HybridApp.Core.Attributes;

namespace HybridApp.Core.ViewModels
{
    /// <summary>
    /// 包含嵌套对象的可监听模型基类
    /// </summary>
    public class ObservableObject : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool Set<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    public class CameraParams : ObservableObject
    {
        private double _resolutionX = 1920;
        private double _resolutionY = 1080;

        [SyncProperty(Description = "水平分辨率")]
        public double ResolutionX { get => _resolutionX; set => Set(ref _resolutionX, value); }

        [SyncProperty(Description = "垂直分辨率")]
        public double ResolutionY { get => _resolutionY; set => Set(ref _resolutionY, value); }

        [SyncProperty(Description = "支持的拍摄模式列表")]
        public List<string> SupportedModes { get; set; } = new List<string> { "Standard", "HighSpeed", "HDR" };
    }

    public class DeviceConfig : ObservableObject
    {
        private string _modelName = "Hybrid-X1";
        public CameraParams InternalCamera { get; set; } = new CameraParams();

        [SyncProperty(Description = "设备型号名称")]
        public string ModelName { get => _modelName; set => Set(ref _modelName, value); }
    }

    /// <summary>
    /// 可观察的日志条目，用于演示 ObservableCollection 内元素变更的自动同步
    /// </summary>
    public class LogEntry : ObservableObject
    {
        private string _message = "";
        private string _level = "Info";

        [SyncProperty(Description = "日志消息")]
        public string Message { get => _message; set => Set(ref _message, value); }

        [SyncProperty(Description = "日志级别")]
        public string Level { get => _level; set => Set(ref _level, value); }
    }

    [SyncViewModel("ComplexVM", Description = "处理复杂嵌套对象和集合数据的示例 ViewModel")]
    public class ComplexVM : SyncViewModelBase
    {
        private DeviceConfig _config = new DeviceConfig();
        private Dictionary<string, string> _statusInfo = new Dictionary<string, string> 
        { 
            { "System", "Ready" }, 
            { "Connection", "Stable" } 
        };
        private ObservableCollection<LogEntry> _logs = new ObservableCollection<LogEntry>();

        public ComplexVM() : base("ComplexVM") 
        {
            // ✅ 无需任何手动订阅！
            // 基类 SyncViewModelBase 会在 AttachSyncAction 时自动递归监听所有嵌套 INPC 对象。
            // 包括 Config、Config.InternalCamera、Logs 集合及其元素的变更。
        }

        [SyncProperty(Description = "设备全局配置信息")]
        public DeviceConfig Config
        {
            get => _config;
            set => SetProperty(ref _config, value);
        }

        [SyncProperty(Description = "系统状态字典信息")]
        public Dictionary<string, string> StatusInfo
        {
            get => _statusInfo;
            set => SetProperty(ref _statusInfo, value);
        }

        /// <summary>
        /// 演示 ObservableCollection 自动同步：
        /// 增删元素、修改元素内部属性都会自动触发同步，无需手动订阅。
        /// </summary>
        [SyncProperty(Description = "运行日志列表")]
        public ObservableCollection<LogEntry> Logs
        {
            get => _logs;
            set => SetProperty(ref _logs, value);
        }
    }
}
