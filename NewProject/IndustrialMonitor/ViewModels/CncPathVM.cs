using HybridApp.Core.Attributes;
using HybridApp.Core.ViewModels;

namespace IndustrialMonitor.ViewModels
{
    [SyncViewModel("CncPathVM", Description = "CNC刀具路径控制，管理NC文件的加载和切换")]
    public class CncPathVM : SyncViewModelBase
    {
        private string _currentFile = "";
        private string _gcodeContent = "";

        public CncPathVM() : base("CncPathVM") { }

        [SyncProperty(Description = "当前加载的NC文件名")]
        public string CurrentFile
        {
            get => _currentFile;
            set => SetProperty(ref _currentFile, value);
        }

        [SyncProperty(Description = "当前NC文件的GCode内容")]
        public string GCodeContent
        {
            get => _gcodeContent;
            set => SetProperty(ref _gcodeContent, value);
        }

        /// <summary>
        /// 从指定路径加载NC文件
        /// </summary>
        [SyncCommand(Description = "从指定路径加载NC文件")]
        public string LoadNcFile(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                    return $"文件不存在: {filePath}";

                CurrentFile = Path.GetFileName(filePath);
                GCodeContent = File.ReadAllText(filePath, System.Text.Encoding.GetEncoding("GB2312"));
                return $"已加载: {CurrentFile}";
            }
            catch (Exception ex)
            {
                return $"加载失败: {ex.Message}";
            }
        }
    }
}
