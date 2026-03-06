using System;
using System.Collections.ObjectModel;
using HybridApp.Core.Attributes;
using HybridApp.Core.ViewModels;

namespace IndustrialMonitor.ViewModels
{
    public class ToolItem : ObservableObject
    {
        private int _id;
        private string _name = "";
        private double _maxLifetime = 50.0;
        private double _usedLifetime = 0.0;
        private int _switchCount = 0;
        private int _maxSwitchCount = 1000;
        private string _lastReplacedAt = "-";
        private string _lastCalibratedAt = "-";
        private double _calibrationInterval = 8.0;
        private double _compensationD = 0.0;
        private double _compensationH = 0.0;

        [SyncProperty(Description = "刀号")]
        public int Id { get => _id; set => Set(ref _id, value); }

        [SyncProperty(Description = "别名")]
        public string Name { get => _name; set => Set(ref _name, value); }
        
        [SyncProperty(Description = "寿命上限 (小时)")]
        public double MaxLifetime { get => _maxLifetime; set => Set(ref _maxLifetime, value); }

        [SyncProperty(Description = "当前已使用时长 (小时)")]
        public double UsedLifetime { get => _usedLifetime; set => Set(ref _usedLifetime, value); }

        [SyncProperty(Description = "已切换次数")]
        public int SwitchCount { get => _switchCount; set => Set(ref _switchCount, value); }

        [SyncProperty(Description = "最大允许切换次数")]
        public int MaxSwitchCount { get => _maxSwitchCount; set => Set(ref _maxSwitchCount, value); }

        [SyncProperty(Description = "上一次更换刀具时间")]
        public string LastReplacedAt { get => _lastReplacedAt; set => Set(ref _lastReplacedAt, value); }

        [SyncProperty(Description = "上一次对刀时间")]
        public string LastCalibratedAt { get => _lastCalibratedAt; set => Set(ref _lastCalibratedAt, value); }

        [SyncProperty(Description = "对刀时间间隔 (小时)")]
        public double CalibrationInterval { get => _calibrationInterval; set => Set(ref _calibrationInterval, value); }

        [SyncProperty(Description = "刀补D (全局)")]
        public double CompensationD { get => _compensationD; set => Set(ref _compensationD, value); }

        [SyncProperty(Description = "刀补H (全局)")]
        public double CompensationH { get => _compensationH; set => Set(ref _compensationH, value); }
    }

    [SyncViewModel("ToolVM", Description = "刀具管理数据模型")]
    public class ToolVM : SyncViewModelBase
    {
        private ObservableCollection<ToolItem> _tools = new ObservableCollection<ToolItem>();
        private bool _hasLifeModule = true;
        private bool _hasCalibrationModule = true;
        private bool _hasCompensationModule = true;

        public ToolVM() : base("ToolVM")
        {
            // 初始化36把刀数据
            for (int i = 1; i <= 36; i++)
            {
                _tools.Add(new ToolItem
                {
                    Id = i,
                    Name = $"刀具 {i}",
                    MaxLifetime = 50.0,
                    UsedLifetime = Math.Round(new Random().NextDouble() * 40, 1),
                    SwitchCount = new Random().Next(0, 500),
                    MaxSwitchCount = 1000,
                    LastReplacedAt = DateTime.Now.AddDays(-new Random().Next(1, 10)).ToString("yyyy-MM-dd HH:mm"),
                    LastCalibratedAt = DateTime.Now.AddHours(-new Random().Next(1, 48)).ToString("yyyy-MM-dd HH:mm"),
                    CalibrationInterval = 8.0,
                    CompensationD = 0.0,
                    CompensationH = 0.0
                });
            }
        }

        [SyncProperty(Description = "36把刀的集合")]
        public ObservableCollection<ToolItem> Tools
        {
            get => _tools;
            set => SetProperty(ref _tools, value);
        }

        [SyncProperty(Description = "是否拥有寿命管理模块权限")]
        public bool HasLifeModule
        {
            get => _hasLifeModule;
            set => SetProperty(ref _hasLifeModule, value);
        }

        [SyncProperty(Description = "是否拥有对刀管理模块权限")]
        public bool HasCalibrationModule
        {
            get => _hasCalibrationModule;
            set => SetProperty(ref _hasCalibrationModule, value);
        }

        [SyncProperty(Description = "是否拥有刀补管理模块权限")]
        public bool HasCompensationModule
        {
            get => _hasCompensationModule;
            set => SetProperty(ref _hasCompensationModule, value);
        }

        [SyncCommand(Description = "修改指定刀具的各项可编辑参数")]
        public FormResult ApplyToolChanges(int index, ToolItem draftData)
        {
            if (index < 0 || index >= _tools.Count)
            {
                return new FormResult { Success = false, Message = "无效的刀具索引" };
            }

            var target = _tools[index];

            target.Name = draftData.Name;

            if (draftData.MaxLifetime <= 0) return new FormResult { Success = false, Message = "寿命上限必须大于0" };
            if (draftData.MaxSwitchCount <= 0) return new FormResult { Success = false, Message = "允许切换次数必须大于0" };
            if (draftData.CalibrationInterval <= 0) return new FormResult { Success = false, Message = "对刀间隔必须大于0" };

            if (_hasLifeModule)
            {
                target.MaxLifetime = draftData.MaxLifetime;
                target.MaxSwitchCount = draftData.MaxSwitchCount;
            }

            if (_hasCalibrationModule)
            {
                target.CalibrationInterval = draftData.CalibrationInterval;
            }

            if (_hasCompensationModule)
            {
                target.CompensationD = draftData.CompensationD;
                target.CompensationH = draftData.CompensationH;
            }

            return new FormResult { Success = true, Message = "保存成功" };
        }

        [SyncCommand(Description = "批量粘贴并应用多个刀具的数据")]
        public FormResult PasteToolChanges(int[] indices, ToolItem templateData)
        {
            if (indices == null || indices.Length == 0)
            {
                return new FormResult { Success = false, Message = "未选择目标刀具" };
            }

            foreach (var idx in indices)
            {
                if (idx < 0 || idx >= _tools.Count) continue;
                var target = _tools[idx];

                if (_hasLifeModule)
                {
                    target.MaxLifetime = templateData.MaxLifetime;
                    target.MaxSwitchCount = templateData.MaxSwitchCount;
                }

                if (_hasCalibrationModule)
                {
                    target.CalibrationInterval = templateData.CalibrationInterval;
                }

                if (_hasCompensationModule)
                {
                    target.CompensationD = templateData.CompensationD;
                    target.CompensationH = templateData.CompensationH;
                }
            }

            return new FormResult { Success = true, Message = $"已成功应用到 {indices.Length} 把刀具" };
        }

        [SyncCommand(Description = "批量手动对刀，更新最后对刀时间")]
        public FormResult CalibrateTools(int[] indices)
        {
            if (!_hasCalibrationModule)
            {
                return new FormResult { Success = false, Message = "未激活对刀管理模块" };
            }

            if (indices == null || indices.Length == 0)
            {
                return new FormResult { Success = false, Message = "未选择目标刀具" };
            }

            string nowStr = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            foreach (var idx in indices)
            {
                if (idx >= 0 && idx < _tools.Count)
                {
                    _tools[idx].LastCalibratedAt = nowStr;
                }
            }

            return new FormResult { Success = true, Message = $"已完 {indices.Length} 把刀具的重新对刀" };
        }
    }
}
