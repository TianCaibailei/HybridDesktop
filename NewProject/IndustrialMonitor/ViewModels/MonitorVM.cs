using HybridApp.Core.Attributes;
using HybridApp.Core.ViewModels;

namespace IndustrialMonitor.ViewModels
{
    [SyncViewModel("MonitorVM", Description = "生产监控指标数据，包含投入产出、运行时间和稼动率等")]
    public class MonitorVM : SyncViewModelBase
    {
        private int _inputCount = 0;
        private int _outputCount = 0;
        private string _runningTime = "00:00:00";
        private string _downTime = "00:00:00";
        private double _utilization = 0;
        private bool _isRunning = false;

        public MonitorVM() : base("MonitorVM") { }

        [SyncProperty(Description = "投入数")]
        public int InputCount
        {
            get => _inputCount;
            set => SetProperty(ref _inputCount, value);
        }

        [SyncProperty(Description = "产出数")]
        public int OutputCount
        {
            get => _outputCount;
            set => SetProperty(ref _outputCount, value);
        }

        [SyncProperty(Description = "运行时间（HH:mm:ss格式）")]
        public string RunningTime
        {
            get => _runningTime;
            set => SetProperty(ref _runningTime, value);
        }

        [SyncProperty(Description = "停机时间（HH:mm:ss格式）")]
        public string DownTime
        {
            get => _downTime;
            set => SetProperty(ref _downTime, value);
        }

        [SyncProperty(Description = "稼动率（0-100）")]
        public double Utilization
        {
            get => _utilization;
            set => SetProperty(ref _utilization, value);
        }

        [SyncProperty(Description = "是否正在生产")]
        public bool IsRunning
        {
            get => _isRunning;
            set => SetProperty(ref _isRunning, value);
        }
    }
}
