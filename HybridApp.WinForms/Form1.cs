using HybridApp.Core.Channels;
using HybridApp.Core.Generators;
using HybridApp.Core.ViewModels;
using Microsoft.Web.WebView2.Core;
using System.Text.Json;

namespace HybridApp.WinForms;

public partial class Form1 : Form
{
    private ViewModelManager _vmManager = new ViewModelManager();
    private VisionVM _visionVM;
    private ComplexVM _complexVM;

    private ImageStreamManager _imageStreamManager;
    private FloatDataChannel _floatDataChannel;
    private bool _isRunning = true;


    public Form1()
    {
        InitializeComponent();
    }

    private void Form1_Load(object sender, EventArgs e)
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
            MessageBox.Show($"WebView2 ��ʼ��ʧ��: {ex.Message}");
        }
    }

    private void WebView_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            // 1. ��ʼ�� ViewModel ��������ע������ VM
            _vmManager.Attach(webView.CoreWebView2);

            // ��Ӧǰ�˶� Buffer ���������
            webView.CoreWebView2.WebMessageReceived += (s, ev) =>
            {
                try
                {
                    using var doc = JsonDocument.Parse(ev.WebMessageAsJson);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("type", out var t) && t.GetString() == "REQUEST_BUFFER_HANDLE")
                    {
                        //string channelName = root.GetProperty("channelName").GetString();
                        string? channelName = root.TryGetProperty("channelName", out var cn) ? cn.GetString() : "";
                        if (channelName == "sine-wave" && _floatDataChannel != null)
                        {
                            _floatDataChannel.ResendHandle(); // ��Ҫ�� FloatDataChannel ���Ӹ÷���
                        }
                    }
                }
                catch { }
            };

            _visionVM = new VisionVM();
            _complexVM = new ComplexVM();

            _vmManager.Register(_visionVM);
            _vmManager.Register(_complexVM);

            propertyGridComplex.SelectedObject = _complexVM.Config;
            listBoxLogs.DataSource = _complexVM.Logs;
            listBoxLogs.DisplayMember = "Message";

            _visionVM.PropertyChanged += (s, ev) =>
            {
                if (ev.PropertyName == nameof(VisionVM.Exposure))
                    trackBarExposure.Value = (int)_visionVM.Exposure;
            };

            // ���� DataContext��ʹ XAML �ܷ������� VM
            this.DataContext = new { Vision = _visionVM, Complex = _complexVM };

            // 2. ���� TS Store (Debug only)
#if DEBUG
            var generator = new TsStoreGenerator();
            string projectRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", ".."));
            string frontendPath = Path.Combine(projectRoot, "HybridApp.Frontend", "src", "store", "generatedStore.ts");
            generator.Generate(frontendPath);
#endif

            // 3. ͼ����
            _imageStreamManager = new ImageStreamManager();
            _imageStreamManager.OnImageRequested = (channelName) => GenerateRandomImage(640, 480);
            _imageStreamManager.Attach(webView.CoreWebView2);

            // 4. ����
            webView.CoreWebView2.Navigate("http://localhost:5173");

            //webView.CoreWebView2.DOMContentLoaded += (s, ev) =>
            //{
            if (_floatDataChannel == null)
            {
                _floatDataChannel = new FloatDataChannel(webView.CoreWebView2, "sine-wave", 1024);
                _ = StartSineWaveGenerator();
            }
            // ��������ͬ��ȫ��״̬
            _vmManager.SendFullState();
            //};
        }
        else
        {
            MessageBox.Show($"WebView2 ��ʼ��ʧ��: {e.InitializationException?.Message}");
        }
    }

    // �ƻ���α���룬��ϸ���裩��
    // 1. �������� * �߶� * 4 �����ػ�������ÿ���� 4 �ֽڣ�BGRA/ARGB����
    // 2. ʹ�� Random ������ػ�������
    // 3. ʹ�� WinForms/GDI+ �� Bitmap�����ظ�ʽʹ�� 32 λ��Format32bppArgb����
    // 4. ʹ�� LockBits ��ȡ Bitmap ���ڴ�ָ�벢ʹ�� Marshal.Copy ���ֽڸ��ƽ�ȥ��
    // 5. ����λͼ��ʹ�� Bitmap.Save ��λͼ�� JPEG ����д�� MemoryStream��
    // 6. ���� MemoryStream ���ֽ����飬ȷ����ȷ�ͷ����з��й���Դ��LockBits��Bitmap��Stream����
    private byte[] GenerateRandomImage(int width, int height)
    {
        int stride = width * 4;
        byte[] pixels = new byte[height * stride];
        new Random().NextBytes(pixels);

        // ʹ�� GDI+ Bitmap ����ԭʼ����д�����ڴ�
        using (var bmp = new System.Drawing.Bitmap(width, height, System.Drawing.Imaging.PixelFormat.Format32bppArgb))
        {
            var rect = new System.Drawing.Rectangle(0, 0, width, height);
            var bmpData = bmp.LockBits(rect, System.Drawing.Imaging.ImageLockMode.WriteOnly, bmp.PixelFormat);
            try
            {
                // ֱ�ӽ����ؿ�����λͼ���ڴ���
                System.Runtime.InteropServices.Marshal.Copy(pixels, 0, bmpData.Scan0, pixels.Length);
            }
            finally
            {
                bmp.UnlockBits(bmpData);
            }

            using (var stream = new MemoryStream())
            {
                // ����Ϊ JPEG
                bmp.Save(stream, System.Drawing.Imaging.ImageFormat.Jpeg);
                return stream.ToArray();
            }
        }
    }

    private async Task StartSineWaveGenerator()
    {
        while (_isRunning)
        {
            if (_floatDataChannel != null)
            {
                float[] data = new float[1024];
                double time = DateTime.Now.Ticks / 10000000.0;
                for (int i = 0; i < data.Length; i++)
                    data[i] = (float)Math.Sin(time * 10.0 + i * 0.1);
                _floatDataChannel.Push(data);
            }
            await Task.Delay(16);
        }
    }

    private void timer1_Tick(object sender, EventArgs e)
    {
        if (_visionVM != null)
            trackBarExposure.Value = (int)_visionVM.Exposure;
    }

    private void trackBarExposure_Scroll(object sender, EventArgs e)
    {
        if (_visionVM != null)
           _visionVM.Exposure = trackBarExposure.Value;
    }

    private void btnAddLog_Click(object sender, EventArgs e)
    {
        if (_complexVM != null)
        {
            _complexVM.Logs.Add(new LogEntry { Message = $"WinForm Log {DateTime.Now:HH:mm:ss}", Level = "Info" });
        }
    }
}
