using System;
using HybridApp.Core.Attributes;

namespace HybridApp.Core.ViewModels
{
    [SyncViewModel("VisionVM", Description = "相机视觉控制模块，处理曝光、增益等实时参数")]
    public class VisionVM : SyncViewModelBase
    {
        private int _exposure = 10;
        private double _gain = 1.0;
        private bool _isRunning = false;

        public VisionVM() : base("VisionVM") { }

        [SyncProperty(Description = "曝光时间（毫秒）")]
        public int Exposure
        {
            get => _exposure;
            set => SetProperty(ref _exposure, value);
        }

        [SyncProperty(Description = "模拟增益倍数")]
        public double Gain
        {
            get => _gain;
            set => SetProperty(ref _gain, value);
        }

        [SyncProperty(Description = "是否正在运行图像处理算法")]
        public bool IsRunning
        {
            get => _isRunning;
            set => SetProperty(ref _isRunning, value);
        }

        /// <summary>
        /// 演示无返回值的命令：切换运行状态
        /// </summary>
        [SyncCommand(Description = "切换运行状态")]
        public void ToggleRunning(string reason)
        {
            IsRunning = !IsRunning;
            System.Diagnostics.Debug.WriteLine($"[Command] ToggleRunning called, reason: {reason}, IsRunning={IsRunning}");
        }

        /// <summary>
        /// 演示有返回值的命令：获取当前状态摘要
        /// </summary>
        [SyncCommand(Description = "获取当前视觉模块状态摘要")]
        public string GetStatusSummary(string prefix)
        {
            return $"{prefix}: Exposure={Exposure}, Gain={Gain}, IsRunning={IsRunning}";
        }
    }
}
