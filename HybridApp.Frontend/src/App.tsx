import { useEffect, useRef } from 'react';
import './App.css';
import { useAppStore } from './store/generatedStore';
import { ImageStream } from './components/ImageStream';
import { useSharedBuffer } from './hooks/useSharedBuffer';

function App() {
  const updateStateFromBackend = useAppStore((state) => state.updateStateFromBackend);
  const visionVM = useAppStore((state) => state.visionVM);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getActiveData, tick } = useSharedBuffer("sine-wave");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string' && event.data.startsWith('SHARED_MEM_READY:')) {
        // Handle shared buffer message
        console.log("Shared buffer ready:", event.data);
      } else {
        // Handle JSON message
        try {
            const data = event.data;
            if (data && data.type === 'STATE_SYNC') {
                const { vmName, propName, value } = data.payload;
                updateStateFromBackend(vmName, propName, value);
            }
        } catch (e) {
            console.error("Failed to parse message", e);
        }
      }
    };

    if (window.chrome && window.chrome.webview) {
      window.chrome.webview.addEventListener('message', handleMessage);
    }

    return () => {
      if (window.chrome && window.chrome.webview) {
        window.chrome.webview.removeEventListener('message', handleMessage);
      }
    };
  }, [updateStateFromBackend]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
        const data = getActiveData();
        if (data.length === 0) return;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#0f0';
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
    };

    render();
  }, [tick, getActiveData]);

  return (
    <div className="App">
      <h1>HybridApp Demo</h1>
      
      <div className="card">
        <h2>VisionVM State</h2>
        <p>Exposure: {visionVM?.exposure ?? 'N/A'}</p>
        <p>Gain: {visionVM?.gain ?? 'N/A'}</p>
        <p>IsRunning: {visionVM?.isRunning ? 'Yes' : 'No'}</p>
      </div>

      <div className="card">
        <h2>Image Stream</h2>
        <div style={{ width: 640, height: 480 }}>
            <ImageStream channel="camera1" fps={30} />
        </div>
      </div>

      <div className="card">
        <h2>Sine Wave (FloatDataChannel)</h2>
        <canvas ref={canvasRef} width={600} height={200} style={{ border: '1px solid black' }} />
      </div>
    </div>
  );
}

export default App;
