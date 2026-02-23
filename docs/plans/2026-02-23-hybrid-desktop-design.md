# Hybrid Desktop 混合桌面架构设计文档

**Date:** 2026-02-23
**Context:** 基于 C# (WPF/WinForms) 和 React (WebView2) 的混合桌面应用架构，针对工业自动化和视觉检测场景。

## 1. 架构概述

本项目旨在将 C# 的底层控制（硬件交互、视觉算法）与现代 Web 前端（React, Tailwind, Zustand）完美结合。
核心思想为 **“单一事实来源 (Single Source of Truth)”**：C# 作为唯一数据源，前端仅作为状态的映射层。通过自动化的代码生成和内存共享通道，实现前后端的无缝且高性能的交互。

## 2. 解决方案结构 (Solution Structure)

整个方案拆分为四个核心工程，以达到最高级别的代码复用：
* **`HybridApp.Core` (.NET 8 Class Library)**：包含所有的业务逻辑、ViewModel 状态基类、数据通道封装及自动代码生成工具。
* **`HybridApp.Wpf` (.NET 8 WPF Application)**：WPF 宿主。负责承载 `WebView2.Wpf` 并初始化 Core 层逻辑。
* **`HybridApp.WinForms` (.NET 8 WinForms Application)**：WinForms 宿主。承载 `WebView2.WinForms` 并初始化相同的 Core 逻辑。前端代码与 Core 层逻辑在此处实现 0 修改。
* **`HybridApp.Frontend` (Vite + React + TS)**：纯前端工程。使用 Zustand 和 Immer 管理应用状态，通过构建产出的 `dist` 或开发时的 `localhost:5173` 接入宿主。

## 3. 核心机制设计

### 3.1 状态树同步 (State Tree Synchronization)
- **C# 到前端 (增量/全量同步)**：
  继承 `SyncViewModelBase` 的类中的属性在 `SetProperty` 被调用时触发拦截器。
  使用 JSON Patch 将属性名、ViewModel 名称和序列化后的值发送到 WebView2 的 `WebMessageReceived`。
  前端全局监听消息，通过 Zustand + Immer 以 Mutate 形式更新对应属性，驱动 React 重绘。
- **前端到 C# (反向推送)**：
  在前端使用生成的 `setBackendState(vm, property, value)` 更新状态，Zustand 发送 `STATE_SET` 的 IPC 消息。
  C# 端拦截该消息并利用反射找到属性，进行反序列化和赋值。

### 3.2 高速数据通道 (High-Frequency Channels)
为解决高帧率图像和波形数据传输时的性能瓶颈（如避免 JSON 序列化和 Base64 编码开销），设计了两条通道：
- **通道一：图像流 (ImageStreamManager)**
  C# 拦截特定域名（如 `http://hybrid.vision/*`），通过 `WebResourceRequested` 捕获请求并注入图片的 `byte[]` 数据，伪装成普通 HTTP 响应。
  前端使用定时器高频刷新 `<img>` src 的查询参数（加时间戳）来拉取最新帧，支持高达 60FPS。
- **通道二：高频信号 (FloatDataChannel)**
  C# 创建 `CoreWebView2SharedBuffer`（共享内存），暴露内存句柄给前端，业务层通过 `Push(float[])` 直接写入。
  前端的 `useSharedBuffer` 收到内存指针和写入长度后，创建 `Float32Array`，通过 Zero-Copy 传递给 Canvas 重绘。

### 3.3 运行时热更新代码生成 (TsStoreGenerator)
- 仅在 `#if DEBUG` 时启用。宿主程序启动后，`TsStoreGenerator` 会反射扫描当前 AppDomain 中被 `[SyncViewModel]` 标记的类。
- 它自动将 C# 的类型树结构映射为 TypeScript 接口，并生成包含空对象状态和完整 Redux 样式的 Zustand Store 代码。
- 最终写入到 `HybridApp.Frontend/src/store/generatedStore.ts`。由于 Vite 支持热更新 (HMR)，C# 重启引发的 TS 文件变更会立刻在浏览器中生效。开发者可立即获得类型提示，并在 UI 组件中消费新的状态字段。

## 4. 后续开发规划

1. **基础设施搭建**：创建解决方案和 4 个工程。
2. **Core 逻辑实现**：完成 `SyncViewModelBase`，特性标记，`ViewModelManager` 以及两条高速通道封装。
3. **生成器实现**：编写 `TsStoreGenerator` 工具类。
4. **前端基建**：搭建 Vite React 环境，封装 Zustand 同步逻辑与 `ImageStream`、`useSharedBuffer` Hooks。
5. **Demo 业务**：在 WPF/WinForms 及前端编写一套完整的测试 UI，展示状态同步和波形/图像流效果。
