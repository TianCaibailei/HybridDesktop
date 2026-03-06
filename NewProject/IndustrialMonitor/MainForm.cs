using HybridApp.Core.Generators;
using HybridApp.Core.ViewModels;
using IndustrialMonitor.ViewModels;
using Microsoft.Web.WebView2.Core;
using System.Text;

namespace IndustrialMonitor;

public partial class MainForm : Form
{
    private ViewModelManager _vmManager = new ViewModelManager();
    private MonitorVM _monitorVM = new MonitorVM();
    private TurntableVM _turntableVM = new TurntableVM();
    private CncPathVM _cncPathVM = new CncPathVM();
    private MaterialVM _materialVM = new MaterialVM();
    private ToolVM _toolVM = new ToolVM();

    public MainForm()
    {
        InitializeComponent();
        // 关键步骤：注册 CodePages 编码提供程序
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
    }

    private void MainForm_Load(object sender, EventArgs e)
    {
        InitializeAsync();
    }

    private async void InitializeAsync()
    {
        try
        {
            webView.CoreWebView2InitializationCompleted += WebView_CoreWebView2InitializationCompleted;
            await webView.EnsureCoreWebView2Async(null);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"WebView2 初始化失败: {ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private void WebView_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (!e.IsSuccess)
        {
            MessageBox.Show($"WebView2 初始化失败: {e.InitializationException?.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        // 1. 挂载 ViewModel 管理器
        _vmManager.Attach(webView.CoreWebView2);

        // 2. 注册所有 ViewModel
        _vmManager.Register(_monitorVM);
        _vmManager.Register(_turntableVM);
        _vmManager.Register(_cncPathVM);
        _vmManager.Register(_materialVM);
        _vmManager.Register(_toolVM);

        // 3. 生成 TS Store (Debug only)
#if DEBUG
        var generator = new TsStoreGenerator();
        string projectRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", ".."));
        string frontendPath = Path.Combine(projectRoot, "IndustrialMonitor.Frontend", "src", "store", "generatedStore.ts");
        if (Directory.Exists(Path.GetDirectoryName(frontendPath)))
        {
            generator.Generate(frontendPath, typeof(Program).Assembly);
        }
#endif

        // 4. 设置虚拟域名映射
        // 主前端页面
        string distFolderPath = Path.Combine(Application.StartupPath, "dist");
        if (!Directory.Exists(distFolderPath))
        {
            // 开发时 dist 可能位于前端项目目录
            string devDistPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "IndustrialMonitor.Frontend", "dist"));
            if (Directory.Exists(devDistPath))
                distFolderPath = devDistPath;
        }

        if (!Directory.Exists(distFolderPath))
        {
            MessageBox.Show($"找不到前端界面文件！请先编译前端项目。\n预期路径: {distFolderPath}", "警告", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "industrial-monitor.app",
            distFolderPath,
            CoreWebView2HostResourceAccessKind.Allow
        );

        // CNC 模拟器（位于前端 dist/cnc-simulator/ 子目录中）
        string cncDistPath = Path.Combine(distFolderPath, "cnc-simulator");
        if (Directory.Exists(cncDistPath))
        {
            webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "cnc-simulator.app",
                cncDistPath,
                CoreWebView2HostResourceAccessKind.Allow
            );
        }

        // 5. 导航到主页面
        webView.CoreWebView2.Navigate("http://industrial-monitor.app/index.html");

        // 6. 移除旧的后端主动推送状态逻辑
        // 因为 WebView 导航完成时，前端 React JS 可能还没挂载，从而造成数据丢失。
        // 现在改为前端挂载 useEffect 后通过 POST INIT_REQUEST 主动向后端拉取（见 App.tsx）。
    }

    private void btnLoadNc_Click(object sender, EventArgs e)
    {
        using (OpenFileDialog ofd = new OpenFileDialog())
        {
            ofd.Filter = "NC Files (*.nc;*.gcode;*.txt)|*.nc;*.gcode;*.txt|All files (*.*)|*.*";
            if (ofd.ShowDialog() == DialogResult.OK)
            {
                var result = _cncPathVM.LoadNcFile(ofd.FileName);
                if (result.StartsWith("加载失败"))
                {
                    MessageBox.Show(result, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }
    }

    private void btnRotateFwd_Click(object sender, EventArgs e)
    {
        _turntableVM.RotateForward();
    }

    private void btnRotateRev_Click(object sender, EventArgs e)
    {
        _turntableVM.RotateBackward();
    }

    private void btnAddInput_Click(object sender, EventArgs e)
    {
        _monitorVM.InputCount += 10;
        UpdateUtilization();
    }

    private void btnAddOutput_Click(object sender, EventArgs e)
    {
        _monitorVM.OutputCount += 10;
        UpdateUtilization();
    }

    private void UpdateUtilization()
    {
        if (_monitorVM.InputCount > 0)
        {
            _monitorVM.Utilization = Math.Round((double)_monitorVM.OutputCount / _monitorVM.InputCount * 100, 1);
        }
    }
}
