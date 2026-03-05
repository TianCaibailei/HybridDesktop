using System;
using System.Collections.ObjectModel;
using System.Threading;
using System.Windows.Forms;
using HybridApp.Core.Attributes;
using HybridApp.Core.ViewModels;

namespace IndustrialMonitor.ViewModels
{
    public class MaterialItem : ObservableObject
    {
        private string _stationState = "空";
        private int _station = 1;
        private string _priority = "★★★";
        private double _blankLength = 141.0;
        private double _blankWidth = 60.0;
        private string _ncFile = "上料程序开门.nc";
        private double _centerDivide = 0;
        private double _offsetZ = 1;
        private double _angle = 0;
        private double _productLength = 40.0;
        private double _productWidth = 57.3;
        private int _arrayCount = 1;
        private double _arraySpacing = 6.5;

        [SyncProperty(Description = "工位状态")]
        public string StationState { get => _stationState; set => Set(ref _stationState, value); }
        
        [SyncProperty(Description = "工位序号")]
        public int Station { get => _station; set => Set(ref _station, value); }
        
        [SyncProperty(Description = "优先级")]
        public string Priority { get => _priority; set => Set(ref _priority, value); }
        
        [SyncProperty(Description = "毛长")]
        public double BlankLength { get => _blankLength; set => Set(ref _blankLength, value); }
        
        [SyncProperty(Description = "毛宽")]
        public double BlankWidth { get => _blankWidth; set => Set(ref _blankWidth, value); }
        
        [SyncProperty(Description = "加工文件")]
        public string NcFile { get => _ncFile; set => Set(ref _ncFile, value); }
        
        [SyncProperty(Description = "分中")]
        public double CenterDivide { get => _centerDivide; set => Set(ref _centerDivide, value); }
        
        [SyncProperty(Description = "偏值Z")]
        public double OffsetZ { get => _offsetZ; set => Set(ref _offsetZ, value); }
        
        [SyncProperty(Description = "角度")]
        public double Angle { get => _angle; set => Set(ref _angle, value); }
        
        [SyncProperty(Description = "产品长")]
        public double ProductLength { get => _productLength; set => Set(ref _productLength, value); }
        
        [SyncProperty(Description = "产品宽")]
        public double ProductWidth { get => _productWidth; set => Set(ref _productWidth, value); }
        
        [SyncProperty(Description = "阵列数")]
        public int ArrayCount { get => _arrayCount; set => Set(ref _arrayCount, value); }
        
        [SyncProperty(Description = "阵列间")]
        public double ArraySpacing { get => _arraySpacing; set => Set(ref _arraySpacing, value); }
    }

    [SyncViewModel("MaterialVM", Description = "物料信息展示数据层")]
    public class MaterialVM : SyncViewModelBase
    {
        private ObservableCollection<MaterialItem> _materials = new ObservableCollection<MaterialItem>();

        public MaterialVM() : base("MaterialVM")
        {
            // 初始化一些 Mock 数据
            Random rnd = new Random();
            string[] stars = { "★", "★★", "★★★", "★★★★", "★★★★★" };
            
            for (int i = 1; i <= 14; i++)
            {
                _materials.Add(new MaterialItem
                {
                    Station = i,
                    StationState = "空",
                    Priority = stars[rnd.Next(stars.Length)],
                    BlankLength = 141,
                    BlankWidth = 60,
                    NcFile = i == 10 ? "机械臂换料后分中程序.nc" : "上料前程序开门.nc",
                    CenterDivide = i == 10 ? 1 : 0,
                    OffsetZ = i == 10 ? -1 : 1,
                    Angle = 0,
                    ProductLength = 40,
                    ProductWidth = 57.3,
                    ArrayCount = 1,
                    ArraySpacing = 6.5
                });
            }
        }

        [SyncProperty(Description = "各个工位的物料详情集合")]
        public ObservableCollection<MaterialItem> Materials
        {
            get => _materials;
            set => SetProperty(ref _materials, value);
        }

        [SyncCommand(Description = "弹出文件选择对话框选择NC文件")]
        public string SelectNcFile()
        {
            string selectedPath = null;
            
            // OpenFileDialog must run in STA thread
            var thread = new Thread(() =>
            {
                using (var ofd = new OpenFileDialog())
                {
                    ofd.Filter = "NC Files (*.nc)|*.nc|All Files (*.*)|*.*";
                    ofd.Title = "Select NC File";
                    if (ofd.ShowDialog() == DialogResult.OK)
                    {
                        selectedPath = ofd.FileName;
                    }
                }
            });
            
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            thread.Join();

            return selectedPath ?? string.Empty;
        }
    }
}
