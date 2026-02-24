using Microsoft.Web.WebView2.Core;
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;

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
            
            // 初始推送句柄给前端
            SendHandleToScript();
        }

        public void ResendHandle()
        {
            SendHandleToScript();
        }

        private void SendHandleToScript()
        {
            // 通过 additionalData 传递频道名称，方便前端 Hook 识别
            // 重要：此参数必须是合法的 JSON 字符串（即字符串需要带引号），所以必须 Serialize
            string jsonMetadata = JsonSerializer.Serialize(ChannelName);
            _webView.PostSharedBufferToScript(_sharedBuffer, CoreWebView2SharedBufferAccess.ReadWrite, jsonMetadata);
        }

        public void Push(float[] data)
        {
            using (var stream = _sharedBuffer.OpenStream())
            {
                byte[] byteData = new byte[data.Length * sizeof(float)];
                Buffer.BlockCopy(data, 0, byteData, 0, byteData.Length);
                stream.Write(byteData, 0, byteData.Length);
            }
            
            // 发送就绪信号，包含数据长度
            _webView.PostWebMessageAsString($"SHARED_MEM_READY:{ChannelName}:{data.Length}");
        }
    }
}
