import { useEffect, useRef } from 'react';

interface ImageStreamProps {
  channel: string;
  fps?: number;
  className?: string;
}

export function ImageStream({ channel, fps = 30, className }: ImageStreamProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (imgRef.current) {
        // Update the src with a timestamp to force a reload
        imgRef.current.src = `/stream/${channel}?t=${performance.now()}`;
      }
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [channel, fps]);

  return <img ref={imgRef} className={className} alt={`Stream ${channel}`} />;
}
