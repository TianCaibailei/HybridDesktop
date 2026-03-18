import { useAppStore, onMonitorVM_UtilizationWarning } from '../store/generatedStore';
import { Activity, ArrowUpRight, ArrowDownRight, Clock, Pause, Play, BarChart3, Zap } from 'lucide-react';
import { useEffect } from 'react';

export default function ProductionBoard() {
    const monitor = useAppStore((s) => s.monitorVM);
    const inputCount = monitor?.inputCount ?? 0;
    const outputCount = monitor?.outputCount ?? 0;
    const runningTime = monitor?.runningTime ?? '00:00:00';
    const downTime = monitor?.downTime ?? '00:00:00';
    const utilization = monitor?.utilization ?? 0;
    const isRunning = monitor?.isRunning ?? false;

    // 独立注册后端事件监听
    useEffect(() => {
        const unsubscribe = onMonitorVM_UtilizationWarning((msg: string) => {
            // 此处用原生的 alert 演示。实际项目中可换成 antd 的 message 或 sonner 的 toast
            alert(`【后端事件通知】\n${msg}`);
        });
        return unsubscribe;
    }, []);

    // 稼动率圆环参数
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (utilization / 100) * circumference;

    // 良率计算
    const yieldRate = inputCount > 0 ? ((outputCount / inputCount) * 100).toFixed(1) : '0.0';

    return (
        <div className="bg-slate-800/80 rounded-2xl p-3 shadow-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col">
            {/* 标题栏 */}
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700/50">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="text-cyan-400" size={16} />
                    生产数据看板
                </h2>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isRunning
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    {isRunning ? '生产中' : '已停止'}
                </div>
            </div>

            {/* 指标卡片网格 */}
            <div className="grid grid-cols-3 gap-2">
                {/* 第一列：投入数 */}
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">投入数</span>
                        <ArrowUpRight size={14} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{inputCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 mt-1">PCS</div>
                </div>

                {/* 第二列：稼动率 (移动到这里) */}
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/50 flex flex-col justify-center items-center relative">
                    <div className="absolute top-2.5 left-2.5 flex items-center justify-between w-full pr-5 pointer-events-none">
                        <span className="text-slate-400 text-xs font-medium">稼动率</span>
                        <Activity size={14} className="text-emerald-400" />
                    </div>
                    <div className="relative mt-4">
                        <svg width="60" height="60" viewBox="0 0 120 120">
                            {/* 底色环 */}
                            <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
                            {/* 进度环 */}
                            <circle
                                cx="60" cy="60" r={radius}
                                fill="none"
                                stroke={utilization >= 80 ? '#22c55e' : utilization >= 60 ? '#eab308' : '#ef4444'}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                transform="rotate(-90 60 60)"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-bold text-white">{utilization.toFixed(1)}</span>
                            <span className="text-[8px] text-slate-400 -mt-0.5">%</span>
                        </div>
                    </div>
                </div>

                {/* 第三列：运行时间 */}
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">运行时间</span>
                        <Play size={14} className="text-cyan-400" />
                    </div>
                    <div className="text-lg font-bold text-cyan-300 font-mono mt-auto">{runningTime}</div>
                </div>

                {/* 第一列：产出数 */}
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">产出数</span>
                        <ArrowDownRight size={14} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{outputCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 mt-1">PCS</div>
                </div>

                {/* 第二列：CT/UPH */}
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">CT/UPH</span>
                        <Zap size={14} className="text-yellow-400" />
                    </div>
                    <div className="text-lg font-bold text-yellow-300 font-mono mt-auto">
                        {outputCount > 0 ? (parseTimeToSeconds(runningTime) / outputCount).toFixed(1) : '--'}
                        <span className="text-xs text-slate-500 ml-1">s</span>
                    </div>
                </div>

                {/* 第三列：停机时间 */}
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">停机时间</span>
                        <Pause size={14} className="text-red-400" />
                    </div>
                    <div className="text-lg font-bold text-red-300 font-mono mt-auto">{downTime}</div>
                </div>
            </div>
        </div>
    );
}

function parseTimeToSeconds(time: string): number {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
}
