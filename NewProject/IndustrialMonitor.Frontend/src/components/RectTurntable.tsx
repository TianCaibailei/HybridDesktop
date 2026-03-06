import { useState, useEffect, useRef } from 'react';
import { Target, Cpu } from 'lucide-react';
import { useAppStore } from '../store/generatedStore';

// 工位状态枚举
const STATION_STATES = [
    { id: 'idle', text: "空闲", color: "border-slate-600 text-slate-400 shadow-none bg-slate-800" },
    { id: 'input', text: "待加工", color: "border-amber-500 text-amber-500 shadow-amber-500/20 bg-amber-500/10" },
    { id: 'processing', text: "加工中", color: "border-blue-500 text-blue-500 shadow-blue-500/20 bg-blue-500/10" },
    { id: 'testing', text: "加工完成", color: "border-purple-500 text-purple-500 shadow-purple-500/20 bg-purple-500/10" },
    { id: 'output', text: "未知", color: "border-emerald-500 text-emerald-500 shadow-emerald-500/20 bg-emerald-500/10" }
];

// 工位卡片组件（只展示，不允许手动点击切换）
const StationCard = ({ name, statusObj }: { name: string; statusObj: typeof STATION_STATES[0] }) => (
    <div className={`w-14 h-14 rounded-lg border-2 shadow-[0_0_12px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center relative z-10 transition-colors duration-300 ${statusObj.color}`}>
        <span className="text-[11px] font-bold mb-0.5 tracking-wider">{name}</span>
        <span className="text-[9px] px-1 py-0.5 rounded font-semibold bg-slate-900/80 backdrop-blur-sm whitespace-nowrap">
            {statusObj.text}
        </span>
    </div>
);

// 获取位于圆角矩形直边上的坐标点
// 明确规定：
// side: 0=顶部(左->右), 1=右侧(上->下), 2=底部(右->左), 3=左侧(下->上)
// indexOnSide: 在该边上的序数 (0 to maxCount - 1)
// maxCount: 该边上的总工位数
function getStraightEdgePoint(side: number, indexOnSide: number, maxCount: number, W: number, H: number, R: number): { x: number; y: number } {
    const LxStraight = W - 2 * R; // X 方向直边长度
    const LyStraight = H - 2 * R; // Y 方向直边长度

    // 计算分段距离 (首尾保留边距，所以除以 (maxCount + 1) 或者均匀切分)
    // 为了美观，第一和最后一个点靠近圆角：
    const stepX = maxCount > 1 ? LxStraight / (maxCount - 1) : LxStraight / 2;
    const stepY = maxCount > 1 ? LyStraight / (maxCount - 1) : LyStraight / 2;

    switch (side) {
        case 0: // 顶部 (x: R -> W-R, y: 0)
            return {
                x: maxCount === 1 ? R + stepX : R + stepX * indexOnSide,
                y: 0
            };
        case 1: // 右侧 (x: W, y: R -> H-R)
            return {
                x: W,
                y: maxCount === 1 ? R + stepY : R + stepY * indexOnSide
            };
        case 2: // 底部 (x: W-R -> R, y: H)
            return {
                x: maxCount === 1 ? W - R - stepX : W - R - stepX * indexOnSide,
                y: H
            };
        case 3: // 左侧 (x: 0, y: H-R -> R)
            return {
                x: 0,
                y: maxCount === 1 ? H - R - stepY : H - R - stepY * indexOnSide
            };
        default:
            return { x: 0, y: 0 };
    }
}

