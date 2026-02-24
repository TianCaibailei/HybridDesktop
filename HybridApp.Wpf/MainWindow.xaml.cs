using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using HybridApp.Core.Channels;
using HybridApp.Core.Generators;
using HybridApp.Core.ViewModels;
using Microsoft.Web.WebView2.Core;

namespace HybridApp.Wpf
{
    public partial class MainWindow : Window
    {
        private ViewModelManager _vmManager = new ViewModelManager();
        private VisionVM _visionVM;
        private ComplexVM _complexVM;
        
        private ImageStreamManager _imageStreamManager;
        private FloatDataChannel _floatDataChannel;
        private bool _isRunning = true;

        public MainWindow()
        {
            InitializeComponent();
            Closed += (s, e) => _isRunning = false;
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
                MessageBox.Show($"WebView2 初始化失败: {ex.Message}");
            }
        }

        private void WebView_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
        {
            if (e.IsSuccess)
            {
                // 1. 初始化 ViewModel 管理器并注册所有 VM
                _vmManager.Attach(webView.CoreWebView2);
                
                // 响应前端对 Buffer 句柄的请求
                webView.CoreWebView2.WebMessageReceived += (s, ev) =>
                {
                    try {
                        using var doc = JsonDocument.Parse(ev.WebMessageAsJson);
                        var root = doc.RootElement;
                        if (root.TryGetProperty("type", out var t) && t.GetString() == "REQUEST_BUFFER_HANDLE")
                        {
                            string channelName = root.GetProperty("channelName").GetString();
                            if (channelName == "sine-wave" && _floatDataChannel != null)
                            {
                                _floatDataChannel.ResendHandle(); // 需要在 FloatDataChannel 增加该方法
                            }
                        }
                    } catch {}
                };
                
                _visionVM = new VisionVM();
                _complexVM = new ComplexVM();
                
                _vmManager.Register(_visionVM);
                _vmManager.Register(_complexVM);

                // 设置 DataContext，使 XAML 能访问两个 VM
                this.DataContext = new { Vision = _visionVM, Complex = _complexVM };

                // 2. 生成 TS Store (Debug only)
#if DEBUG
                var generator = new TsStoreGenerator();
                string projectRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", ".."));
                string frontendPath = Path.Combine(projectRoot, "HybridApp.Frontend", "src", "store", "generatedStore.ts");
                generator.Generate(frontendPath);
#endif

                // 3. 图像流
                _imageStreamManager = new ImageStreamManager();
                _imageStreamManager.OnImageRequested = (channelName) => GenerateRandomImage(640, 480);
                _imageStreamManager.Attach(webView.CoreWebView2);

                // 4. 导航
                webView.CoreWebView2.Navigate("http://localhost:5173");

                webView.CoreWebView2.DOMContentLoaded += (s, ev) =>
                {
                    if (_floatDataChannel == null)
                    {
                        _floatDataChannel = new FloatDataChannel(webView.CoreWebView2, "sine-wave", 1024);
                        _ = StartSineWaveGenerator();
                    }
                    // 初次握手同步全量状态
                    _vmManager.SendFullState();
                };
            }
            else
            {
                MessageBox.Show($"WebView2 初始化失败: {e.InitializationException?.Message}");
            }
        }

        private byte[] GenerateRandomImage(int width, int height)
        {
            int stride = width * 4;
            byte[] pixels = new byte[height * stride];
            new Random().NextBytes(pixels);
            var bitmap = BitmapSource.Create(width, height, 96, 96, PixelFormats.Bgra32, null, pixels, stride);
            using (var stream = new MemoryStream())
            {
                var encoder = new JpegBitmapEncoder();
                encoder.Frames.Add(BitmapFrame.Create(bitmap));
                encoder.Save(stream);
                return stream.ToArray();
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

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            InitializeAsync();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (_floatDataChannel == null)
            {
                _floatDataChannel = new FloatDataChannel(webView.CoreWebView2, "sine-wave", 1024);
                _ = StartSineWaveGenerator();
            }
        }
    }
}