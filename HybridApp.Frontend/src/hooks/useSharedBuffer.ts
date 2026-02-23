import { useEffect, useRef, useState } from 'react';

interface SharedBufferEvent extends CustomEvent {
  detail: {
    channel: string;
    buffer: SharedArrayBuffer;
  };
}

export function useSharedBuffer(channelName: string) {
  const bufferRef = useRef<SharedArrayBuffer | null>(null);
  const float32ArrayRef = useRef<Float32Array | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleSharedBuffer = (event: Event) => {
      const customEvent = event as SharedBufferEvent;
      if (customEvent.detail && customEvent.detail.channel === channelName) {
        bufferRef.current = customEvent.detail.buffer;
        float32ArrayRef.current = new Float32Array(bufferRef.current);
        console.log(`Shared buffer received for channel: ${channelName}`);
        setTick(t => t + 1);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string' && event.data.startsWith('SHARED_MEM_READY:')) {
        const readyChannel = event.data.split(':')[1];
        if (readyChannel === channelName) {
          // Force a re-render or update state to indicate new data is available
          setTick((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('sharedbufferreceived', handleSharedBuffer);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('sharedbufferreceived', handleSharedBuffer);
      window.removeEventListener('message', handleMessage);
    };
  }, [channelName]);

  const getActiveData = () => {
    return float32ArrayRef.current;
  };

  return { getActiveData, tick };
}
