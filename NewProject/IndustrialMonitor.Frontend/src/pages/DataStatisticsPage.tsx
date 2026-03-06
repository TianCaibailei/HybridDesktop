import { useState, useEffect } from 'react';
import { useAppStore, ProduceDataVM_QueryProduceData, ProduceDataVM_QueryDailyStatistics, ProduceData, DailyProduceStat, ProduceDataVM_MockInitDataIfTableNotExists } from '../store/generatedStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Search, CalendarDays, Database, BarChart3, Clock, AlertCircle } from 'lucide-react';

export default function DataStatisticsPage() {
    // 默认查询过去 7 天
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });

    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const [dailyData, setDailyData] = useState<DailyProduceStat[]>([]);
    const [historyList, setHistoryList] = useState<ProduceData[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            // 开始时间 00:00:00，结束时间 23:59:59
            const startStr = `${startDate}T00:00:00Z`;
            const endStr = `${endDate}T23:59:59Z`;

            // 等待自动生成的假数据或者建表结束（如果是第一次运行的话可用）
            await ProduceDataVM_MockInitDataIfTableNotExists();

            const dailyStats = await ProduceDataVM_QueryDailyStatistics(startStr, endStr);
            const list = await ProduceDataVM_QueryProduceData(startStr, endStr);

            setDailyData(dailyStats);
            setHistoryList(list);
        } catch (err: any) {
            console.error("查表失败:", err);
            setErrorMsg("读取数据失败: " + (err.message || String(err)));
        } finally {
            setLoading(false);
        }
    };

    // 初始加载
    useEffect(() => {
        fetchData();
    }, []);

    const totalProduced = dailyData.reduce((acc, curr) => acc + curr.totalCount, 0);

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-700/50 rounded-2xl p-4 gap-4 overflow-hidden relative">
            {/* 顶部工具栏 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 shrink-0">
                <div className="flex items-center gap-2">
                    <Database className="text-cyan-400" size={20} />
                    <h2 className="text-lg font-bold text-slate-100">历史加工数据统计</h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 focus-within:border-cyan-500/50 transition-colors">
                        <CalendarDays size={16} className="text-slate-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm text-slate-200 outline-none w-[110px]"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm text-slate-200 outline-none w-[110px]"
                        />
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 transition-colors rounded-lg text-sm font-semibold text-slate-100 disabled:opacity-50"
                    >
                        {loading ? <Clock size={16} className="animate-spin text-cyan-400" /> : <Search size={16} />}
                        查询数据
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 shrink-0">
                    <AlertCircle size={16} />
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 flex-1">
                {/* 如果图表和概览放在一起 */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* 概要统计 */}
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between shadow-lg shrink-0">
                        <div>
                            <div className="text-xs text-slate-400 font-medium mb-1">区间内总生产量</div>
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-mono">
                                {totalProduced.toLocaleString()}
                            </div>
                        </div>
                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                            <BarChart3 size={24} className="text-cyan-400" />
                        </div>
                    </div>

                    {/* 图表展示区 */}
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 flex-1 flex flex-col shadow-lg min-h-[250px]">
                        <div className="text-sm font-bold text-slate-300 mb-4 pb-2 border-b border-slate-700/50">
                            日产量走势图
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            {dailyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="dateString" stroke="#94a3b8" fontSize={11} tickMargin={10} tickFormatter={(val) => val.slice(5)} />
                                        <YAxis stroke="#94a3b8" fontSize={11} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                                            itemStyle={{ color: '#38bdf8' }}
                                        />
                                        <Bar dataKey="totalCount" name="生产数量" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                                    暂无图表数据
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 详细数据表格区 */}
                <div className="lg:col-span-2 bg-slate-800/80 rounded-xl border border-slate-700/50 flex flex-col overflow-hidden shadow-lg relative">
                    <div className="text-sm font-bold text-slate-300 p-4 pb-3 border-b border-slate-700/50 shrink-0 bg-slate-800/80 z-10 flex justify-between items-center">
                        <span>加工记录详情 (共 {historyList.length} 条)</span>
                    </div>

                    <div className="flex-1 overflow-auto p-2">
                        {loading && historyList.length === 0 ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                                <Clock size={24} className="animate-spin text-cyan-400/50" />
                                <span className="text-sm">正在加载数据...</span>
                            </div>
                        ) : historyList.length > 0 ? (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="sticky top-0 bg-slate-900 shadow-md">
                                    <tr className="text-slate-400 font-semibold border-b border-slate-700">
                                        <th className="px-4 py-3 rounded-tl-lg">记录文件 (NC)</th>
                                        <th className="px-4 py-3">加工数</th>
                                        <th className="px-4 py-3">开始时间</th>
                                        <th className="px-4 py-3">结束时间</th>
                                        <th className="px-4 py-3 rounded-tr-lg">耗时(m)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-200">{item.fileName || '--'}</td>
                                            <td className="px-4 py-3 font-mono text-cyan-400 font-bold">{item.count}</td>
                                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{new Date(item.startTime).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{new Date(item.endTime).toLocaleString()}</td>
                                            <td className="px-4 py-3 font-mono text-amber-400">{item.timeSpanMinute.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm min-h-[150px]">
                                {errorMsg ? "查询失败，请检查配置" : "该时间段内暂无生产记录"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
