import React, { useState, useEffect } from 'react';
import { useAppStore, MaterialItem, MaterialVM_SelectNcFile, MaterialVM_ApplyMaterialChanges, MaterialVM_PasteMaterialChanges, FormResult } from '../store/generatedStore';
import { LayoutGrid, List, Copy, ClipboardPaste, Save, FileOutput } from 'lucide-react';

// ----------------------------------------------------------------------------------------------------
// Table Row Component
// ----------------------------------------------------------------------------------------------------
const MaterialRowItem = ({
    material, index, onApply, clipboard, onCopy, onPaste
}: {
    material: MaterialItem, index: number, onApply: (i: number, d: MaterialItem) => void, clipboard: MaterialItem | null, onCopy: (d: MaterialItem) => void, onPaste: (i: number) => void
}) => {
    const [draft, setDraft] = useState<MaterialItem>(material);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

    // Sync draft when backend updates
    useEffect(() => {
        setDraft(material);
    }, [material]);

    const isDirty = JSON.stringify(draft) !== JSON.stringify(material);

    const handleSelectFile = async () => {
        try {
            const filePath = await MaterialVM_SelectNcFile();
            if (filePath && filePath.trim() !== '') {
                setDraft(d => ({ ...d, ncFile: filePath }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX - 2, y: e.clientY - 4 });
    };

    return (
        <tr className="hover:bg-slate-700/30 transition-colors group" onContextMenu={onContextMenu}>
            <td className="px-4 py-2 border-b border-slate-800/60 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${draft.stationState === '空' ? 'bg-slate-700 text-slate-300' : 'bg-green-900/40 text-green-400 border border-green-800/50'}`}>
                    {draft.stationState}
                </span>
            </td>
            <td className="px-4 py-2 border-b border-slate-800/60 font-mono text-indigo-400">{draft.station}</td>
            <td className="px-4 py-2 border-b border-slate-800/60 whitespace-nowrap">
                <select
                    className="bg-slate-800 text-amber-500 border border-slate-600 rounded px-2 py-1 outline-none focus:border-indigo-500"
                    value={draft.priority}
                    onChange={(e) => setDraft(d => ({ ...d, priority: e.target.value }))}
                >
                    <option value="★">★</option>
                    <option value="★★">★★</option>
                    <option value="★★★">★★★</option>
                    <option value="★★★★">★★★★</option>
                    <option value="★★★★★">★★★★★</option>
                </select>
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-20 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-2 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.blankLength} onChange={(e) => setDraft(d => ({ ...d, blankLength: parseFloat(e.target.value) || 0 }))} />
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-20 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-2 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.blankWidth} onChange={(e) => setDraft(d => ({ ...d, blankWidth: parseFloat(e.target.value) || 0 }))} />
            </td>
            <td className="px-4 py-2 border-b border-slate-800/60 font-medium text-emerald-400 max-w-[200px]" title={draft.ncFile}>
                <div className="flex items-center gap-2">
                    <span className="truncate">{draft.ncFile}</span>
                    <button onClick={handleSelectFile} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors flex-shrink-0">
                        <FileOutput size={14} />
                    </button>
                </div>
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.centerDivide} onChange={(e) => setDraft(d => ({ ...d, centerDivide: parseFloat(e.target.value) || 0 }))} />
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.offsetZ} onChange={(e) => setDraft(d => ({ ...d, offsetZ: parseFloat(e.target.value) || 0 }))} />
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.angle} onChange={(e) => setDraft(d => ({ ...d, angle: parseFloat(e.target.value) || 0 }))} />
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-20 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-2 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.productLength} onChange={(e) => setDraft(d => ({ ...d, productLength: parseFloat(e.target.value) || 0 }))} />
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-20 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-2 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.productWidth} onChange={(e) => setDraft(d => ({ ...d, productWidth: parseFloat(e.target.value) || 0 }))} />
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.arrayCount} onChange={(e) => setDraft(d => ({ ...d, arrayCount: parseInt(e.target.value) || 0 }))} />
            </td>
            <td className="px-2 py-2 border-b border-slate-800/60 text-slate-300">
                <input type="number" className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-1 py-1 outline-none focus:border-indigo-500 no-spinners"
                    value={draft.arraySpacing} onChange={(e) => setDraft(d => ({ ...d, arraySpacing: parseFloat(e.target.value) || 0 }))} />
            </td>
            <td className="px-4 py-2 border-b border-slate-800/60 text-right sticky right-0 bg-slate-800/90 backdrop-blur">
                <button
                    disabled={!isDirty}
                    onClick={() => onApply(index, draft)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors text-sm font-medium ${isDirty ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/50' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                    <Save size={14} /> 应用
                </button>
            </td>

            {/* Context Menu Render */}
            {contextMenu && (
                <div
                    className="fixed bg-slate-800 border border-slate-600 shadow-xl rounded-md py-1 z-50 min-w-[150px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div
                        className="px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                        onClick={() => { onCopy(draft); setContextMenu(null); }}
                    >
                        <Copy size={14} /> 复制当前参数
                    </div>
                    <div
                        className={`px-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${clipboard ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-500'}`}
                        onClick={() => { if (clipboard) { onPaste(index); setContextMenu(null); } }}
                    >
                        <ClipboardPaste size={14} /> 粘贴参数
                    </div>
                    {/* Click away overlay */}
                    <div className="fixed inset-0" style={{ zIndex: -1 }} onClick={(e) => { e.stopPropagation(); setContextMenu(null); }} />
                </div>
            )}
        </tr>
    );
};

