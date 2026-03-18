import { useState, useEffect } from 'react';
import {
    useAppStore,
    onMachineVM_OnNewAlarm,
    onMachineVM_OnNewInfo,
    AlarmPayload
} from '../store/generatedStore';
import { AlertTriangle, Info, X, CheckCircle2 } from 'lucide-react';

export default function GlobalAlert() {
    const machine = useAppStore(s => s.machineVM);
    const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // Auto-open modals when new events are pushed from backend
    useEffect(() => {
        const unsubAlarm = onMachineVM_OnNewAlarm((payload: AlarmPayload) => {
            setIsAlarmModalOpen(true);
        });
        const unsubInfo = onMachineVM_OnNewInfo((payload: AlarmPayload) => {
            setIsInfoModalOpen(true);
        });

        return () => {
            unsubAlarm();
            unsubInfo();
        };
    }, []);

    // When backend clears flags, close modals if they are open
    useEffect(() => {
        if (!machine?.hasActiveAlarm) setIsAlarmModalOpen(false);
    }, [machine?.hasActiveAlarm]);

    useEffect(() => {
        if (!machine?.hasActiveInfo) setIsInfoModalOpen(false);
    }, [machine?.hasActiveInfo]);

    return (
        <>
            {/* Floating Indicators */}
            <div className="fixed top-4 right-4 z-50 flex gap-3">
                {machine?.hasActiveInfo && !isInfoModalOpen && (
                    <button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-500/20 border border-blue-500 text-blue-400 px-3 py-2 rounded-full shadow-lg shadow-blue-500/20 animate-pulse hover:bg-blue-500/30 transition-colors"
                    >
                        <Info size={18} />
                        <span className="text-sm font-semibold">有新提示</span>
                    </button>
                )}

                {machine?.hasActiveAlarm && !isAlarmModalOpen && (
                    <button
                        onClick={() => setIsAlarmModalOpen(true)}
                        className="flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-500 px-3 py-2 rounded-full shadow-lg shadow-red-500/20 animate-pulse hover:bg-red-500/30 transition-colors"
                    >
                        <AlertTriangle size={18} />
                        <span className="text-sm font-semibold">机器报警</span>
                    </button>
                )}
            </div>

            {/* Alarm Modal */}
            {isAlarmModalOpen && machine?.currentAlarm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    {/* Pulsing red background effect behind the modal */}
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />

                    <div className="relative w-full max-w-md bg-slate-900 border-2 border-red-500 rounded-2xl shadow-2xl shadow-red-500/20 overflow-hidden transform transition-all">
                        <div className="bg-red-500/20 px-6 py-4 flex items-center justify-between border-b mx-[-2px] mt-[-2px] border-red-500/50">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-red-500 animate-bounce" size={28} />
                                <h2 className="text-xl font-bold text-red-500">机器报警 ({machine.currentAlarm.level})</h2>
                            </div>
                            <button onClick={() => setIsAlarmModalOpen(false)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-1.5 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-300 text-sm mb-2">
                                <span className="text-slate-500">时间: </span>
                                {new Date(machine.currentAlarm.timestamp).toLocaleString()}
                            </p>
                            <p className="text-slate-400 text-sm mb-4">
                                <span className="text-slate-500">标识: </span>
                                {machine.currentAlarm.alarmId}
                            </p>

                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                                <p className="text-white text-lg font-medium leading-relaxed">
                                    {machine.currentAlarm.message}
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end mt-4">
                                <button
                                    onClick={() => setIsAlarmModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                                >
                                    隐藏 (保留报警提示)
                                </button>
                                <button
                                    onClick={() => alert('请在设备操作面板上复位硬件报警，或从后端系统执行逻辑。')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    <CheckCircle2 size={18} />
                                    我已知晓
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {isInfoModalOpen && machine?.currentInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-slate-900 border border-blue-500/50 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden">
                        <div className="bg-blue-500/10 px-6 py-4 flex items-center justify-between border-b border-blue-500/30">
                            <div className="flex items-center gap-3">
                                <Info className="text-blue-400" size={24} />
                                <h2 className="text-lg font-bold text-blue-400">系统提示</h2>
                            </div>
                            <button onClick={() => setIsInfoModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-300 text-sm mb-4">
                                <span className="text-slate-500">时间: </span>
                                {new Date(machine.currentInfo.timestamp).toLocaleString()}
                            </p>

                            <div className="bg-slate-800 rounded-lg p-4 mb-6">
                                <p className="text-white text-base">
                                    {machine.currentInfo.message}
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end mt-4">
                                <button
                                    onClick={() => setIsInfoModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                                >
                                    关闭提示
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
