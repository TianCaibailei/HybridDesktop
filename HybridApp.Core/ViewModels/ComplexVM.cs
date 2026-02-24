using System;
using System.Collections.Generic;
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

    [SyncViewModel("ComplexVM", Description = "处理复杂嵌套对象和集合数据的示例 ViewModel")]
    public class ComplexVM : SyncViewModelBase
    {
        private DeviceConfig _config = new DeviceConfig();
        private Dictionary<string, string> _statusInfo = new Dictionary<string, string> 
        { 
            { "System", "Ready" }, 
            { "Connection", "Stable" } 
        };

        public ComplexVM() : base("ComplexVM") 
        {
            // 监听嵌套对象的属性变化，实现自动 ManualSync
            _config.PropertyChanged += (s, e) => ManualSync(nameof(Config));
            _config.InternalCamera.PropertyChanged += (s, e) => ManualSync(nameof(Config));
        }

        [SyncProperty(Description = "设备全局配置信息")]
        public DeviceConfig Config
        {
            get => _config;
            set 
            {
                if (_config != null)
                {
                    _config.PropertyChanged -= (s, e) => ManualSync(nameof(Config));
                    _config.InternalCamera.PropertyChanged -= (s, e) => ManualSync(nameof(Config));
                }
                
                if (SetProperty(ref _config, value))
                {
                    if (_config != null)
                    {
                        _config.PropertyChanged += (s, e) => ManualSync(nameof(Config));
                        _config.InternalCamera.PropertyChanged += (s, e) => ManualSync(nameof(Config));
                    }
                }
            }
        }

        [SyncProperty(Description = "系统状态字典信息")]
        public Dictionary<string, string> StatusInfo
        {
            get => _statusInfo;
            set => SetProperty(ref _statusInfo, value);
        }
    }
}
