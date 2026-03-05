import CncViewer from './components/CncViewer';
import RectTurntable from './components/RectTurntable';
import ProductionBoard from './components/ProductionBoard';
import { Cpu } from 'lucide-react';
import { useEffect } from 'react';
import { useAppStore } from './store/generatedStore';

export default function App() {
    const updateStateFromBackend = useAppStore(s => s.updateStateFromBackend);
    const initFullState = useAppStore(s => s.initFullState);

    useEffect(() => {
        if ((window as any).chrome?.webview) {
            const handler = (event: any) => {
                const data = event.data;
                if (data?.type === 'STATE_SYNC' && data.payload) {
                    updateStateFromBackend(data.payload.vmName, data.payload.propName, data.payload.value);
                } else if (data?.type === 'INIT_RESPONSE' && data.state) {
                    initFullState(data.state);
                }
            };
            (window as any).chrome.webview.addEventListener('message', handler);
            return () => (window as any).chrome.webview.removeEventListener('message', handler);
        }
    }, [updateStateFromBackend, initFullState]);

    return (
        <div className="w-full h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden">
            {/* 顶部状态栏 */}
            <header className="flex-shrink-0 h-12 bg-slate-900/80 border-b border-slate-800/50 flex items-center px-5 gap-3 backdrop-blur-sm">
                <Cpu size={20} className="text-cyan-400" />
                <h1 className="text-sm font-bold tracking-wide text-slate-100">
                    工业监控面板
                    <span className="text-cyan-400 ml-1.5">Industrial Monitor</span>
                </h1>
                <div className="flex-1" />
                <div className="text-[11px] text-slate-500 font-mono">
                    Powered by HybridApp.Core
                </div>
            </header>

            {/* 主内容区域 — 左右结构布局 */}
            <main className="flex-1 grid grid-cols-[1fr_600px] gap-4 p-4 min-h-0 overflow-hidden">
                {/* 左侧: CNC 刀具路径仿真 */}
                <div className="min-h-0 min-w-0">
                    <CncViewer />
                </div>

                {/* 右侧: 上下布局 (上矩形转盘，下生产看板) */}
                <div className="flex flex-col gap-4 min-h-0 overflow-hidden">
                    {/* 矩形转盘 */}
                    <div className="flex-1 shrink-0 overflow-auto flex items-center justify-center">
                        <RectTurntable />
                    </div>

                    {/* 生产数据看板 */}
                    <div className="shrink-0">
                        <ProductionBoard />
                    </div>
                </div>
            </main>
        </div>
    );
}
