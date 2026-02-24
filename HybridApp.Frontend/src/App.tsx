import { useEffect, useRef } from 'react';
import './App.css';
import { useAppStore } from './store/generatedStore';
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
