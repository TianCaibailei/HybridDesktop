import { useEffect, useRef, useState, useCallback } from 'react';

export function useSharedBuffer(channelName: string) {
    const sharedArrayRef = useRef<Float32Array | null>(null);
    const [tick, setTick] = useState(0);
    const dataLengthRef = useRef<number>(0);

    useEffect(() => {
        const handleSharedBuffer = (e: any) => {
            if (e.additionalData === channelName) {
                sharedArrayRef.current = new Float32Array(e.getBuffer());
                console.log(`[SharedMem] Channel ${channelName} connected.`);
            }
        };

        const handleMessage = (e: any) => {
            if (typeof e.data === 'string' && e.data.startsWith('SHARED_MEM_READY:')) {
                const parts = e.data.split(':');
                if (parts[1] === channelName) {
                    dataLengthRef.current = parseInt(parts[2], 10);
                    setTick(t => t + 1);
                }
            }
        };

        if ((window as any).chrome?.webview) {
            (window as any).chrome.webview.addEventListener('sharedbufferreceived', handleSharedBuffer);
            (window as any).chrome.webview.addEventListener('message', handleMessage);
            // 主动向后端请求一次句柄，防止组件加载晚于句柄推送
            (window as any).chrome.webview.postMessage({ type: 'REQUEST_BUFFER_HANDLE', channelName });
        }

        return () => {
            (window as any).chrome?.webview?.removeEventListener('sharedbufferreceived', handleSharedBuffer);
            (window as any).chrome?.webview?.removeEventListener('message', handleMessage);
        };
    }, [channelName]);

    const getActiveData = useCallback(() => {
        if (!sharedArrayRef.current) return new Float32Array(0);
        return sharedArrayRef.current.subarray(0, dataLengthRef.current);
    }, []);

    return { getActiveData, tick };
}
