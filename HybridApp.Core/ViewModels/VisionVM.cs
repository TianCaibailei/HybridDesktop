using System;
using System.Runtime.CompilerServices;
using HybridApp.Core.Attributes;

namespace HybridApp.Core.ViewModels
{
    [SyncViewModel("VisionVM")]
    public class VisionVM : SyncViewModelBase
    {
        private int _exposure;
        private double _gain;
        private bool _isRunning;

        public VisionVM() : base("VisionVM")
        {
        }

        public int Exposure
        {
            get => _exposure;
            set { SetProperty(ref _exposure, value); }
        }

        public double Gain
        {
            get => _gain;
            set { SetProperty(ref _gain, value); }
        }

        public bool IsRunning
        {
            get => _isRunning;
            set { SetProperty(ref _isRunning, value); }
        }
    }
}
