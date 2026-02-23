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
        private VisionVM _visionVM;
        private ImageStreamManager _imageStreamManager;
        private FloatDataChannel _floatDataChannel;
        private bool _isRunning = true;

        public MainWindow()
        {
            InitializeComponent();
            InitializeAsync();
            Closed += (s, e) => _isRunning = false;
        }

        private async void InitializeAsync()
        {
            await webView.EnsureCoreWebView2Async();

            // 1. Create VM
            _visionVM = new VisionVM();
            _visionVM.AttachSyncAction((vmName, propName, value) =>
            {
                var message = new
                {
                    type = "STATE_SYNC",
                    payload = new
                    {
                        vmName,
                        propName,
                        value
                    }
                };
                string json = JsonSerializer.Serialize(message);
                webView.CoreWebView2.PostWebMessageAsJson(json);
            });

            // 2. Generate TS Store (Debug only)
#if DEBUG
            var generator = new TsStoreGenerator();
            // Assuming Frontend path relative to Wpf project output directory
            // bin/Debug/net8.0-windows/../../../.. -> Project Root
            string projectRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", ".."));
            string frontendPath = Path.Combine(projectRoot, "HybridApp.Frontend", "src", "store", "generatedStore.ts");
            generator.Generate(frontendPath);
#endif

            // 3. Image Stream
            _imageStreamManager = new ImageStreamManager();
            _imageStreamManager.OnImageRequested = (channelName) =>
            {
                return GenerateRandomImage(640, 480);
            };
            _imageStreamManager.Attach(webView.CoreWebView2);

            // 4. Float Data Channel
            // Note: SharedBuffer requires WebView2 Runtime 116+
            try 
            {
                _floatDataChannel = new FloatDataChannel(webView.CoreWebView2, "sine-wave", 1024);
                _ = StartSineWaveGenerator();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to initialize FloatDataChannel: {ex.Message}");
            }

            // 5. Navigate
            webView.CoreWebView2.Navigate("http://localhost:5173");
        }

        private byte[] GenerateRandomImage(int width, int height)
        {
            int stride = width * 4;
            byte[] pixels = new byte[height * stride];
            Random rand = new Random();
            rand.NextBytes(pixels);

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
                    {
                        data[i] = (float)Math.Sin(time * 10.0 + i * 0.1);
                    }
                    _floatDataChannel.Push(data);
                }
                await Task.Delay(16); // ~60fps
            }
        }
    }
}