export default function RectTurntable() {
    const turntable = useAppStore((s) => s.turntableVM);
    const xCount = turntable?.xCount || 5;
    const yCount = turntable?.yCount || 3;
    const step = turntable?.step || 0;
    const stations = turntable?.stations || [];
    const zeroStationIndex = turntable?.zeroStationIndex || 0;
    const isClockwise = turntable?.isClockwise ?? true;
    const rotateDirection = turntable?.rotateDirection || 1; // 1代表正转(物理顺时针)，-1代表反转(物理逆时针)

    const [animatedStep, setAnimatedStep] = useState(0);
    const prevStepRef = useRef(0);

    const totalStations = (xCount + yCount) * 2;

    // 轨道参数：矩形
    const TRACK_W = 460;
    const TRACK_H = Math.round(460 * (yCount / xCount) * 0.8);
    const TRACK_RADIUS = 50;
    // 计算每个工位在直边上的静态物理坐标（不受运转影响的基础位置索引 0 ~ totalStations-1）
    // 0号物理工位定义：左上角顶部水平直线的左端点
    // physicalPositions 依然代表从左上角按【顺时针】顺序一圈物理位置，从 0 到 totalStations-1
    const physicalPositions = Array.from({ length: totalStations }).map((_, idx) => {
        let side = 0, indexOnSide = 0, edgeCount = 0;
        if (idx < xCount) { // 顶部
            side = 0; indexOnSide = idx; edgeCount = xCount;
        } else if (idx < xCount + yCount) { // 右侧
            side = 1; indexOnSide = idx - xCount; edgeCount = yCount;
        } else if (idx < xCount * 2 + yCount) { // 底部
            side = 2; indexOnSide = idx - (xCount + yCount); edgeCount = xCount;
        } else { // 左侧
            side = 3; indexOnSide = idx - (xCount * 2 + yCount); edgeCount = yCount;
        }
        return { side, indexOnSide, edgeCount, physicalId: idx };
    });

    // 这里计算映射：逻辑工位索引（i）所应当落入的静态物理坐标索引是什么
    // 条件1：逻辑工位 0 应分配给基于全顺时针排布的 physicalPositions[zeroStationIndex]。
    // 条件2：如果是 isClockwise 为 true，则逻辑增大的方向是顺时针（physicalId变大）。
    // 条件3：如果 isClockwise 为 false，则逻辑增大的方向是逆时针（physicalId变小）。
    const getBasePhysicalIndexForLogic = (logicId: number) => {
        if (isClockwise) {
            return (zeroStationIndex + logicId) % totalStations;
        } else {
            return (zeroStationIndex - logicId + totalStations * 10) % totalStations; // 加足够大的整数避负数
        }
    };

    // 中心区域计算显示正在被操作的工位编号：
    // 定义：步进 step 为0时，逻辑0号恰好在物理 zeroStationIndex 位置。
    // 转盘本身的物理运动方向由 rotateDirection（1: 顺时针，-1: 逆时针）决定。
    // 正转 (+1) 表示整个盘子物理顺时针转动了 step 个工位跨度，即同心圆（固定在 zeroStationIndex）看到的是上一个盘子经过。
    // 逻辑工位自身的标号排布取决于 isClockwise。如果是顺时针排布(true)，那么0后面跟着的是1。如果是逆时针排布(false)，0顺时针过去是 "total - 1"。
    // 由于我们固定把 0 放在 physical[zeroStationIndex]，我们可以算出盘子旋转 step 后，谁落在了 zeroStationIndex 位置。

    // 如果盘子顺时针转了 step 步(即 rotateDirection * step)：
    // 位置 zeroStationIndex 下面本来是工位 0。盘子顺时针转后，顺时针方向排在 0 后面的工位将被带离该点，
    // 而逆时针方向原本在0后面的工位将被拉到这来。
    // 因此在物理上，随着顺转，经过该点的物理索引是向“反方向（逆时针）”找的元素。
    // 刚好 `getBasePhysicalIndexForLogic` 映射了工位 ID 到物理 ID。由于两个控制因素交织，这里统一一个公式：
    // 转动导致的物理位置偏移量
    const physicalOffset = -(rotateDirection * step);

    // 我们需要找逻辑工位 ID，使得它的初始物理位置加上物理转动等于 targetPhysical 的位置（即 zeroStationIndex）。
    // 即 getBasePhysicalIndexForLogic(ID) + rotateDirection * step == zeroStationIndex
    // getBasePhysicalIndexForLogic(ID) == zeroStationIndex - rotateDirection * step

    // getBasePhysicalIndexForLogic 定义：
    // 如果 isClockwise: zeroStationIndex + ID = basePhys
    //    ==> zeroStationIndex + ID = zeroStationIndex - rotateDirection * step
    //    ==> ID = - rotateDirection * step
    // 如果 !isClockwise: zeroStationIndex - ID = basePhys
    //    ==> zeroStationIndex - ID = zeroStationIndex - rotateDirection * step
    //    ==> ID = rotateDirection * step

    const activeLogicStationIndex = (((isClockwise ? -1 : 1) * rotateDirection * step) % totalStations + totalStations) % totalStations;

    // 同心圆标记所绑定的那个物理坐标系的位置
    const targetPhysical = physicalPositions[zeroStationIndex % totalStations];
    const workingPos = getStraightEdgePoint(targetPhysical.side, targetPhysical.indexOnSide, targetPhysical.edgeCount, TRACK_W, TRACK_H, TRACK_RADIUS);

    const cx = TRACK_W / 2;
    const cy = TRACK_H / 2;
    const dx = workingPos.x - cx;
    const dy = workingPos.y - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const markerOffset = 45;
    const extWorkingPos = {
        x: workingPos.x + (dx / len) * markerOffset,
        y: workingPos.y + (dy / len) * markerOffset
    };

    // 平滑跟轨动画引擎
    useEffect(() => {
        let animationFrameId: number;
        let startTimestamp: number | null = null;
        const duration = 700;
        const initialStep = prevStepRef.current;
        const targetStep = step;

        if (initialStep === targetStep) {
            setAnimatedStep(targetStep);
            return;
        }

        const stepDiff = targetStep - initialStep;

        const animate = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            setAnimatedStep(initialStep + stepDiff * easeProgress);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setAnimatedStep(targetStep);
                prevStepRef.current = targetStep;
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [step]);

    const viewW = TRACK_W + 100;
    const viewH = TRACK_H + 100;
    const offsetX = (viewW - TRACK_W) / 2;
    const offsetY = (viewH - TRACK_H) / 2;

    return (
        <div className="bg-slate-800/80 rounded-2xl p-4 shadow-2xl border border-slate-700/50 flex flex-col items-center backdrop-blur-sm">
            <div className="w-full flex justify-between items-center mb-2 pb-2 border-b border-slate-700/50">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Cpu className="text-purple-400" size={16} />
                    矩形柔性传输轨道
                </h2>
                <div className="flex gap-2 text-[10px]">
                    <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-400">
                        X:{xCount} Y:{yCount} 共{totalStations}工位
                    </span>
                </div>
            </div>

            {/* 渲染视口 */}
            <div className="relative bg-slate-900/80 rounded-xl overflow-hidden shadow-inner border border-slate-800/50 flex items-center justify-center"
                style={{ width: viewW, height: viewH }}>

                {/* 状态图例 */}
                <div className="absolute w-full mt-3 flex items-center justify-center gap-3 text-[10px]"
                    style={{ left: TRACK_W * 0.5 - 230, bottom: 0 }}>
                    {STATION_STATES.map(s => (
                        <div key={s.id} className="flex items-center gap-1">
                            <div className={`w-2.5 h-2.5 rounded-sm border ${s.color}`} />
                            <span className="text-slate-500">{s.text}</span>
                        </div>
                    ))}
                </div>

                {/* 中心信息岛 */}
                <div className="absolute bg-slate-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-slate-700 flex flex-col items-center justify-center"
                    style={{ width: TRACK_W * 0.45, height: TRACK_H * 0.45 }}>
                    <div className="text-slate-600 font-bold tracking-widest text-sm opacity-50 mb-1">加工中枢</div>
                    <div className="text-purple-500/50 font-mono text-xs">POS: {step}</div>
                    <div className="text-purple-400 font-bold text-lg mt-0.5">RQ-{activeLogicStationIndex}</div>
                </div>

                {/* 轨道对齐包裹层 */}
                <div className="absolute" style={{ width: TRACK_W, height: TRACK_H, left: offsetX, top: offsetY }}>

                    {/* SVG 轨道 */}
                    <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none">
                        <rect x="0" y="0" width={TRACK_W} height={TRACK_H} rx={TRACK_RADIUS} fill="none" stroke="#1e293b" strokeWidth="28" />
                        <rect x="0" y="0" width={TRACK_W} height={TRACK_H} rx={TRACK_RADIUS} fill="none" stroke="#334155" strokeWidth="10" />
                        <rect x="0" y="0" width={TRACK_W} height={TRACK_H} rx={TRACK_RADIUS} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="5 5" />
                    </svg>

                    {/* 工作位指示器 */}
                    <div className="absolute z-0 flex items-center justify-center pointer-events-none"
                        style={{ left: extWorkingPos.x, top: extWorkingPos.y, transform: 'translate(-50%, -50%)' }}>
                        <Target size={26} className="text-purple-500 animate-pulse drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] opacity-90" />
                    </div>

                    {/* 沿轨道运动的工位 */}
                    {Array.from({ length: totalStations }).map((_, i) => {
                        // 该逻辑工位目前的“虚拟静态”物理坐标索引（即加上了 step 转动造成的偏移）
                        // 根据物理旋转方向 rotateDirection 进行偏移
                        const movingOffset = rotateDirection * animatedStep;
                        const basePhysIndex = getBasePhysicalIndexForLogic(i);
                        const vPathPos = (basePhysIndex + movingOffset + totalStations * 10) % totalStations;

                        // 找到它前后的两个离散物理点索引，用于两直边跨越时的插值
                        const pIdx1 = Math.floor(vPathPos) % totalStations;
                        const pIdx2 = (pIdx1 + 1) % totalStations;
                        const fraction = vPathPos - Math.floor(vPathPos); // 0 到 1 之间插值

                        // 获取两个物理点的位置
                        const phys1 = physicalPositions[pIdx1];
                        const phys2 = physicalPositions[pIdx2];
                        const pt1 = getStraightEdgePoint(phys1.side, phys1.indexOnSide, phys1.edgeCount, TRACK_W, TRACK_H, TRACK_RADIUS);
                        const pt2 = getStraightEdgePoint(phys2.side, phys2.indexOnSide, phys2.edgeCount, TRACK_W, TRACK_H, TRACK_RADIUS);

                        // 简单线性插值（如果在圆角处转弯，插值会沿斜线切割圆角，虽然没原先完全贴合圆角平滑，但整体依然很直观且不会有坐标在圆角停留）
                        let pos = {
                            x: pt1.x + (pt2.x - pt1.x) * fraction,
                            y: pt1.y + (pt2.y - pt1.y) * fraction
                        };

                        const stateIdx = stations[i]?.state || 0;
                        const statusObj = STATION_STATES[stateIdx] || STATION_STATES[0];
                        const toolTipText = stations[i]?.toolTip;

                        return (
                            <div
                                key={`rq-st-${i}`}
                                className="group absolute w-14 h-14 -ml-7 -mt-7 z-30"
                                style={{ left: pos.x, top: pos.y }}>
                                <StationCard name={`RQ-${i}`} statusObj={statusObj} />
                                {toolTipText && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                                        {toolTipText}
                                        {/* 小三角 */}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>


        </div>
    );
}
