# Hybrid Desktop 混合桌面架构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立包含 HybridApp.Core, Wpf, WinForms 和 Frontend 四个工程的混合桌面架构，并实现状态同步与高速通道。

**Architecture:** C# 作为单一数据源 (ViewModel)，前端 React 作为表现层。利用 WebView2 实现双向通信、基于 HTTP 的高帧率图像通道，以及基于 SharedBuffer 的零拷贝高频信号通道。通过反射工具 TsStoreGenerator 在开发模式下自动为前端生成 Zustand Store 代码。

**Tech Stack:** C# .NET 8, WPF, WinForms, WebView2, TypeScript, React, Vite, Zustand, Immer.

---

### Task 1: 初始化解决方案与工程结构

**Files:**
- Create: `HybridDesktop.sln`
- Create: `HybridApp.Core/HybridApp.Core.csproj`
- Create: `HybridApp.Wpf/HybridApp.Wpf.csproj`
- Create: `HybridApp.WinForms/HybridApp.WinForms.csproj`

**Step 1: 创建解决方案并添加核心项目**
```bash
dotnet new sln -n HybridDesktop
dotnet new classlib -n HybridApp.Core -f net8.0
dotnet new wpf -n HybridApp.Wpf -f net8.0-windows
dotnet new winforms -n HybridApp.WinForms -f net8.0-windows
dotnet sln add HybridApp.Core/HybridApp.Core.csproj
dotnet sln add HybridApp.Wpf/HybridApp.Wpf.csproj
dotnet sln add HybridApp.WinForms/HybridApp.WinForms.csproj
```

**Step 2: 添加项目引用和 NuGet 包**
```bash
dotnet add HybridApp.Wpf/HybridApp.Wpf.csproj reference HybridApp.Core/HybridApp.Core.csproj
dotnet add HybridApp.WinForms/HybridApp.WinForms.csproj reference HybridApp.Core/HybridApp.Core.csproj
dotnet add HybridApp.Wpf package Microsoft.Web.WebView2
dotnet add HybridApp.WinForms package Microsoft.Web.WebView2
dotnet add HybridApp.Core package Microsoft.Web.WebView2
```

**Step 3: 初始化前端工程**
```bash
npm create vite@latest HybridApp.Frontend -- --template react-ts
cd HybridApp.Frontend
npm install
npm install zustand immer
```

**Step 4: Commit**
```bash
git init
git add .
git commit -m "chore: initialize solution and project structure"
```

---

### Task 2: 实现 C# 核心状态树机制 (SyncViewModelBase)

**Files:**
- Create: `HybridApp.Core/Attributes/SyncAttributes.cs`
- Create: `HybridApp.Core/ViewModels/SyncViewModelBase.cs`

**Step 1: 创建特性标记类**
在 `HybridApp.Core/Attributes/SyncAttributes.cs` 中添加 `SyncViewModelAttribute` 和 `SyncPropertyAttribute`。

**Step 2: 实现状态基类**
在 `HybridApp.Core/ViewModels/SyncViewModelBase.cs` 中实现 `INotifyPropertyChanged` 和 `SetProperty`，在赋值时触发拦截回调 `_syncAction`。

**Step 3: 编译验证**
运行 `dotnet build HybridApp.Core`，期望 0 错误。

**Step 4: Commit**
```bash
git add HybridApp.Core/Attributes HybridApp.Core/ViewModels
git commit -m "feat: add SyncViewModelBase and attributes"
```

---

### Task 3: 实现高速通道封装 (ImageStreamManager & FloatDataChannel)

**Files:**
- Create: `HybridApp.Core/Channels/ImageStreamManager.cs`
- Create: `HybridApp.Core/Channels/FloatDataChannel.cs`

**Step 1: 实现图像流通道**
编写 `ImageStreamManager`，监听 `http://hybrid.vision/*` 虚拟域名拦截并触发回调获取 `byte[]`，返回 200/jpeg。

