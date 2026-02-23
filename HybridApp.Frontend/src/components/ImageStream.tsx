import { useEffect, useRef } from 'react';

interface ImageStreamProps {
  channel: string;
  fps?: number;
  className?: string;
}

export function ImageStream({ channel, fps = 30, className }: ImageStreamProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (imgRef.current) {
        // Update the src with a timestamp to force a reload
        // Assuming the backend serves the image at /api/stream/{channel}
        // Adjust the URL as per your backend implementation
        const timestamp = performance.now();
        // We use a base URL, but in a real app this might come from config
        // For now, we assume the image is served from the same origin or a known endpoint
        // Since the requirement says "update src with timestamp query param", I'll assume a placeholder URL structure
        // that the backend is expected to handle.
        // However, usually "ImageStream" implies fetching frames.
        // If it's a high-speed channel, maybe it's just a raw buffer?
        // But the requirement specifically says "update src". This implies an <img> tag.
        
        // Let's assume a convention like /stream/{channel}
        imgRef.current.src = `/stream/${channel}?t=${timestamp}`;
      }
    }, 1000 / fps);

    return () => clearInterval(intervalId);
  }, [channel, fps]);

  return (
    <img
      ref={imgRef}
      className={className}
      alt={`Stream for ${channel}`}
      style={{ display: 'block', maxWidth: '100%' }}
    />
  );
}
