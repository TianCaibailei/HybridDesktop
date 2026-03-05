using HybridApp.Core.Attributes;
using HybridApp.Core.ViewModels;
using System.Collections.ObjectModel;

namespace IndustrialMonitor.ViewModels
{
    public class StationItem : ObservableObject
    {
        private int _state = 0;
        private string _toolTip = string.Empty;

        [SyncProperty(Description = "工位状态（0=空闲,1=待加工,2=加工中,3=加工完成,4=未知）")]
        public int State { get => _state; set => Set(ref _state, value); }

        [SyncProperty(Description = "工位提示信息")]
        public string ToolTip { get => _toolTip; set => Set(ref _toolTip, value); }
    }

    [SyncViewModel("TurntableVM", Description = "矩形转盘控制，支持X/Y方向独立工位数和旋转方向控制")]
    public class TurntableVM : SyncViewModelBase
    {
        private int _step = 0;
        private int _xCount = 4;
        private int _yCount = 3;
        private ObservableCollection<StationItem> _stations = new ObservableCollection<StationItem>();
        private int _rotateDirection = 1; // 1=正转(顺时针转), -1=反转(逆时针转)
        private int _zeroStationIndex = 2; // 0号标记位置（物理工位索引）左上角为0，按顺时针递增，可以修改0号工位的位置以适应不同的机械结构
        private bool _isClockwise = false; // 默认顺时针排布（确定工位序号的排布方式）

        public TurntableVM() : base("TurntableVM") 
        {
            Random random = new Random(23);
            // 初始化64个预设工位
            for (int i = 0; i < 64; i++)
            {
                _stations.Add(new StationItem() { State = random.Next(), ToolTip = $"测试提示{random.Next()}"});
            }
        }

        [SyncProperty(Description = "当前步进位置")]
        public int Step
        {
            get => _step;
            set => SetProperty(ref _step, value);
        }

        [SyncProperty(Description = "X方向单边工位数")]
        public int XCount
        {
            get => _xCount;
            set => SetProperty(ref _xCount, value);
        }

        [SyncProperty(Description = "Y方向单边工位数")]
        public int YCount
        {
            get => _yCount;
            set => SetProperty(ref _yCount, value);
        }

        [SyncProperty(Description = "0号工位（同心圆标记）的物理索引位置")]
        public int ZeroStationIndex
        {
            get => _zeroStationIndex;
            set => SetProperty(ref _zeroStationIndex, value);
        }

        [SyncProperty(Description = "工位排布是否为顺时针方向")]
        public bool IsClockwise
        {
            get => _isClockwise;
            set => SetProperty(ref _isClockwise, value);
        }

        [SyncProperty(Description = "所有工位的状态及提示信息集合")]
        public ObservableCollection<StationItem> Stations
        {
            get => _stations;
            set => SetProperty(ref _stations, value);
        }

        [SyncProperty(Description = "旋转方向：1=正转(顺时针运转), -1=反转(逆时针运转)")]
        public int RotateDirection
        {
            get => _rotateDirection;
            set => SetProperty(ref _rotateDirection, value);
        }

        /// <summary>
        /// 正转一步
        /// </summary>
        [SyncCommand(Description = "正转一步")]
        public void RotateForward()
        {
            Step = Step + 1;
        }

        /// <summary>
        /// 反转一步
        /// </summary>
        [SyncCommand(Description = "反转一步")]
        public void RotateBackward()
        {
            Step = Step - 1;
        }

        /// <summary>
        /// 设置自动旋转方向
        /// </summary>
        [SyncCommand(Description = "设置自动旋转方向：0=停止, 1=正转, -1=反转")]
        public void SetAutoRotate(int direction)
        {
            RotateDirection = direction;
        }

        /// <summary>
        /// 设置指定工位的状态
        /// </summary>
        [SyncCommand(Description = "设置指定工位的状态")]
        public void SetStationState(int index, int state)
        {
            if (index >= 0 && index < _stations.Count)
            {
                _stations[index].State = state;
            }
        }

        /// <summary>
        /// 设置指定工位的提示文本
        /// </summary>
        [SyncCommand(Description = "设置指定工位的ToolTip提示文本")]
        public void SetStationToolTip(int index, string toolTip)
        {
            if (index >= 0 && index < _stations.Count)
            {
                _stations[index].ToolTip = toolTip;
            }
        }
    }
}
