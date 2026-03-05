import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/generatedStore';
import { Box, FileCode2 } from 'lucide-react';

export default function CncViewer() {
    const cncPath = useAppStore((s) => s.cncPathVM);
    const currentFile = cncPath?.currentFile || '';
    const gCodeContent = cncPath?.gCodeContent || '';
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // 判断是否在 WebView2 环境下
    const isWebView2 = typeof (window as any).chrome?.webview !== 'undefined';
    const iframeSrc = isWebView2 ? 'http://cnc-simulator.app/index.html' : '/cnc-simulator/index.html';

    // 当 gCodeContent 变化时，通过 postMessage 发送给 CNC iframe
    useEffect(() => {
        if (!gCodeContent || !iframeRef.current?.contentWindow) return;

        // 由于无法确定 iframe 内部的 React 什么时候真正挂载了全局函数
        // 采用稍微延迟并重试发送几遍的策略
        const sendGCode = () => {
            try {
                iframeRef.current?.contentWindow?.postMessage({
                    type: 'LOAD_GCODE',
                    name: currentFile || 'external.nc',
                    content: gCodeContent
                }, '*');
                console.log(`[CncViewer] Sent GCode content to iframe. Length: ${gCodeContent.length}`);
            } catch (e) {
                console.warn('Failed to send GCode to CNC iframe:', e);
            }
        };

        // 尝试多次发送确保到达 (0.5s, 1s, 2s)
        const t1 = setTimeout(sendGCode, 500);
        const t2 = setTimeout(sendGCode, 1000);
        const t3 = setTimeout(sendGCode, 2000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [gCodeContent, currentFile]);

    return (
        <div className="bg-slate-800/80 rounded-2xl p-5 shadow-2xl border border-slate-700/50 backdrop-blur-sm h-full flex flex-col">
            {/* 标题栏 */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700/50">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Box className="text-emerald-400" size={18} />
                    CNC 刀具路径仿真
                </h2>
                {currentFile && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                        <FileCode2 size={12} />
                        <span className="truncate max-w-32">{currentFile}</span>
                    </div>
                )}
            </div>

            {/* CNC iframe 区域 */}
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-700/50 bg-[#1a1a1a] relative min-h-0">
                <iframe
                    ref={iframeRef}
                    src={iframeSrc}
                    className="w-full h-full border-0"
                    title="CNC Simulator"
                    sandbox="allow-scripts allow-same-origin"
                    onLoad={() => {
                        // iframe 加载完毕，静默等待或做基础标记
                        console.log('[CncViewer] iframe Loaded.');
                    }}
                />
                {!currentFile && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none bg-slate-900/50">
                        <Box size={48} className="opacity-20 mb-3" />
                        <p className="text-sm opacity-50">等待加载NC文件...</p>
                        <p className="text-xs opacity-30 mt-1">由后端C#推送GCode内容</p>
                    </div>
                )}
            </div>
        </div>
    );
}
