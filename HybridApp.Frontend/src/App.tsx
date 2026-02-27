import { useEffect, useRef, useState } from 'react';
import './App.css';
import { useAppStore, VisionVM_ToggleRunning, VisionVM_GetStatusSummary } from './store/generatedStore';
import { ImageStream } from './components/ImageStream';
import { useSharedBuffer } from './hooks/useSharedBuffer';

function App() {
  const updateStateFromBackend = useAppStore((state) => state.updateStateFromBackend);
  const initFullState = useAppStore((state) => state.initFullState);
  const setBackendState = useAppStore((state) => state.setBackendState);

  const visionVM = useAppStore((state) => state.visionVM);
  const complexVM = useAppStore((state) => (state as any).complexVM);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getActiveData, tick } = useSharedBuffer("sine-wave");

  // Command Demo State
  const [toggleReason, setToggleReason] = useState('user-click');
  const [summaryPrefix, setSummaryPrefix] = useState('STATUS');
  const [summaryResult, setSummaryResult] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [commandLog, setCommandLog] = useState<string[]>([]);

  const appendLog = (msg: string) =>
    setCommandLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = typeof event.data === 'string' && event.data.startsWith('{')
        ? JSON.parse(event.data)
        : event.data;

      if (data && data.type === 'STATE_SYNC') {
        const { vmName, propName, value } = data.payload;
        updateStateFromBackend(vmName, propName, value);
      } else if (data && data.type === 'INIT_RESPONSE') {
        initFullState(data.state);
      }
    };

    if ((window as any).chrome?.webview) {
      (window as any).chrome.webview.addEventListener('message', handleMessage);
      (window as any).chrome.webview.postMessage({ type: 'INIT_REQUEST' });
    }

    return () => {
      if ((window as any).chrome?.webview) {
        (window as any).chrome.webview.removeEventListener('message', handleMessage);
      }
    };
  }, [updateStateFromBackend, initFullState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = getActiveData();
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '14px Arial';
      ctx.fillText("Oscilloscope: No Signal", 10, 30);
      return;
    }

    ctx.strokeStyle = '#00ff41'; // Matrix Green
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = canvas.width / data.length;
    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = canvas.height / 2 - data[i] * (canvas.height / 3);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [tick, getActiveData]);

  return (
    <div className="App" style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)',
      gap: '24px',
      padding: '30px',
      backgroundColor: '#121212',
      color: '#e0e0e0',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
    }}>
      <header style={{ gridColumn: 'span 2', textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ color: '#00d8ff', margin: 0 }}>Hybrid App Synchronizer</h1>
        <p style={{ color: '#888', marginTop: '5px' }}>High-Performance Dual-Sync Data Link</p>
      </header>

      {/* Vision Controls */}
      <div className="card" style={{ background: '#1e1e1e', borderRadius: '12px', padding: '20px', border: '1px solid #333' }}>
        <h2 style={{ borderBottom: '2px solid #00d8ff', paddingBottom: '10px', marginTop: 0 }}>Vision Parameters</h2>
        <div style={{ padding: '15px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label>Exposure</label>
            <b style={{ color: '#00d8ff' }}>{visionVM?.exposure}</b>
          </div>
          <input
            type="range" min="1" max="100" style={{ width: '100%' }}
            value={visionVM?.exposure ?? 10}
            onChange={(e) => setBackendState("VisionVM", "Exposure", Number(e.target.value))}
          />
        </div>
        <div style={{ padding: '15px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label>Gain</label>
            <b style={{ color: '#00d8ff' }}>{visionVM?.gain?.toFixed(2)}</b>
          </div>
          <input
            type="range" min="1" max="10" step="0.1" style={{ width: '100%' }}
            value={visionVM?.gain ?? 1}
            onChange={(e) => setBackendState("VisionVM", "Gain", Number(e.target.value))}
          />
        </div>
        <button
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: visionVM?.isRunning ? '#2e7d32' : '#c62828',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
          onClick={() => setBackendState("VisionVM", "IsRunning", !visionVM?.isRunning)}>
          {visionVM?.isRunning ? 'SYSTEM RUNNING ON' : 'SYSTEM STOPPED OFF'}
        </button>
      </div>

      {/* Complex Data Panel - Optimized */}
      <div className="card" style={{ background: '#1e1e1e', borderRadius: '12px', padding: '20px', border: '1px solid #333' }}>
        <h2 style={{ borderBottom: '2px solid #ff9800', paddingBottom: '10px', marginTop: 0 }}>Device Configuration</h2>
        {complexVM?.config ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: '#252525', padding: '15px', borderRadius: '8px' }}>
              <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>MODEL NAME</label>
              <input
                type="text"
                value={complexVM.config.modelName}
                onChange={(e) => {
                  const newConfig = { ...complexVM.config, modelName: e.target.value };
                  setBackendState("ComplexVM", "Config", newConfig);
                }}
                style={{
                  width: '100%',
                  background: '#333',
                  border: '1px solid #444',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#252525', padding: '12px', borderRadius: '8px' }}>
                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>RES X</label>
                <input
                  type="number"
                  value={complexVM.config.internalCamera.resolutionX}
                  onChange={(e) => {
                    const newConfig = {
                      ...complexVM.config,
                      internalCamera: { ...complexVM.config.internalCamera, resolutionX: Number(e.target.value) }
                    };
                    setBackendState("ComplexVM", "Config", newConfig);
                  }}
                  style={{ width: '100%', background: '#333', border: 'none', color: '#ff9800', fontWeight: 'bold' }}
                />
              </div>
              <div style={{ background: '#252525', padding: '12px', borderRadius: '8px' }}>
                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>RES Y</label>
                <input
                  type="number"
                  value={complexVM.config.internalCamera.resolutionY}
                  onChange={(e) => {
                    const newConfig = {
                      ...complexVM.config,
                      internalCamera: { ...complexVM.config.internalCamera, resolutionY: Number(e.target.value) }
                    };
                    setBackendState("ComplexVM", "Config", newConfig);
                  }}
                  style={{ width: '100%', background: '#333', border: 'none', color: '#ff9800', fontWeight: 'bold' }}
                />
              </div>
            </div>

            <div style={{ background: '#252525', padding: '12px', borderRadius: '8px' }}>
              <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>SUPPORTED MODES</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {complexVM.config.internalCamera.supportedModes.map((mode: string, idx: number) => (
                  <span key={idx} style={{ background: '#444', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{mode}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div className="spinner"></div>
            <p>Retrieving Complex Configuration...</p>
          </div>
        )}
      </div>

      {/* Video Channel */}
      <div className="card" style={{ background: '#1e1e1e', borderRadius: '12px', padding: '20px', border: '1px solid #333' }}>
        <h2 style={{ borderBottom: '2px solid #e91e63', paddingBottom: '10px', marginTop: 0 }}>Real-time Stream</h2>
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
          <ImageStream channel="camera1" fps={30} />
        </div>
      </div>

      {/* Oscilloscope */}
      <div className="card" style={{ background: '#1e1e1e', borderRadius: '12px', padding: '20px', border: '1px solid #333' }}>
        <h2 style={{ borderBottom: '2px solid #00ff41', paddingBottom: '10px', marginTop: 0 }}>SharedBuffer Data</h2>
        <canvas ref={canvasRef} width={600} height={250} style={{ width: '100%', border: '1px solid #333', display: 'block', borderRadius: '8px' }} />
      </div>

      {/* SyncCommand Demo Panel */}
      <div className="card" style={{ gridColumn: 'span 2', background: '#1a1a2e', borderRadius: '12px', padding: '20px', border: '1px solid #7c4dff' }}>
        <h2 style={{ borderBottom: '2px solid #7c4dff', paddingBottom: '10px', marginTop: 0, color: '#b388ff' }}>
          ⚡ SyncCommand Demo — Frontend → C# Method Invocation
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>

          {/* Void Command: ToggleRunning */}
          <div style={{ background: '#252540', padding: '16px', borderRadius: '10px', border: '1px solid #5c6bc0' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#9fa8da' }}>void Command — ToggleRunning</h3>
            <label style={{ fontSize: '12px', color: '#777', display: 'block', marginBottom: '4px' }}>切换原因 (reason)</label>
            <input
              type="text"
              value={toggleReason}
              onChange={e => setToggleReason(e.target.value)}
              style={{ width: '100%', background: '#1a1a2e', border: '1px solid #444', color: '#e0e0e0', padding: '6px 10px', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            <button
              style={{ width: '100%', padding: '10px', background: '#5c6bc0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => {
                VisionVM_ToggleRunning(toggleReason);
                appendLog(`→ ToggleRunning("${toggleReason}") sent — void, no return`);
              }}
            >
              Call ToggleRunning()
            </button>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px', marginBottom: 0 }}>
              无返回值，IsRunning 状态会立即通过数据同步反映在 Vision Parameters 面板中
            </p>
          </div>

          {/* Async Command: GetStatusSummary with return value */}
          <div style={{ background: '#252540', padding: '16px', borderRadius: '10px', border: '1px solid #00bcd4' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#80deea' }}>async Command — GetStatusSummary</h3>
            <label style={{ fontSize: '12px', color: '#777', display: 'block', marginBottom: '4px' }}>前缀 (prefix)</label>
            <input
              type="text"
              value={summaryPrefix}
              onChange={e => setSummaryPrefix(e.target.value)}
              style={{ width: '100%', background: '#1a1a2e', border: '1px solid #444', color: '#e0e0e0', padding: '6px 10px', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            <button
              disabled={summaryLoading}
              style={{ width: '100%', padding: '10px', background: summaryLoading ? '#333' : '#00838f', color: '#fff', border: 'none', borderRadius: '6px', cursor: summaryLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              onClick={async () => {
                setSummaryLoading(true);
                setSummaryResult('');
                try {
                  appendLog(`→ GetStatusSummary("${summaryPrefix}") sent, awaiting Promise...`);
                  const result = await VisionVM_GetStatusSummary(summaryPrefix);
                  setSummaryResult(result);
                  appendLog(`← GetStatusSummary returned: "${result}"`);
                } catch (e: any) {
                  setSummaryResult(`Error: ${e.message}`);
                  appendLog(`✗ GetStatusSummary failed: ${e.message}`);
                } finally {
                  setSummaryLoading(false);
                }
              }}
            >
              {summaryLoading ? 'Waiting for C# response...' : 'Call GetStatusSummary()'}
            </button>
            {summaryResult && (
              <div style={{ marginTop: '10px', background: '#1a1a2e', padding: '8px 12px', borderRadius: '6px', border: '1px solid #00bcd4', fontSize: '13px', color: '#80deea', wordBreak: 'break-all' }}>
                <b>返回值：</b> {summaryResult}
              </div>
            )}
          </div>

          {/* Command Log */}
          <div style={{ background: '#0d0d1a', padding: '16px', borderRadius: '10px', border: '1px solid #37474f' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '14px', color: '#78909c' }}>Command Log</h3>
            <div style={{ height: '148px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {commandLog.length === 0
                ? <span style={{ color: '#444' }}>No commands yet...</span>
                : commandLog.map((line, i) => (
                  <div key={i} style={{ color: line.startsWith('[') && line.includes('←') ? '#80deea' : line.includes('✗') ? '#ef9a9a' : '#aaa' }}>{line}</div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #333;
            border-top: 3px solid #ff9800;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input[type=range] { accent-color: #00d8ff; }
      `}</style>
    </div>
  );
}

export default App;