// ----------------------------------------------------------------------------------------------------
// Card Item Component
// ----------------------------------------------------------------------------------------------------
const MaterialCardItem = ({ material, index, onApply, clipboard, onCopy, onPaste }: any) => {
    const [draft, setDraft] = useState<MaterialItem>(material);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

    useEffect(() => { setDraft(material); }, [material]);
    const isDirty = JSON.stringify(draft) !== JSON.stringify(material);

    const handleSelectFile = async () => {
        try {
            const filePath = await MaterialVM_SelectNcFile();
            if (filePath && filePath.trim() !== '') {
                setDraft(d => ({ ...d, ncFile: filePath }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateField = (field: keyof MaterialItem, val: any) => setDraft(d => ({ ...d, [field]: val }));

    const onContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <div onContextMenu={onContextMenu} className={`bg-slate-800/60 border ${isDirty ? 'border-indigo-500 shadow-indigo-900/30' : 'border-slate-700'} rounded-xl p-4 shadow-lg transition-all flex flex-col pt-5 relative`}>
            <div className="absolute top-0 right-0 bg-indigo-600 text-white font-mono text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl shadow-sm">
                RQ-{draft.station}
            </div>

            <div className="flex justify-between items-center mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${draft.stationState === '空' ? 'bg-slate-700 text-slate-300' : 'bg-green-900/40 text-green-400 border border-green-800/50'}`}>
                    状态: {draft.stationState}
                </span>
                <select className="bg-transparent text-amber-500 text-sm font-bold tracking-widest outline-none cursor-pointer hover:bg-slate-800 rounded px-1"
                    value={draft.priority} onChange={(e) => updateField('priority', e.target.value)}>
                    <option value="★" className="bg-slate-800">★</option>
                    <option value="★★" className="bg-slate-800">★★</option>
                    <option value="★★★" className="bg-slate-800">★★★</option>
                    <option value="★★★★" className="bg-slate-800">★★★★</option>
                    <option value="★★★★★" className="bg-slate-800">★★★★★</option>
                </select>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-2.5 mb-3 border border-slate-700/50 group/file">
                <div className="flex justify-between items-center mb-1">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">NC 文件</div>
                    <button onClick={handleSelectFile} className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors opacity-0 group-hover/file:opacity-100 flex items-center gap-1">
                        <FileOutput size={12} /> 更换
                    </button>
                </div>
                <div className="text-emerald-400 text-sm font-medium leading-snug break-words line-clamp-2" title={draft.ncFile}>{draft.ncFile}</div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs mb-4">
                <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded border border-slate-700/30">
                    <span className="text-slate-400">毛尺寸:</span>
                    <div className="flex items-center gap-1">
                        <input type="number" className="w-12 bg-slate-900 text-slate-200 rounded px-1 outline-none focus:border-indigo-500 no-spinners" value={draft.blankLength} onChange={e => updateField('blankLength', parseFloat(e.target.value) || 0)} />
                        <span className="text-slate-500">x</span>
                        <input type="number" className="w-12 bg-slate-900 text-slate-200 rounded px-1 outline-none focus:border-indigo-500 no-spinners" value={draft.blankWidth} onChange={e => updateField('blankWidth', parseFloat(e.target.value) || 0)} />
                    </div>
                </div>
                <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded border border-slate-700/30">
                    <span className="text-slate-400">净尺寸:</span>
                    <div className="flex items-center gap-1">
                        <input type="number" className="w-12 bg-slate-900 text-slate-200 rounded px-1 outline-none focus:border-indigo-500 no-spinners" value={draft.productLength} onChange={e => updateField('productLength', parseFloat(e.target.value) || 0)} />
                        <span className="text-slate-500">x</span>
                        <input type="number" className="w-12 bg-slate-900 text-slate-200 rounded px-1 outline-none focus:border-indigo-500 no-spinners" value={draft.productWidth} onChange={e => updateField('productWidth', parseFloat(e.target.value) || 0)} />
                    </div>
                </div>
                {/* Simplified remaining fields for card space */}
                <div className="col-span-2 grid grid-cols-4 gap-2 mt-1">
                    <div className="flex flex-col"><span className="text-slate-500 text-[10px]">偏值Z</span><input type="number" className="bg-slate-900 text-slate-200 rounded px-1 no-spinners" value={draft.offsetZ} onChange={e => updateField('offsetZ', parseFloat(e.target.value) || 0)} /></div>
                    <div className="flex flex-col"><span className="text-slate-500 text-[10px]">角度</span><input type="number" className="bg-slate-900 text-slate-200 rounded px-1 no-spinners" value={draft.angle} onChange={e => updateField('angle', parseFloat(e.target.value) || 0)} /></div>
                    <div className="flex flex-col"><span className="text-slate-500 text-[10px]">阵列数</span><input type="number" className="bg-slate-900 text-slate-200 rounded px-1 no-spinners" value={draft.arrayCount} onChange={e => updateField('arrayCount', parseInt(e.target.value) || 0)} /></div>
                    <div className="flex flex-col"><span className="text-slate-500 text-[10px]">阵列间</span><input type="number" className="bg-slate-900 text-slate-200 rounded px-1 no-spinners" value={draft.arraySpacing} onChange={e => updateField('arraySpacing', parseFloat(e.target.value) || 0)} /></div>
                </div>
            </div>

            <div className="mt-auto flex justify-end">
                <button
                    disabled={!isDirty}
                    onClick={() => onApply(index, draft)}
                    className={`flex items-center justify-center gap-1 w-full py-2 rounded transition-colors text-sm font-bold ${isDirty ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/50' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'}`}
                >
                    <Save size={16} /> 保存修改
                </button>
            </div>

            {contextMenu && (
                <div className="fixed bg-slate-800 border border-slate-600 shadow-xl rounded-md py-1 z-50 min-w-[150px]" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <div className="px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer flex items-center gap-2" onClick={() => { onCopy(draft); setContextMenu(null); }}>
                        <Copy size={14} /> 复制当前参数
                    </div>
                    <div className={`px-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${clipboard ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-500'}`} onClick={() => { if (clipboard) { onPaste(index); setContextMenu(null); } }}>
                        <ClipboardPaste size={14} /> 粘贴参数
                    </div>
                    <div className="fixed inset-0" style={{ zIndex: -1 }} onClick={(e) => { e.stopPropagation(); setContextMenu(null); }} />
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------------------------------------
export default function MaterialPage() {
    const materialVM = useAppStore(s => s.materialVM);
    const materials: MaterialItem[] = materialVM?.materials || [];
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [clipboard, setClipboard] = useState<MaterialItem | null>(null);

    const handleApply = async (index: number, draft: MaterialItem) => {
        try {
            const result: any = await MaterialVM_ApplyMaterialChanges(index, draft);
            if (result && !result.success) {
                alert(`保存失败: ${result.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("保存超时或引发异常");
        }
    };

    const handleCopy = (draft: MaterialItem) => {
        setClipboard({ ...draft }); // deep-ish clone
    };

    const handlePaste = async (index: number) => {
        if (!clipboard) return;
        try {
            const result = await MaterialVM_PasteMaterialChanges([index], clipboard);
            if (!result.success) {
                alert(`粘贴失败: ${result.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("粘贴异常");
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden relative">
            <div className="flex-shrink-0 p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm z-10 w-full relative">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-200">工位物料列表</h2>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">提示: 空白处[右键]可复制/粘贴整个工位参数</span>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/50">
                    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setViewMode('table')}>
                        <List size={16} /> 表格
                    </button>
                    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'card' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setViewMode('card')}>
                        <LayoutGrid size={16} /> 卡片
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {materials.length === 0 ? (
                    <div className="text-center text-slate-500 mt-20">暂无物料数据</div>
                ) : viewMode === 'table' ? (
                    <div className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-x-auto pb-[150px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 sticky top-0" style={{ zIndex: 10 }}>
                                <tr>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">状态</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">工位</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">优先级</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">毛长</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">毛宽</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold min-w-[150px]">加工NC文件</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">分中</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">偏值Z</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">角度</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">产品长</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">产品宽</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">阵列数</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">阵列间距</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap sticky right-0 bg-slate-800/90 shadow-[-4px_0_10px_rgba(0,0,0,0.2)]">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((m, i) => (
                                    <MaterialRowItem key={i} index={i} material={m} onApply={handleApply} clipboard={clipboard} onCopy={handleCopy} onPaste={handlePaste} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-[150px]">
                        {materials.map((m, i) => (
                            <MaterialCardItem key={i} index={i} material={m} onApply={handleApply} clipboard={clipboard} onCopy={handleCopy} onPaste={handlePaste} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
