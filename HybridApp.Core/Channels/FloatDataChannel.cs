using Microsoft.Web.WebView2.Core;
using System;
using System.IO;
using System.Runtime.InteropServices;

namespace HybridApp.Core.Channels
{
    public class FloatDataChannel
    {
        private readonly CoreWebView2 _webView;
        public string ChannelName { get; }
        private readonly CoreWebView2SharedBuffer _sharedBuffer;

        public FloatDataChannel(CoreWebView2 webView, string channelName, int maxElements)
        {
            _webView = webView;
            ChannelName = channelName;
            
            ulong size = (ulong)(maxElements * sizeof(float));
            _sharedBuffer = _webView.Environment.CreateSharedBuffer(size);
            
            // Post shared buffer to script
            _webView.PostSharedBufferToScript(_sharedBuffer, CoreWebView2SharedBufferAccess.ReadOnly, ChannelName);
        }

        public void Push(float[] data)
        {
            using (var stream = _sharedBuffer.OpenStream())
            {
                byte[] byteData = new byte[data.Length * sizeof(float)];
                Buffer.BlockCopy(data, 0, byteData, 0, byteData.Length);
                stream.Write(byteData, 0, byteData.Length);
            }
            
            _webView.PostWebMessageAsString($"SHARED_MEM_READY:{ChannelName}:{data.Length}");
        }
    }
}
