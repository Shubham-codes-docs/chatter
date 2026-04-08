import { useEffect, useRef } from 'react';

interface VideoTileProps {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}

const VideoTile = ({ stream, muted = false, className }: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(console.error);
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
};

export default VideoTile;
