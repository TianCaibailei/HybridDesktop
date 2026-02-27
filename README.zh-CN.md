# HybridDesktop
**中文** | [English (英文)](README.md)

## 🚀 混合桌面架构 (Hybrid Desktop)

HybridDesktop 是一个专为工控、非标自动化和视觉检测等高性能桌面软件打造的**现代化混合展现框架**。它致力于将 C# 强大的底层硬件控制与算法能力，与现代 Web 前端技术 (React/Vue 等) 极其炫酷且灵活的 UI 呈现完美融合。

### 🎯 解决的问题

传统的 WPF 或 WinForms 在面对复杂的现代 UI、动画或图表库（如 ECharts）时常常捉襟见肘，开发效率低、界面难复用。而常规的混合方案（例如基于 Electron 等 Web 壳嵌套的架构）常常面临着进程间通信 (IPC) 繁琐易错、底层硬件调用受限、性能损耗极大等痛点。

本项目采用了 **“单一事实来源 (Single Source of Truth) 与状态驱动”** 模式彻底改变了这个窘境：
后端 C# 端直接定义核心状态数据，前端作为表现层实现全自动的数据消费，而核心中间层全权负责自动双向同步 —— **你再也不需要手动编写繁杂琐碎的通信/消息接口代码。**

### ✨ 核心优势

1. **自动状态同步引擎**：通过 `[SyncViewModel]` 与 `[SyncProperty]` 特性标记 C# 数据模型，前端使用配套工具生成并直接挂载其对应的状态树（例如 Zustand）。任何值的一端突变，都会静默地全自动双向同步。
2. **深度支持复杂类型/集合容器**：不局限于简单数值同步，它完美地深度支持了 C# 中的嵌套对象（如 `ComplexVM.Config.InternalCamera`）与动态数组集合（如 `ObservableCollection<T>`），并且支持在界面端的无缝反射修改与映射更新。
3. **极简的高频“流媒体/共享数据”高速通道**：对于视觉采集与高频工业曲线，不使用极其低效的 JSON 或 Base64：
   - **图像流 (`ImageStream`)**：采用虚拟域名与专属拦截底层 (WebResourceRequested)。前端一行组件 `<ImageStream channel="camera1" />`，即可 60FPS 流畅渲染原图，突破协议性能壁垒。
   - **共享内存通道 (`FloatDataChannel`)**：借由 WebView2 的内部 SharedBuffer 机制传输连续数组信号（如雷达、激光测距仪数据），使得前端以真正 **零拷贝 (Zero-Copy)** 的方式取得 `Float32Array`，轻松支持超高频海量信号。
4. **强类型与全链路自动化**：内置 `TsStoreGenerator` 代码生成器引擎。在 C# 端设计好的结构，一键就能导出成为前端开箱即用的 TypeScript 接口层与状态管理器，使得前、后端即使完全隔离，依然能保持丝丝入扣的类型安全协同。
5. **强类型命令执行总线**：不仅仅是状态同步，框架更提供了基于 `[SyncCommand]` 的专属指令通道。只需在 C# 方法上打上特性标记，即可自动在前端生成全强类型的 TypeScript 包装函数（含参数签名、返回值 Promise 与 JSDoc 注释）。前端只需一行 `await VisionVM_GetStatusSummary("prefix")` 即可无缝调用后端业务逻辑并等待返回值，全程零手动路由注册。

---

### 👨‍💻 开发工作流 (如何使用本项目)

本套框架能够让前后端团队实现极其优雅的解耦，大幅度提升开发幸福感！

#### 1. C# 后端开发者工作流

*   **定义数据契约并标注**：在 `HybridApp.Core` 编写原生的 C# 模型并继承自 `SyncViewModelBase`。在对应的类前打上 `[SyncViewModel]`，在对外暴露给 UI 的核心属性前打上 `[SyncProperty]`。
*   **定义业务动作**：将需要供前端调用的业务方法打上 `[SyncCommand]` 标记，可以直接使用强类型参数及返回值（如 `void ToggleRunning(string reason)`）。
*   **一键生成 TypeScript 定义**：调用内置的 `TsStoreGenerator.Generate()` 工具接口。这会自动扫描你的代码，为前端小伙伴在目标目录下全自动重写出一份强类型的 `generatedStore.ts` 以及所有命令的包装函数。
*   **挂载与注册实例**：在你的主应用（WPF / WinForms 控制器中），实例化你的这些模型，并将它们注册入唯一的管理容器 `ViewModelManager`。
*   **立刻享受你的业务专注时刻**：之后，只需要按常理用 C# 修改属性值（如 `Exposure = 50;`），前端界面的文字、转盘就跟着动了。相反地，只要用户由于操控了前端控件而引发了属性变更，你的属性 `set` 操作和 `PropertyChanged` 常规事件也自然都会被触发，直接编写后面的控制层代码去控制硬件即可！
    *   **处理工业相机原图流/高频传感折线**：实例化 `ImageStreamManager` 或 `FloatDataChannel` 并推入 C# 获取的原始数组 (`Push(data)`) 即可。

#### 2. 前端开发者工作流

*   **获取最新仓库生成的代码**：当后端的 C# 兄弟调用完生成器后，你的项目中会多出一个开箱即用的状态库 `useAppStore` Hook 钩子。你无需阅读和维护哪怕一句 Fetch / Promise 或 Window.postMessage 的 IPC 同步代码和类型系统定义文件。
*   **直接实现 UI 表现与数据的绑定**：
    *   **读取控制参数**：通过 `const exposure = useAppStore(state => state.VisionVM.Exposure);` 直取。
    *   **写入控制指令**：通过自带的方法调用 `useAppStore(state => state.setBackendState("VisionVM", "Exposure", 新数值))`，之后 C# 机器就会随之而动，无需设计额外的动作接口 API 接口或者参数协商。
*   **通过强类型指令触发动作**：在前端交互组件中直接调用生成的包装函数，如 `await VisionVM_GetStatusSummary("测试")` 就能自动享有参数类型提示，并且可以通过底层 Promise 直接拿到 C# 端处理后的返回值内容。
*   **渲染工业数据高频信号/海量数据流**：
    *   **对付实时工业相机画面**：直接将提供的业务组件引入 React 渲染流 `<ImageStream channel="camera1" />` 即可直接拉取高清图并上屏。
    *   **对付数百赫兹的高频波形图**：使用自定义 Hook 提取零拷贝内存切片： `const { getActiveData, tick } = useSharedBuffer('LaserSensor')` 得到安全的并实时翻盘变化的数据段，塞给 ECharts 等图表做绘制操作。
