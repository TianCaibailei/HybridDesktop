import React, { useState, useEffect } from 'react';
import { useAppStore, ToolItem, FormResult, ToolVM_ApplyToolChanges, ToolVM_PasteToolChanges, ToolVM_CalibrateTools } from '../store/generatedStore';
import { Wrench, List, LayoutGrid, CheckSquare, Square, Save, RotateCcw } from 'lucide-react';

const ToolRowItem = ({
    tool,
    index,
    isSelected,
    onToggleSelect,
    onApply,
    hasLife,
    hasCalibration,
    hasComp
}: any) => {
    const [draft, setDraft] = useState<ToolItem>(tool);
    useEffect(() => { setDraft(tool); }, [tool]);
    const isDirty = JSON.stringify(draft) !== JSON.stringify(tool);

    const updateField = (field: keyof ToolItem, val: any) => setDraft((d: ToolItem) => ({ ...d, [field]: val }));

    return (
        <tr className={`hover:bg-slate-700/30 transition-colors ${isSelected ? 'bg-indigo-900/20' : ''}`}>
            <td className="px-4 py-2 border-b border-slate-800/60" onClick={() => onToggleSelect(index)}>
                {isSelected ? <CheckSquare size={16} className="text-indigo-400 cursor-pointer" /> : <Square size={16} className="text-slate-500 cursor-pointer hover:text-slate-400" />}
            </td>
            <td className="px-4 py-2 border-b border-slate-800/60 font-mono text-indigo-400 text-center">{draft.id}</td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-center">
                <input type="text" className="w-24 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none text-center text-xs focus:border-indigo-500" value={draft.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="别名" />
            </td>

            {hasLife && (
                <>
                    <td className="px-2 py-2 border-b border-slate-800/60 text-center font-mono relative">
                        <div className="absolute inset-x-2 bottom-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${draft.usedLifetime >= draft.maxLifetime ? 'bg-red-500' : (draft.usedLifetime / draft.maxLifetime > 0.8 ? 'bg-amber-400' : 'bg-emerald-400')}`} style={{ width: `${Math.min((draft.usedLifetime / Math.max(draft.maxLifetime, 0.1)) * 100, 100)}%` }} />
                        </div>
                        <span className={draft.usedLifetime >= draft.maxLifetime ? 'text-red-400 font-bold' : 'text-emerald-400'}>{draft.usedLifetime?.toFixed(1) || 0}</span>
                    </td>
                    <td className="px-2 py-2 border-b border-slate-800/60 text-center">
                        <input type="number" className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none no-spinners text-center focus:border-indigo-500" value={draft.maxLifetime} onChange={(e) => updateField('maxLifetime', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td className="px-2 py-2 border-b border-slate-800/60 text-center relative font-mono">
                        <div className="absolute inset-x-2 bottom-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${draft.switchCount >= draft.maxSwitchCount ? 'bg-red-500' : (draft.switchCount / draft.maxSwitchCount > 0.8 ? 'bg-amber-400' : 'bg-indigo-400')}`} style={{ width: `${Math.min((draft.switchCount / Math.max(draft.maxSwitchCount, 1)) * 100, 100)}%` }} />
                        </div>
                        <span className={draft.switchCount >= draft.maxSwitchCount ? 'text-red-400 font-bold' : 'text-slate-300'}>{draft.switchCount}</span>
                    </td>
                    <td className="px-2 py-2 border-b border-slate-800/60 text-center">
                        <input type="number" className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none no-spinners text-center focus:border-indigo-500" value={draft.maxSwitchCount} onChange={(e) => updateField('maxSwitchCount', parseInt(e.target.value) || 0)} />
                    </td>
                    <td className="px-4 py-2 border-b border-slate-800/60 text-xs text-slate-400 whitespace-nowrap text-center">{draft.lastReplacedAt}</td>
                </>
            )}

            {hasCalibration && (
                <>
                    <td className="px-4 py-2 border-b border-slate-800/60 text-xs text-slate-400 whitespace-nowrap text-center">{draft.lastCalibratedAt}</td>
                    <td className="px-2 py-2 border-b border-slate-800/60 text-center">
                        <input type="number" className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none no-spinners text-center focus:border-indigo-500" value={draft.calibrationInterval} onChange={(e) => updateField('calibrationInterval', parseFloat(e.target.value) || 0)} />
                    </td>
                </>
            )}

            {hasComp && (
                <>
                    <td className="px-2 py-2 border-b border-slate-800/60 text-center">
                        <input type="number" step="0.001" className="w-20 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-2 py-1 outline-none no-spinners text-center focus:border-indigo-500" value={draft.compensationD} onChange={(e) => updateField('compensationD', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td className="px-2 py-2 border-b border-slate-800/60 text-center">
                        <input type="number" step="0.001" className="w-20 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-2 py-1 outline-none no-spinners text-center focus:border-indigo-500" value={draft.compensationH} onChange={(e) => updateField('compensationH', parseFloat(e.target.value) || 0)} />
                    </td>
                </>
            )}

            <td className="px-4 py-2 border-b border-slate-800/60 text-right sticky right-0 bg-slate-800/90 backdrop-blur z-10 w-24">
                <button
                    disabled={!isDirty}
                    onClick={() => onApply(index, draft)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors text-xs font-medium w-full justify-center ${isDirty ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/50' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                    <Save size={14} /> 保存
                </button>
            </td>
        </tr>
    );
};

const ToolCardItem = ({ tool, index, isSelected, onToggleSelect, onApply, hasLife, hasCalibration, hasComp }: any) => {
    const [draft, setDraft] = useState<ToolItem>(tool);
    useEffect(() => { setDraft(tool); }, [tool]);
    const isDirty = JSON.stringify(draft) !== JSON.stringify(tool);
    const updateField = (field: keyof ToolItem, val: any) => setDraft((d: ToolItem) => ({ ...d, [field]: val }));

    return (
        <div className={`bg-slate-800/60 border ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-slate-700'} rounded-xl p-4 shadow-lg flex flex-col pt-4 relative transition-all`}>
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2" onClick={() => onToggleSelect(index)}>
                    {isSelected ? <CheckSquare size={18} className="text-indigo-400 cursor-pointer" /> : <Square size={18} className="text-slate-500 cursor-pointer hover:text-slate-400" />}
                    <span className="font-mono text-lg font-bold text-slate-200">T{draft.id}</span>
                </div>
                <input type="text" className="w-24 bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded px-1 py-0.5 outline-none text-right text-xs focus:border-indigo-500" value={draft.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="别名" />
            </div>

            <div className="flex-1 flex flex-col gap-3">
                {hasLife && (
                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/50 flex flex-col gap-2">
                        <div className="flex justify-between items-center relative pb-1">
                            <span className="text-xs text-slate-400 z-10">已用时长:</span>
                            <span className={`font-mono text-sm z-10 ${draft.usedLifetime >= draft.maxLifetime ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>{draft.usedLifetime?.toFixed(1) || 0} h</span>
                            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-slate-800 rounded-full mt-1">
                                <div className={`h-full transition-all ${draft.usedLifetime >= draft.maxLifetime ? 'bg-red-500' : (draft.usedLifetime / draft.maxLifetime > 0.8 ? 'bg-amber-400' : 'bg-emerald-400')}`} style={{ width: `${Math.min((draft.usedLifetime / Math.max(draft.maxLifetime, 0.1)) * 100, 100)}%` }} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center"><span className="text-xs text-slate-400">寿命上限:</span><input type="number" className="w-16 bg-slate-800 text-slate-200 rounded px-1 py-0.5 outline-none no-spinners text-right text-xs focus:border-indigo-500" value={draft.maxLifetime} onChange={(e) => updateField('maxLifetime', parseFloat(e.target.value) || 0)} /></div>

                        <div className="h-px bg-slate-800 my-1"></div>

                        <div className="flex justify-between items-center relative pb-1">
                            <span className="text-xs text-slate-400 z-10">已切次数:</span>
                            <span className={`font-mono text-sm z-10 ${draft.switchCount >= draft.maxSwitchCount ? 'text-red-400 font-bold' : 'text-slate-300'}`}>{draft.switchCount}</span>
                            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-slate-800 rounded-full mt-1">
                                <div className={`h-full transition-all ${draft.switchCount >= draft.maxSwitchCount ? 'bg-red-500' : (draft.switchCount / draft.maxSwitchCount > 0.8 ? 'bg-amber-400' : 'bg-indigo-400')}`} style={{ width: `${Math.min((draft.switchCount / Math.max(draft.maxSwitchCount, 1)) * 100, 100)}%` }} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center"><span className="text-xs text-slate-400">最大次数:</span><input type="number" className="w-16 bg-slate-800 text-slate-200 rounded px-1 py-0.5 outline-none no-spinners text-right text-xs focus:border-indigo-500" value={draft.maxSwitchCount} onChange={(e) => updateField('maxSwitchCount', parseInt(e.target.value) || 0)} /></div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate" title={draft.lastReplacedAt}>换刀: {draft.lastReplacedAt}</div>
                    </div>
                )}

                {hasCalibration && (
                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/50 flex flex-col gap-2">
                        <div className="flex justify-between items-center"><span className="text-xs text-slate-400">对刀间隔:</span><input type="number" className="w-16 bg-slate-800 text-slate-200 rounded px-1 py-0.5 outline-none no-spinners text-right text-xs focus:border-indigo-500" value={draft.calibrationInterval} onChange={(e) => updateField('calibrationInterval', parseFloat(e.target.value) || 0)} /></div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate" title={draft.lastCalibratedAt}>校准: {draft.lastCalibratedAt}</div>
                    </div>
                )}

                {hasComp && (
                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/50 grid grid-cols-2 gap-2">
                        <div className="flex flex-col"><span className="text-[10px] text-slate-500">刀补 D</span><input type="number" step="0.001" className="bg-slate-800 text-slate-200 rounded px-1 outline-none no-spinners text-center text-xs py-1 mt-1 focus:border-indigo-500" value={draft.compensationD} onChange={(e) => updateField('compensationD', parseFloat(e.target.value) || 0)} /></div>
                        <div className="flex flex-col"><span className="text-[10px] text-slate-500">刀补 H</span><input type="number" step="0.001" className="bg-slate-800 text-slate-200 rounded px-1 outline-none no-spinners text-center text-xs py-1 mt-1 focus:border-indigo-500" value={draft.compensationH} onChange={(e) => updateField('compensationH', parseFloat(e.target.value) || 0)} /></div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-end">
                <button disabled={!isDirty} onClick={() => onApply(index, draft)} className={`w-full py-1.5 rounded transition-colors text-xs font-bold flex justify-center items-center gap-1 ${isDirty ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/50' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'}`}>
                    <Save size={14} /> 保存修改
                </button>
            </div>
        </div>
    );
};

export default function ToolPage() {
    const toolVM = useAppStore(s => s.toolVM);
    const tools: ToolItem[] = toolVM?.tools || [];

    // Auth vars
    const hasLife = toolVM?.hasLifeModule ?? false;
    const hasCalibration = toolVM?.hasCalibrationModule ?? false;
    const hasComp = toolVM?.hasCompensationModule ?? false;

    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

    const toggleSelect = (idx: number) => {
        const next = new Set(selectedIndices);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setSelectedIndices(next);
    };

    const toggleAll = () => {
        if (selectedIndices.size === tools.length && tools.length > 0) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(tools.map((_, i) => i)));
        }
    };

    const handleApply = async (index: number, draft: ToolItem) => {
        try {
            // @ts-ignore
            const result: FormResult = await ToolVM_ApplyToolChanges(index, draft);
            if (!result?.success) alert(`保存失败: ${result?.message}`);
        } catch (e) {
            console.error(e);
            alert("保存异常");
        }
    };

    const handleBatchCalibrate = async () => {
        if (!hasCalibration) return;
        if (selectedIndices.size === 0) return alert("请先勾选需要对刀的刀具");
        try {
            // @ts-ignore
            const result: FormResult = await ToolVM_CalibrateTools(Array.from(selectedIndices));
            if (result?.success) {
                // UI feedback
                setSelectedIndices(new Set());
            } else {
                alert(`操作失败: ${result?.message}`);
            }
        } catch (e) {
            console.error(e);
            alert("批量对刀异常");
        }
    };

    const handleBatchPaste = async () => {
        if (selectedIndices.size === 0) return alert("请先勾选目标刀具");
        const sourceIndex = Array.from(selectedIndices)[0];
        const template = tools[sourceIndex];
        const targetIndices = Array.from(selectedIndices).filter(x => x !== sourceIndex);
        if (targetIndices.length === 0) return alert("请勾选多把刀进行复制填充（取第一把选中的为源范本）");

        try {
            // @ts-ignore
            const result: FormResult = await ToolVM_PasteToolChanges(targetIndices, template);
            if (result?.success) {
                alert(result.message);
                setSelectedIndices(new Set());
            } else {
                alert(`批量填充失败: ${result?.message}`);
            }
        } catch (e) {
            console.error(e);
            alert("批量填充异常");
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-700/50 overflow-hidden relative">
            <div className="flex-shrink-0 p-4 border-b border-slate-800/60 flex flex-wrap justify-between items-center bg-slate-900/50 backdrop-blur-sm relative z-10 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                        <Wrench size={20} className="text-indigo-400" /> 刀具管理
                    </h2>
                    <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 flex items-center gap-2">
                        <span>已选: <span className="text-indigo-400 font-bold">{selectedIndices.size}</span> 项</span>
                        <div className="w-px h-3 bg-slate-600"></div>
                        <span>总计: {tools.length} 把刀</span>
                    </div>

                    <div className="flex justify-start">
                        <button onClick={toggleAll} className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded border border-slate-700/50">
                            {selectedIndices.size === tools.length ? <CheckSquare size={14} /> : <Square size={14} />} {selectedIndices.size === tools.length ? '取消全选' : '全选'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasCalibration && (
                        <button
                            disabled={selectedIndices.size === 0}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-teal-600/20 text-teal-400 hover:bg-teal-600 hover:text-white border border-teal-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleBatchCalibrate}
                        >
                            <RotateCcw size={16} /> 重新对刀
                        </button>
                    )}

                    <button
                        title="勾选多项时，将第一把选中的刀具参数复制应用到其余选定项"
                        disabled={selectedIndices.size < 2}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleBatchPaste}
                    >
                        <Save size={16} /> 复制所选参数
                    </button>

                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/50">
                        <button className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setViewMode('table')}>
                            <List size={16} /> 表格
                        </button>
                        <button className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'card' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setViewMode('card')}>
                            <LayoutGrid size={16} /> 卡片
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {tools.length === 0 ? (
                    <div className="text-center text-slate-500 mt-20">暂无刀具数据</div>
                ) : viewMode === 'table' ? (
                    <div className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-x-auto pb-8">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 sticky top-0" style={{ zIndex: 10 }}>
                                <tr>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold w-10">
                                        <div onClick={toggleAll} className="cursor-pointer">
                                            {selectedIndices.size === tools.length ? <CheckSquare size={16} className="text-indigo-400" /> : <Square size={16} className="text-slate-500 hover:text-slate-400" />}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center">刀号</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center">别名</th>

                                    {hasLife && (
                                        <>
                                            <th className="px-2 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center text-emerald-500">已用时长(h)</th>
                                            <th className="px-2 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center">寿命上限(h)</th>
                                            <th className="px-2 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center text-slate-300">已切换次数</th>
                                            <th className="px-2 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center">最大允许切换</th>
                                            <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center">近期更换时间</th>
                                        </>
                                    )}

                                    {hasCalibration && (
                                        <>
                                            <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center">近期对刀时间</th>
                                            <th className="px-2 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center">对刀间隔(h)</th>
                                        </>
                                    )}

                                    {hasComp && (
                                        <>
                                            <th className="px-2 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center text-amber-500">刀补D</th>
                                            <th className="px-2 py-3 border-b border-slate-700 font-semibold whitespace-nowrap text-center text-amber-500">刀补H</th>
                                        </>
                                    )}
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap sticky right-0 bg-slate-800/90 shadow-[-4px_0_10px_rgba(0,0,0,0.2)] text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tools.map((m, i) => (
                                    <ToolRowItem
                                        key={m.id} index={i} tool={m} onApply={handleApply}
                                        isSelected={selectedIndices.has(i)} onToggleSelect={toggleSelect}
                                        hasLife={hasLife} hasCalibration={hasCalibration} hasComp={hasComp}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-8">
                            {tools.map((m, i) => (
                                <ToolCardItem
                                    key={m.id} index={i} tool={m} onApply={handleApply}
                                    isSelected={selectedIndices.has(i)} onToggleSelect={toggleSelect}
                                    hasLife={hasLife} hasCalibration={hasCalibration} hasComp={hasComp}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