**Step 2: 实现浮点信号共享内存通道**
编写 `FloatDataChannel`，接管 `CoreWebView2SharedBuffer`，提供 `Push(float[])` 覆写内存，并发送 `SHARED_MEM_READY` 消息。

**Step 3: 编译验证**
运行 `dotnet build HybridApp.Core`，期望 0 错误。

**Step 4: Commit**
```bash
git add HybridApp.Core/Channels
git commit -m "feat: implement high-frequency data channels"
```

---

### Task 4: 实现前端 Zustand 同步基建及 Hooks

**Files:**
- Create: `HybridApp.Frontend/src/store/generatedStore.ts` (基础占位)
- Create: `HybridApp.Frontend/src/hooks/useSharedBuffer.ts`
- Create: `HybridApp.Frontend/src/components/ImageStream.tsx`

**Step 1: 添加共享内存 Hook**
在 `useSharedBuffer.ts` 中实现监听 `sharedbufferreceived` 并管理 `Float32Array`，通过 tick 通知重绘。

**Step 2: 添加图像流组件**
在 `ImageStream.tsx` 中实现定时利用 `requestAnimationFrame` 或 `setInterval` 强制刷新 src 的逻辑。

**Step 3: 验证 TypeScript**
在 frontend 目录执行 `npx tsc --noEmit`，期望无报错。

**Step 4: Commit**
```bash
git add HybridApp.Frontend/src/hooks HybridApp.Frontend/src/components
git commit -m "feat: add frontend hooks and components for high-speed channels"
```

---

### Task 5: 编写 TsStoreGenerator

**Files:**
- Create: `HybridApp.Core/Generators/TsStoreGenerator.cs`

**Step 1: 实现反射与代码生成**
扫描当前 Assembly 中含有 `[SyncViewModel]` 的类，生成包含类型声明、空初始状态对象和 `updateStateFromBackend` / `setBackendState` 的 TS 代码内容，并写入指定路径。

**Step 2: 编译验证**
运行 `dotnet build HybridApp.Core`，期望 0 错误。

**Step 3: Commit**
```bash
git add HybridApp.Core/Generators
git commit -m "feat: implement TsStoreGenerator reflection tool"
```

---

### Task 6: 联调与测试验证 (Demo UI)

**Files:**
- Modify: `HybridApp.Wpf/MainWindow.xaml` & `MainWindow.xaml.cs`
- Modify: `HybridApp.Frontend/src/App.tsx`
- Create: `HybridApp.Core/ViewModels/VisionVM.cs`

**Step 1: 定义测试 ViewModel**
在 Core 创建 `VisionVM` 并加上 `[SyncViewModel("VisionVM")]`，增加一个可修改的 `Exposure` 属性。

**Step 2: 组装 WPF 宿主**
在 WPF `MainWindow.xaml` 中放入 `WebView2`，在代码后置中调用 `EnsureCoreWebView2Async`，挂载 `TsStoreGenerator`，挂载 `ImageStreamManager`（返回模拟红绿噪点 byte[]）和 `FloatDataChannel`（后台线程发送正弦波）。导航到 `http://localhost:5173`。

**Step 3: 组装前端**
修改 `App.tsx` 建立全局 WebView2 消息监听（针对 `STATE_SYNC` 和 `INIT_RESPONSE`），并调用生成出的 Store，渲染 `ImageStream` 和 Canvas 画波形。

**Step 4: 运行与验证**
1. 启动 `npm run dev` in frontend。
2. 启动 WPF 应用 (F5)。
3. 验证: 代码生成器应覆盖 `generatedStore.ts`；UI 上可以看到图像流和实时正弦波；并且通过输入框修改 `Exposure` 时能从 Console 确认 C# 收到了修改事件。

**Step 5: Commit**
```bash
git add .
git commit -m "feat: integrate Demo UI across backend and frontend"
```
