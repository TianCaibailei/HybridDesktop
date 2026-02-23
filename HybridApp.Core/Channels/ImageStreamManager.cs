using Microsoft.Web.WebView2.Core;
using System;
using System.IO;

namespace HybridApp.Core.Channels
{
    public class ImageStreamManager
    {
        public Func<string, byte[]?>? OnImageRequested { get; set; }

        public void Attach(CoreWebView2 webView)
        {
            webView.AddWebResourceRequestedFilter("http://hybrid.vision/*", CoreWebView2WebResourceContext.Image);
            webView.WebResourceRequested += (sender, args) =>
            {
                var uri = new Uri(args.Request.Uri);
                if (uri.Host == "hybrid.vision")
                {
                    var channelName = uri.AbsolutePath.Trim('/');
                    var imageData = OnImageRequested?.Invoke(channelName);
                    if (imageData != null)
                    {
                        var stream = new MemoryStream(imageData);
                        args.Response = webView.Environment.CreateWebResourceResponse(stream, 200, "OK", "Content-Type: image/jpeg");
                    }
                    else
                    {
                        args.Response = webView.Environment.CreateWebResourceResponse(null, 404, "Not Found", "");
                    }
                }
            };
        }
    }
}
