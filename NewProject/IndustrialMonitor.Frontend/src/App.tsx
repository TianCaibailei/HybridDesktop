import CncViewer from './components/CncViewer';
import RectTurntable from './components/RectTurntable';
import ProductionBoard from './components/ProductionBoard';
import CncStatusCard from './components/CncStatusCard';
import MaterialPage from './pages/MaterialPage';
import ToolPage from './pages/ToolPage';
import DataStatisticsPage from './pages/DataStatisticsPage';
import GlobalAlert from './components/GlobalAlert';
import { Cpu, LayoutDashboard, List, Wrench, BarChart2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppStore } from './store/generatedStore';

export default function App() {
    const updateStateFromBackend = useAppStore(s => s.updateStateFromBackend);
    const initFullState = useAppStore(s => s.initFullState);
    const [currentRoute, setCurrentRoute] = useState<'monitor' | 'material' | 'tool' | 'statistics'>('monitor');

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
            // 注册完监听器后，主动向后端请求同步全量数据，解决 F5 刷新时序问题
            (window as any).chrome.webview.postMessage({ type: 'INIT_REQUEST' });
            return () => (window as any).chrome.webview.removeEventListener('message', handler);
        }
    }, [updateStateFromBackend, initFullState]);

    return (
        <div className="w-full h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden">
            <GlobalAlert />

            {/* 顶部状态栏 */}
            <header className="flex-shrink-0 h-14 bg-slate-900/80 border-b border-slate-800/50 flex flex-nowrap items-center px-6 gap-6 backdrop-blur-sm z-50">
                <div className="flex items-center gap-3">
                    <Cpu size={22} className="text-cyan-400" />
                    <h1 className="text-base font-bold tracking-wide text-slate-100 flex items-baseline gap-1.5">
                        拓界监控面板
                        <span className="text-cyan-400 text-xs opacity-80">Industrial Monitor</span>
                    </h1>
                </div>

                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/50 ml-4">
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${currentRoute === 'monitor' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}
                        onClick={() => setCurrentRoute('monitor')}
                    >
                        <LayoutDashboard size={16} /> 控制面板
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${currentRoute === 'material' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}
                        onClick={() => setCurrentRoute('material')}
                    >
                        <List size={16} /> 物料信息
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${currentRoute === 'tool' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}
                        onClick={() => setCurrentRoute('tool')}
                    >
                        <Wrench size={16} /> 设备刀具
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${currentRoute === 'statistics' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}
                        onClick={() => setCurrentRoute('statistics')}
                    >
                        <BarChart2 size={16} /> 数据统计
                    </button>
                </div>

                <div className="flex-1" />
                <div className="text-[11px] text-slate-500 font-mono">
                    Powered by HybridApp.Core
                </div>
            </header>

            {/* 主内容区域 */}
            <main className="flex-1 min-h-0 overflow-hidden relative">
                {currentRoute === 'monitor' ? (
                    <div className="w-full h-full grid grid-cols-[1fr_600px] gap-4 p-4">
                        {/* 左侧: CNC 刀具路径仿真 */}
                        <div className="min-h-0 min-w-0">
                            <CncViewer />
                        </div>

                        {/* 右侧: 上下布局 (上矩形转盘，下生产看板及状态卡片) */}
                        <div className="flex justify-start flex-col gap-2 min-h-0 overflow-hidden">
                            {/* 矩形转盘 */}
                            <div className="flex-1 shrink-0 overflow-auto flex items-center justify-center">
                                <RectTurntable />
                            </div>

                            {/* 生产数据看板 & CNC状态 */}
                            <div className="shrink-0">
                                <ProductionBoard />
                                <CncStatusCard />
                            </div>
                        </div>
                    </div>
                ) : currentRoute === 'material' ? (
                    <div className="w-full h-full p-4">
                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
                            <MaterialPage />
                        </div>
                    </div>
                ) : currentRoute === 'tool' ? (
                    <div className="w-full h-full p-4">
                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
                            <ToolPage />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full p-4">
                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
                            <DataStatisticsPage />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
