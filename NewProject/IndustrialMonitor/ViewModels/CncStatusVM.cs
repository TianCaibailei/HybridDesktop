using HybridApp.Core.Attributes;
using HybridApp.Core.ViewModels;
using System.Text.Json.Serialization;

namespace IndustrialMonitor.ViewModels
{
    [SyncViewModel("CncStatusVM", Description = "CNC设备运行状态数据，包含进给、主轴、各轴位置等")]
    public class CncStatusVM : SyncViewModelBase
    {
        private double _feedRate;
        private double _spindleSpeed;
        private int _toolNumber;
        private string _runningState = "就绪";
        
        private double _posX;
        private double _posY;
        private double _posZ;
        private double _posA;
        private double _posB;
        private double _posC;

        public CncStatusVM() : base("CncStatusVM") { }

        [SyncProperty(Description = "进给速度 (mm/min)")]
        public double FeedRate
        {
            get => _feedRate;
            set => SetProperty(ref _feedRate, value);
        }

        [SyncProperty(Description = "主轴转速 (RPM)")]
        public double SpindleSpeed
        {
            get => _spindleSpeed;
            set => SetProperty(ref _spindleSpeed, value);
        }

        [SyncProperty(Description = "当前刀号")]
        public int ToolNumber
        {
            get => _toolNumber;
            set => SetProperty(ref _toolNumber, value);
        }

        [SyncProperty(Description = "运转状态 (如：运行中、停止、进给保持、报警)")]
        public string RunningState
        {
            get => _runningState;
            set => SetProperty(ref _runningState, value);
        }

        [SyncProperty(Description = "X轴位置")]
        public double PosX
        {
            get => _posX;
            set => SetProperty(ref _posX, value);
        }

        [SyncProperty(Description = "Y轴位置")]
        public double PosY
        {
            get => _posY;
            set => SetProperty(ref _posY, value);
        }

        [SyncProperty(Description = "Z轴位置")]
        public double PosZ
        {
            get => _posZ;
            set => SetProperty(ref _posZ, value);
        }

        [SyncProperty(Description = "A轴位置")]
        public double PosA
        {
            get => _posA;
            set => SetProperty(ref _posA, value);
        }

        [SyncProperty(Description = "B轴位置")]
        public double PosB
        {
            get => _posB;
            set => SetProperty(ref _posB, value);
        }

        [SyncProperty(Description = "C轴位置")]
        public double PosC
        {
            get => _posC;
            set => SetProperty(ref _posC, value);
        }
    }
}
