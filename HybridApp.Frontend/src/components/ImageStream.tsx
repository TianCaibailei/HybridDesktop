import React, { useRef, useEffect } from 'react';

interface ImageStreamProps {
    channel: string;
    fps?: number;
    className?: string;
}

export const ImageStream: React.FC<ImageStreamProps> = ({ channel, fps = 30, className }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const intervalMs = 1000 / fps;
        
        const fetchNextFrame = () => {
            if (imgRef.current) {
                imgRef.current.src = `http://hybrid.vision/${channel}?t=${performance.now()}`;
            }
        };

        timerRef.current = setInterval(fetchNextFrame, intervalMs);

        return () => clearInterval(timerRef.current);
    }, [channel, fps]);

    return (
        <img 
            ref={imgRef} 
            className={className} 
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }} 
            alt={`Stream: ${channel}`} 
        />
    );
};
