import { useAppStore } from '../store/generatedStore';
import { Activity, ArrowUpRight, ArrowDownRight, Clock, Pause, Play, BarChart3, Zap } from 'lucide-react';

export default function ProductionBoard() {
    const monitor = useAppStore((s) => s.monitorVM);
    const inputCount = monitor?.inputCount ?? 0;
    const outputCount = monitor?.outputCount ?? 0;
    const runningTime = monitor?.runningTime ?? '00:00:00';
    const downTime = monitor?.downTime ?? '00:00:00';
    const utilization = monitor?.utilization ?? 0;
    const isRunning = monitor?.isRunning ?? false;

    // 稼动率圆环参数
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (utilization / 100) * circumference;

    // 良率计算
    const yieldRate = inputCount > 0 ? ((outputCount / inputCount) * 100).toFixed(1) : '0.0';

    return (
        <div className="bg-slate-800/80 rounded-2xl p-4 shadow-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col">
            {/* 标题栏 */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700/50">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="text-cyan-400" size={18} />
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

            {/* 稼动率圆环 */}
            <div className="flex items-center justify-center py-4 mb-3">
                <div className="relative">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        {/* 底色环 */}
                        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
                        {/* 进度环 */}
                        <circle
                            cx="60" cy="60" r={radius}
                            fill="none"
                            stroke={utilization >= 80 ? '#22c55e' : utilization >= 60 ? '#eab308' : '#ef4444'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            transform="rotate(-90 60 60)"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{utilization.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 -mt-0.5">稼动率%</span>
                    </div>
                </div>
            </div>

            {/* 指标卡片网格 */}
            <div className="grid grid-cols-3 gap-3">
                {/* 投入数 */}
                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">投入数</span>
                        <ArrowUpRight size={14} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{inputCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 mt-1">PCS</div>
                </div>

                {/* 产出数 */}
                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">产出数</span>
                        <ArrowDownRight size={14} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{outputCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 mt-1">PCS</div>
                </div>

                {/* 运行时间 */}
                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">运行时间</span>
                        <Play size={14} className="text-cyan-400" />
                    </div>
                    <div className="text-lg font-bold text-cyan-300 font-mono">{runningTime}</div>
                </div>

                {/* 停机时间 */}
                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">停机时间</span>
                        <Pause size={14} className="text-red-400" />
                    </div>
                    <div className="text-lg font-bold text-red-300 font-mono">{downTime}</div>
                </div>

                {/* 良率 */}
                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">良率</span>
                        <Activity size={14} className="text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-purple-300 font-mono">{yieldRate}%</div>
                </div>

                {/* 节拍 */}
                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">CT/UPH</span>
                        <Zap size={14} className="text-yellow-400" />
                    </div>
                    <div className="text-lg font-bold text-yellow-300 font-mono">
                        {outputCount > 0 ? (parseTimeToSeconds(runningTime) / outputCount).toFixed(1) : '--'}
                        <span className="text-xs text-slate-500 ml-1">s</span>
                    </div>
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
