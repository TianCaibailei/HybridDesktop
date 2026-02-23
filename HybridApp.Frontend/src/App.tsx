import { useEffect, useRef } from 'react';
import './App.css';
import { useAppStore } from './store/generatedStore';
import { ImageStream } from './components/ImageStream';

function App() {
  const updateStateFromBackend = useAppStore((state) => state.updateStateFromBackend);
  const visionVM = useAppStore((state) => state.visionVM);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
