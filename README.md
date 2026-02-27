# HybridDesktop
[中文 (Chinese)](README.zh-CN.md) | **English**

## 🚀 Hybrid Desktop Architecture

HybridDesktop is a **modern hybrid presentation framework** specially built for high-performance desktop software such as industrial control software, non-standard automation, and machine vision. It is dedicated to seamlessly merging the powerful underlying hardware logic and algorithm processing capabilities of C# with the flexible and stunning UI presentation of modern web technologies (like React, Vue, etc.).

### 🎯 The Problem it Solves

Traditional WPF or WinForms faces significant constraints regarding complex and modern UIs, animations, or contemporary charting libraries (like ECharts). On the other hand, conventional hybrid schemes (such as Electron-based architectural solutions) often suffer from tedious, error-prone Inter-Process Communication (IPC), restricted bottom-layer hardware calls, and considerable communication performance overheads.

This project uses the **"Single Source of Truth and State-Driven"** paradigm to completely solve these issues:
The backend (C#) directly defines and serves as the sole source of core state data. The frontend works explicitly as a consumer presentation layer. Between them lies a core middleware layer that guarantees complete and invisible two-way synchronizations—**You never need to manually write those tedious IPC messages/channels codes again.**

### ✨ Core Advantages

1. **Automatic State Sync Engine**: Mark your C# models completely using `[SyncViewModel]` and `[SyncProperty]`. The framework uses its paired tools to create native state-trees (like Zustand) on your frontend directly. A sudden variation at either end ensures a completely invisible, automatic two-way mapping logic.
2. **Deep Support for Complex Classes & Dynamics Collections**: Fully transcends basic numerical bindings. Enjoy seamless structural binding into complex nested objects (e.g., `ComplexVM.Config.InternalCamera`) or dynamic reactive array tracking properties (`ObservableCollection<T>`), allowing reflective UI mutation updates.
3. **Ultra-Fast Stream & Native Memory IPC Channels**: The framework intentionally ditches sluggish JSON / Base64 conversion models on high-frequency signals.
   - **Image Streams (`ImageStream`)**: Built upon local virtual domain web-resource requests. Frontend developers just drop `<ImageStream channel="camera1" />` to render raw source matrices at >60FPS directly.
   - **Shared Memory Data Path (`FloatDataChannel`)**: Capitalizes on WebView2's internal SharedBuffer. Sends successive raw data chunks (like sensors or PLCs readings) via backend. Frontends extract the real `Float32Array` memory chunks using guaranteed **Zero-Copy** architectures allowing unlimited ultra-frequency capabilities.
4. **Strong Typing and Automation Engine**: Contains the automatic `TsStoreGenerator`. Designs structured across the C# environment can be extracted automatically into frontend production-level TypeScript Interfaces with integrated Store Managers with one single keystroke. Complete end-to-end type safety in entirely quarantined architectures.
5. **Strongly-Typed Command Bus**: Going beyond state synchronization, a dedicated `[SyncCommand]` attribute is included. Mark any C# method to instantly generate a strongly-typed TypeScript invocation function (including parameters, return types, and JSDoc comments). The frontend can call C# logic directly via `await VisionVM_GetStatusSummary("prefix")`, with seamless Promise-based return value handling and zero manual routing code.

---

### 👨‍💻 Workflow (How It Operates)

This framework introduces unmatched decoupling logic for back and frontend teams!

#### 1. For C# Backend Developers

*   **Define Your Data Standard**: Author standard native C# Models extending `SyncViewModelBase` in `HybridApp.Core`. Add the necessary class attributes (`[SyncViewModel]`) and property attributes (`[SyncProperty]`).
*   **Define Your Business Actions**: Mark methods with `[SyncCommand]` to expose them as invokable endpoints for the frontend, taking strongly-typed parameters directly (e.g., `void ToggleRunning(string reason)`).
*   **One-click Generator Action**: Call `TsStoreGenerator.Generate()`. This immediately scans everything and regenerates up-to-date explicit TypeScript definitions, stores, and command wrapper functions over to the repository `generatedStore.ts` directories.
*   **Register to System Manager**: Hook in and mount your instanced VM units onto the master `ViewModelManager` from your WinForms/WPF shells.
*   **Start Using Your Logic Now**: Any mutations inside your property configurations (e.g., `Exposure = 50`) will be replicated immediately on your Frontend clients. Contrastingly, if frontend manipulates sliders, natural C# property `setter` blocks followed by standard `PropertyChanged` events activate normally without mapping instructions, you just drive your machine hardware instantly.
    *   **Driving Huge Streams Or Wave Form Sensors**: Setup `ImageStreamManager` instances or `FloatDataChannel` models, pushing bytes payload instantly via `Push(data)`.

#### 2. For Frontend Developers

*   **Adopt Repositories & Generated Stores**: Once C# colleagues enact generators, your front-end repository contains an out-of-the-box global state hook titled `useAppStore`. You do not need to configure any manual IPC definitions, EventListeners, nor any mapping schemas.
*   **Start Constructing Responsive Data Driven Interfaces**:
    *   **Pull Configurations**: Read them strictly via typed environments dynamically: `const exposure = useAppStore(state => state.VisionVM.Exposure);`
    *   **Execute Parameters Settings**: Simply utilize its innate generated function methodologies to interact back with hardware APIs without requesting manual contracts: `useAppStore(state => state.setBackendState("VisionVM", "Exposure", newValue))`
*   **Fire Strongly-Typed Actions**: Call C# methods seamlessly right inside your interactive components using generated wrapper functions: `await VisionVM_GetStatusSummary("test")` handles parameters typing and retrieves the backend return response via a native JS Promise.
*   **Consume Powerful Stream Telemetry Realtime Displays**:
    *   **Rendering Raw Machine Vision Views**: Drop the component directly into React flows: `<ImageStream channel="camera1" />`. High definition frames sync immediately over virtual pipes.
    *   **Consuming Mass Metric Waveform Arrays**: Utilize custom hooks fetching shared fragments instantly mapped against memory ranges without serializations: `const { getActiveData, tick } = useSharedBuffer('LaserSensor')` and feed payload arrays right into libraries like ECharts.
