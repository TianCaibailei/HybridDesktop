using System;
using System.Runtime.CompilerServices;
using System.Text.Json;
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

        public void SetPropertyByName(string propName, object value)
        {
            switch (propName)
            {
                case nameof(Exposure):
                    if (value is JsonElement jeE) Exposure = jeE.GetInt32();
                    else Exposure = Convert.ToInt32(value);
                    break;
                case nameof(Gain):
                    if (value is JsonElement jeG) Gain = jeG.GetDouble();
                    else Gain = Convert.ToDouble(value);
                    break;
                case nameof(IsRunning):
                    if (value is JsonElement jeR) IsRunning = jeR.GetBoolean();
                    else IsRunning = Convert.ToBoolean(value);
                    break;
            }
        }
    }
}
