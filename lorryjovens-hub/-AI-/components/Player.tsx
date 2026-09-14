import React, { useEffect, useRef, useMemo } from 'react';
import { TrackClip, FilterConfig } from '../types';
import { Icons } from './Icon';

interface PlayerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  clips: TrackClip[];
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  isProxyMode: boolean;
}

export const Player: React.FC<PlayerProps> = ({ 
  currentTime, 
  duration, 
  isPlaying, 
  clips, 
  onTogglePlay,
  onSeek,
  isProxyMode
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Find the top-most visible video clip (Track 1 is usually top visually, 
  // but in layers, higher index often covers lower. Let's assume Track ID 1 is top layer for now)
  // Actually, usually bottom track in list is top layer. 
  // Let's filter for all active clips and pick the one from the "highest" track (conceptually).
  // For simplicity: Find the first video clip at this time.
  const activeClip = clips.find(c => 
    currentTime >= c.startTime && currentTime < c.startTime + c.duration && c.type === 'video'
  );

  // Sync video element with timeline time
  useEffect(() => {
    if (videoRef.current) {
      if (activeClip) {
        // Calculate the time relative to the source asset
        const relativeTime = (currentTime - activeClip.startTime) + activeClip.offset;
        
        // Only update if difference is significant to prevent stutter
        if (Math.abs(videoRef.current.currentTime - relativeTime) > 0.3) {
          videoRef.current.currentTime = relativeTime;
        }

        if (videoRef.current.src !== activeClip.src) {
           videoRef.current.src = activeClip.src;
        }

        if (isPlaying && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        } else if (!isPlaying && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      } else {
        videoRef.current.pause();
        if(videoRef.current.src) videoRef.current.removeAttribute('src'); 
      }
    }
  }, [currentTime, isPlaying, activeClip]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  // Construct CSS filter string
  const filterStyle = useMemo(() => {
    if (!activeClip?.filters) return {};
    const filterString = activeClip.filters.map(f => {
      if (f.type === 'blur') return `blur(${f.value}px)`;
      if (f.type === 'hue-rotate') return `hue-rotate(${f.value}deg)`;
      return `${f.type}(${f.value}%)`;
    }).join(' ');
    return { filter: filterString };
  }, [activeClip]);

  return (
    <div className="flex flex-col h-full bg-black relative group select-none">
      {/* Video Display */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative bg-black">
        {activeClip ? (
          <video 
            ref={videoRef}
            className="max-h-full max-w-full shadow-2xl transition-all duration-75"
            style={{
              ...filterStyle,
              // Simulate proxy by slightly blurring if proxy mode is on, or reducing opacity (visual cue)
              opacity: isProxyMode ? 0.9 : 1
            }}
            muted={false} 
          />
        ) : (
          <div className="text-gray-600 flex flex-col items-center">
             <div className="w-16 h-16 border-2 border-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icons.Play className="ml-1 opacity-50" />
             </div>
             <p>No video at playhead</p>
          </div>
        )}
        
        {/* Proxy Mode Indicator */}
        {isProxyMode && activeClip && (
          <div className="absolute top-4 left-4 bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            Proxy Preview
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-6 px-4 shrink-0 z-20">
        <span className="text-cyan-400 font-mono text-sm w-24 text-right">
          {formatTime(currentTime)}
        </span>

        <button 
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? <Icons.Pause fill="black" size={18} /> : <Icons.Play fill="black" className="ml-1" size={18} />}
        </button>

        <span className="text-gray-500 font-mono text-sm w-24">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};