import { useState } from 'react';
import { useAppStore, MaterialItem, MaterialVM_SelectNcFile } from '../store/generatedStore';
import { LayoutGrid, List } from 'lucide-react';

export default function MaterialPage() {
    const materialVM = useAppStore(s => s.materialVM);
    const materials: MaterialItem[] = materialVM?.materials || [];
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    const setBackendState = useAppStore(s => s.setBackendState);

    const handlePriorityChange = (index: number, newPriority: string) => {
        setBackendState('MaterialVM', `Materials[${index}].Priority`, newPriority);
    };

    const handleNumberChange = (index: number, field: string, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            setBackendState('MaterialVM', `Materials[${index}].${field}`, num);
        }
    };

    const handleSelectFile = async (index: number) => {
        try {
            const filePath = await MaterialVM_SelectNcFile();
            if (filePath && filePath.trim() !== '') {
                setBackendState('MaterialVM', `Materials[${index}].NcFile`, filePath);
            }
        } catch (e) {
            console.error("Failed to select file", e);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden relative">
            {/* 顶栏控制区域 */}
            <div className="flex-shrink-0 p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm z-10 w-full relative">
                <h2 className="text-lg font-bold text-slate-200">工位物料列表</h2>
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/50">
                    <button
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        onClick={() => setViewMode('table')}
                    >
                        <List size={16} /> 表格
                    </button>
                    <button
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'card' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        onClick={() => setViewMode('card')}
                    >
                        <LayoutGrid size={16} /> 卡片
                    </button>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {materials.length === 0 ? (
                    <div className="text-center text-slate-500 mt-20">暂无物料数据</div>
                ) : viewMode === 'table' ? (
                    <div className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 sticky top-0" style={{ zIndex: 1 }}>
                                <tr>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">工位状态</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">工位</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">优先级</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">毛长</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">毛宽</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold min-w-[150px]">加工文件</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">分中</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">偏值Z</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">角度</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">产品长</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">产品宽</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">阵列数</th>
                                    <th className="px-4 py-3 border-b border-slate-700 font-semibold whitespace-nowrap">阵列间</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((m, i) => (
                                    <tr key={i} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-xs px-2 font-medium ${m.stationState === '空' ? 'bg-slate-700 text-slate-300' : 'bg-green-900/40 text-green-400 border border-green-800/50'}`}>
                                                {m.stationState}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 font-mono text-indigo-400">{m.station}</td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 whitespace-nowrap">
                                            <select
                                                className="bg-slate-800 text-amber-500 border border-slate-600 rounded px-2 py-1 outline-none focus:border-indigo-500"
                                                value={m.priority}
                                                onChange={(e) => handlePriorityChange(i, e.target.value)}
                                            >
                                                <option value="★">★</option>
                                                <option value="★★">★★</option>
                                                <option value="★★★">★★★</option>
                                                <option value="★★★★">★★★★</option>
                                                <option value="★★★★★">★★★★★</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">
                                            <input
                                                type="number"
                                                className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-2 py-1 outline-none focus:border-indigo-500 no-spinners"
                                                defaultValue={m.blankLength}
                                                onBlur={(e) => handleNumberChange(i, 'BlankLength', e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleNumberChange(i, 'BlankLength', (e.target as HTMLInputElement).value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">
                                            <input
                                                type="number"
                                                className="w-16 bg-slate-800 text-slate-200 border border-slate-700/50 rounded px-2 py-1 outline-none focus:border-indigo-500 no-spinners"
                                                defaultValue={m.blankWidth}
                                                onBlur={(e) => handleNumberChange(i, 'BlankWidth', e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleNumberChange(i, 'BlankWidth', (e.target as HTMLInputElement).value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 font-medium text-emerald-400 max-w-[200px]" title={m.ncFile}>
                                            <div className="flex items-center gap-2">
                                                <span className="truncate">{m.ncFile}</span>
                                                <button onClick={() => handleSelectFile(i)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                                                    ...
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">{m.centerDivide}</td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">{m.offsetZ}</td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">{m.angle}</td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">{m.productLength}</td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">{m.productWidth}</td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">{m.arrayCount}</td>
                                        <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300">{m.arraySpacing}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                        {materials.map((m, i) => (
                            <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-lg hover:shadow-indigo-900/20 hover:border-slate-600 transition-all flex flex-col pt-5 relative">
                                {/* 卡片独立角标：工位号 */}
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white font-mono text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl shadow-sm">
                                    RQ-{m.station}
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className={`px-2 py-0.5 rounded text-xs px-2 font-medium ${m.stationState === '空' ? 'bg-slate-700 text-slate-300' : 'bg-green-900/40 text-green-400 border border-green-800/50'}`}>
                                        状态: {m.stationState}
                                    </span>
                                    <select
                                        className="bg-transparent text-amber-500 text-sm font-bold tracking-widest outline-none cursor-pointer hover:bg-slate-800 rounded px-1"
                                        value={m.priority}
                                        onChange={(e) => handlePriorityChange(i, e.target.value)}
                                    >
                                        <option value="★" className="bg-slate-800">★</option>
                                        <option value="★★" className="bg-slate-800">★★</option>
                                        <option value="★★★" className="bg-slate-800">★★★</option>
                                        <option value="★★★★" className="bg-slate-800">★★★★</option>
                                        <option value="★★★★★" className="bg-slate-800">★★★★★</option>
                                    </select>
                                </div>

                                {/* 重要信息项高亮显示 */}
                                <div className="bg-slate-900/50 rounded-lg p-2.5 mb-3 border border-slate-700/50 group/file">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-[11px] text-slate-500 uppercase font-semibold">NC 文件</div>
                                        <button onClick={() => handleSelectFile(i)} className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors opacity-0 group-hover/file:opacity-100">
                                            更换
                                        </button>
                                    </div>
                                    <div className="text-emerald-400 text-sm font-medium leading-snug break-words line-clamp-2" title={m.ncFile}>
                                        {m.ncFile}
                                    </div>
                                </div>

                                {/* 多列详细参数 */}
                                <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs">
                                    <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded border border-slate-700/30">
                                        <span className="text-slate-400">毛尺寸:</span>
                                        <span className="text-slate-200 font-medium">{m.blankLength} x {m.blankWidth}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded border border-slate-700/30">
                                        <span className="text-slate-400">净尺寸:</span>
                                        <span className="text-slate-200 font-medium">{m.productLength} x {m.productWidth}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded border border-slate-700/30">
                                        <span className="text-slate-400">分中:</span>
                                        <span className="text-slate-200 font-mono">{m.centerDivide}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded border border-slate-700/30">
                                        <span className="text-slate-400">偏值Z:</span>
                                        <span className="text-slate-200 font-mono">{m.offsetZ}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded border border-slate-700/30">
                                        <span className="text-slate-400">角度:</span>
                                        <span className="text-slate-200 font-mono">{m.angle}°</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded border border-slate-700/30">
                                        <span className="text-slate-400">阵列:</span>
                                        <span className="text-slate-200 font-mono">{m.arrayCount} @ {m.arraySpacing}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
