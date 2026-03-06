using HybridApp.Core.Attributes;
using HybridApp.Core.ViewModels;
using System;

namespace IndustrialMonitor.ViewModels
{
    public class AlarmPayload
    {
        public string AlarmId { get; set; } = Guid.NewGuid().ToString();
        public string Level { get; set; } = "Warning"; // "Warning", "Error", "Info"
        public string Message { get; set; } = "";
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    [SyncViewModel("MachineVM", Description = "全局机器状态，负责管理整机报警和提示信息")]
    public class MachineVM : SyncViewModelBase
    {
        private bool _hasActiveAlarm;
        private bool _hasActiveInfo;
        private AlarmPayload? _currentAlarm;
        private AlarmPayload? _currentInfo;

        public MachineVM() : base("MachineVM") { }

        [SyncProperty(Description = "当前是否存在未清除的报警")]
        public bool HasActiveAlarm
        {
            get => _hasActiveAlarm;
            set => SetProperty(ref _hasActiveAlarm, value);
        }

        [SyncProperty(Description = "当前报警的详情内容")]
        public AlarmPayload? CurrentAlarm
        {
            get => _currentAlarm;
            set => SetProperty(ref _currentAlarm, value);
        }

        [SyncProperty(Description = "当前是否存在未清除的提示")]
        public bool HasActiveInfo
        {
            get => _hasActiveInfo;
            set => SetProperty(ref _hasActiveInfo, value);
        }

        [SyncProperty(Description = "当前提示的详情内容")]
        public AlarmPayload? CurrentInfo
        {
            get => _currentInfo;
            set => SetProperty(ref _currentInfo, value);
        }

        [SyncEvent(Description = "当机器发生新报警时触发")]
        public event EventHandler<AlarmPayload>? OnNewAlarm;

        [SyncEvent(Description = "当机器发生新提示时触发")]
        public event EventHandler<AlarmPayload>? OnNewInfo;

        public void TriggerTestAlarm(string level = "Error", string message = "驱动器温度过高")
        {
            var alarm = new AlarmPayload
            {
                Level = level,
                Message = message
            };
            
            CurrentAlarm = alarm;
            HasActiveAlarm = true;

            OnNewAlarm?.Invoke(this, alarm);
        }

        public void TriggerTestInfo(string message = "程序已自动进入待机模式")
        {
            var info = new AlarmPayload
            {
                Level = "Info",
                Message = message
            };
            
            CurrentInfo = info;
            HasActiveInfo = true;

            OnNewInfo?.Invoke(this, info);
        }

        public void ClearAlarm()
        {
            HasActiveAlarm = false;
            CurrentAlarm = null;
        }

        public void ClearInfo()
        {
            HasActiveInfo = false;
            CurrentInfo = null;
        }
    }
}
