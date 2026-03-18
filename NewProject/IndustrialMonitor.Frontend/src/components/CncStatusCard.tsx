import { useAppStore } from '../store/generatedStore';
import { Settings, Cpu, Settings2, Power, Orbit } from 'lucide-react';

export default function CncStatusCard() {
    const cncStatus = useAppStore((s) => s.cncStatusVM);
    const feedRate = cncStatus?.feedRate ?? 0;
    const spindleSpeed = cncStatus?.spindleSpeed ?? 0;
    const toolNumber = cncStatus?.toolNumber ?? 0;
    const runningState = cncStatus?.runningState ?? '未知';

    const posX = cncStatus?.posX ?? 0;
    const posY = cncStatus?.posY ?? 0;
    const posZ = cncStatus?.posZ ?? 0;
    const posA = cncStatus?.posA ?? 0;
    const posB = cncStatus?.posB ?? 0;
    const posC = cncStatus?.posC ?? 0;

    return (
        <div className="bg-slate-800/80 rounded-2xl p-3 shadow-2xl border border-slate-700/50 backdrop-blur-sm mt-2">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700/50">
                <Settings2 className="text-indigo-400" size={16} />
                CNC 实时状态
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-1.5">
                <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/30 flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                        <Orbit className="text-blue-400" size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400">进给速度</div>
                        <div className="text-sm font-bold text-slate-200 font-mono">{feedRate.toFixed(1)} <span className="text-[10px] text-slate-500 font-sans">mm/min</span></div>
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/30 flex items-center gap-3">
                    <div className="p-1.5 bg-orange-500/10 rounded-md">
                        <Settings className="text-orange-400" size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400">主轴转速</div>
                        <div className="text-sm font-bold text-slate-200 font-mono">{spindleSpeed.toFixed(0)} <span className="text-[10px] text-slate-500 font-sans">RPM</span></div>
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/30 flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-500/10 rounded-md">
                        <Cpu className="text-emerald-400" size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400">当前刀号</div>
                        <div className="text-sm font-bold text-slate-200 font-mono">T{toolNumber.toString().padStart(2, '0')}</div>
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/30 flex items-center gap-3">
                    <div className="p-1.5 bg-purple-500/10 rounded-md">
                        <Power className="text-purple-400" size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400">运转状态</div>
                        <div className="text-sm font-bold text-slate-200">{runningState}</div>
                    </div>
                </div>
            </div>

            {/* 轴位置信息 */}
            <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-700/50">
                <div className="text-xs font-semibold text-slate-400 mb-2 px-1">轴坐标位置</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <AxisPosition label="X" value={posX} color="text-rose-400" />
                    <AxisPosition label="Y" value={posY} color="text-emerald-400" />
                    <AxisPosition label="Z" value={posZ} color="text-amber-400" />
                    <AxisPosition label="A" value={posA} color="text-cyan-400" />
                    <AxisPosition label="B" value={posB} color="text-fuchsia-400" />
                    <AxisPosition label="C" value={posC} color="text-blue-400" />
                </div>
            </div>
        </div>
    );
}

function AxisPosition({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="flex flex-col items-center bg-slate-800/50 rounded p-1.5 border border-slate-700/30">
            <span className={`text-[10px] font-bold ${color} mb-0.5`}>{label}</span>
            <span className="text-xs font-mono text-slate-300">{value.toFixed(3)}</span>
        </div>
    );
}
