import React, { useRef, useState, useEffect } from 'react';
import { Track, TrackClip, Asset } from '../types';
import { Icons } from './Icon';

interface TimelineProps {
  tracks: Track[];
  duration: number;
  currentTime: number;
  pixelsPerSecond: number;
  selectedClipId: string | null;
  rippleMode: boolean;
  onSeek: (time: number) => void;
  onDropAsset: (asset: Asset, trackId: string, time: number) => void;
  onDeleteClip: (trackId: string, clipId: string) => void;
  onSelectClip: (clipId: string | null) => void;
  onZoomChange: (zoom: number) => void;
  onSplitClip: () => void;
  onToggleRipple: () => void;
  onAddTrack: () => void;
}

const SNAP_THRESHOLD_PX = 15; // Snap when within 15px

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  duration,
  currentTime,
  pixelsPerSecond,
  selectedClipId,
  rippleMode,
  onSeek,
  onDropAsset,
  onDeleteClip,
  onSelectClip,
  onZoomChange,
  onSplitClip,
  onToggleRipple,
  onAddTrack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rulerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dragOverTrack, setDragOverTrack] = useState<string | null>(null);

  const totalWidth = Math.max(duration * pixelsPerSecond + 200, window.innerWidth - 300);

  // Draw Ruler using Canvas
  useEffect(() => {
    const canvas = rulerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const height = 32;
    canvas.width = totalWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${height}px`;

    ctx.fillStyle = '#1f2937'; 
    ctx.fillRect(0, 0, totalWidth, height);
    
    ctx.fillStyle = '#9ca3af'; 
    ctx.strokeStyle = '#4b5563'; 
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';

    let tickInterval = 5; 
    if (pixelsPerSecond > 50) tickInterval = 1;
    if (pixelsPerSecond < 10) tickInterval = 10;
    if (pixelsPerSecond < 2) tickInterval = 30;

    for (let t = 0; t <= duration + 60; t += tickInterval) { 
       const x = t * pixelsPerSecond;
       ctx.beginPath();
       ctx.moveTo(x, 15);
       ctx.lineTo(x, height);
       ctx.stroke();
       ctx.fillText(`${t}s`, x + 4, 28);

       const subTicks = 4;
       const subInterval = tickInterval / (subTicks + 1);
       for(let j=1; j<=subTicks; j++) {
         const sx = x + j * subInterval * pixelsPerSecond;
         ctx.beginPath();
         ctx.moveTo(sx, 24);
         ctx.lineTo(sx, height);
         ctx.stroke();
       }
    }
  }, [totalWidth, duration, pixelsPerSecond]);

  const handleTimeHeaderClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 200; 
    const scrollLeft = containerRef.current.scrollLeft;
    const time = Math.max(0, (x + scrollLeft) / pixelsPerSecond);
    onSeek(time);
  };

  const handleDragOver = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    setDragOverTrack(trackId);
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    setDragOverTrack(null);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const x = e.clientX - rect.left - 200 + scrollLeft; 
    let time = Math.max(0, x / pixelsPerSecond);

    // Magnetic Snapping
    let closestDiff = Number.MAX_VALUE;
    let snappedTime = time;

    const distToPlayhead = Math.abs(time - currentTime);
    if (distToPlayhead * pixelsPerSecond < SNAP_THRESHOLD_PX) {
       if (distToPlayhead < closestDiff) {
         closestDiff = distToPlayhead;
         snappedTime = currentTime;
       }
    }

    const track = tracks.find(t => t.id === trackId);
    if (track) {
      track.clips.forEach(clip => {
        const startDist = Math.abs(time - clip.startTime);
        const endDist = Math.abs(time - (clip.startTime + clip.duration));

        if (startDist * pixelsPerSecond < SNAP_THRESHOLD_PX) {
           if (startDist < closestDiff) {
             closestDiff = startDist;
             snappedTime = clip.startTime;
           }
        }
        if (endDist * pixelsPerSecond < SNAP_THRESHOLD_PX) {
           if (endDist < closestDiff) {
             closestDiff = endDist;
             snappedTime = clip.startTime + clip.duration;
           }
        }
      });
    }

    time = snappedTime;

    try {
      const assetData = JSON.parse(e.dataTransfer.getData("application/json"));
      onDropAsset(assetData, trackId, time);
    } catch(err) {
      console.error("Drop failed", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden relative select-none">
      {/* Toolbar */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4 justify-between shrink-0 z-20">
         <div className="flex items-center gap-4">
           {/* Editing Tools */}
           <button 
             onClick={onSplitClip}
             className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded" 
             title="Razor / Split (Ctrl+K)"
           >
             <Icons.Scissors size={16}/>
           </button>
           <button 
             onClick={() => selectedClipId && onDeleteClip('auto', selectedClipId)} 
             className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded" 
             title="Delete"
           >
             <Icons.Trash2 size={16}/>
           </button>
           
           <div className="h-4 w-px bg-gray-600 mx-2"></div>
           
           {/* Ripple Toggle */}
           <button 
             onClick={onToggleRipple}
             className={`p-1 rounded flex items-center gap-1 text-xs font-medium transition-colors ${rippleMode ? 'bg-cyan-900/50 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
             title="Ripple Delete"
           >
             <Icons.MoveHorizontal size={16}/>
             {rippleMode ? 'Ripple On' : 'Ripple Off'}
           </button>

           <div className="h-4 w-px bg-gray-600 mx-2"></div>
           <span className="text-xs text-gray-500 flex items-center gap-1 font-medium"><Icons.Magnet size={14}/> Snap</span>
         </div>
         
         <div className="flex items-center gap-4">
             {/* Zoom */}
             <div className="flex items-center gap-2">
               <button onClick={() => onZoomChange(pixelsPerSecond * 0.8)} className="text-gray-400 hover:text-white"><Icons.ZoomOut size={14}/></button>
               <div className="w-16 h-1 bg-gray-700 rounded overflow-hidden">
                  <div className="h-full bg-cyan-600" style={{ width: `${Math.min(100, (pixelsPerSecond / 100) * 100)}%` }}></div>
               </div>
               <button onClick={() => onZoomChange(pixelsPerSecond * 1.2)} className="text-gray-400 hover:text-white"><Icons.ZoomIn size={14}/></button>
             </div>
         </div>
      </div>

      {/* Time Header with Canvas */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex flex-shrink-0">
        <div className="w-[200px] flex-shrink-0 border-r border-gray-700 bg-gray-800 z-10 flex items-center px-2">
          <span className="text-[10px] text-gray-500 font-mono">
             {new Date(currentTime * 1000).toISOString().substr(11, 8)}:{(currentTime % 1 * 100).toFixed(0).padStart(2,'0')}
          </span>
        </div>
        <div 
          className="flex-1 relative cursor-pointer overflow-hidden"
          ref={containerRef}
          onClick={handleTimeHeaderClick}
        >
           <canvas ref={rulerCanvasRef} className="absolute top-0 left-0" />
           <div 
            className="absolute top-0 h-full w-px bg-cyan-500 z-20 pointer-events-none"
            style={{ left: currentTime * pixelsPerSecond }}
           >
             <div className="w-3 h-3 -ml-1.5 bg-cyan-500 rotate-45 transform -mt-1.5 shadow-sm"></div>
           </div>
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative" onScroll={(e) => {
         if (containerRef.current) containerRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }}>
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-500 z-30 pointer-events-none ml-[200px] shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          style={{ transform: `translateX(${currentTime * pixelsPerSecond}px)` }}
        />

        <div className="min-w-full" style={{ width: 200 + totalWidth }}>
          {tracks.map(track => (
            <div key={track.id} className="flex h-24 border-b border-gray-800 bg-gray-900/50 group">
              {/* Track Info */}
              <div className="w-[200px] flex-shrink-0 bg-gray-850 border-r border-gray-700 p-2 flex flex-col justify-center sticky left-0 z-10 shadow-lg bg-[#111827]">
                <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                  {track.type === 'video' ? <Icons.Film size={14}/> : <Icons.Music size={14}/>}
                  Track {track.id}
                </span>
                <div className="flex gap-2 mt-2">
                  <button className="p-1 hover:bg-gray-700 rounded text-gray-500"><Icons.Settings size={12}/></button>
                </div>
              </div>

              {/* Track Content */}
              <div 
                className={`flex-1 relative transition-colors ${dragOverTrack === track.id ? 'bg-gray-800/80' : ''}`}
                onDragOver={(e) => handleDragOver(e, track.id)}
                onDragLeave={() => setDragOverTrack(null)}
                onDrop={(e) => handleDrop(e, track.id)}
                onClick={() => onSelectClip(null)}
              >
                {track.clips.map(clip => {
                   const isSelected = selectedClipId === clip.id;
                   return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClip(clip.id);
                      }}
                      className={`absolute top-2 bottom-2 rounded overflow-hidden cursor-pointer hover:brightness-110 border transition-all shadow-md group/clip
                        ${isSelected ? 'border-yellow-400 ring-1 ring-yellow-400/50 z-10' : 'border-cyan-500/50'}
                        ${track.type === 'audio' ? 'bg-emerald-900/60 border-emerald-500/50' : 'bg-cyan-900/60'}
                      `}
                      style={{
                        left: clip.startTime * pixelsPerSecond,
                        width: clip.duration * pixelsPerSecond
                      }}
                      title={clip.name}
                    >
                      <div className="h-full w-full flex items-center justify-between px-2">
                        <span className="text-[10px] text-gray-100 truncate w-3/4 pointer-events-none select-none font-medium drop-shadow-md">{clip.name}</span>
                      </div>
                      {isSelected && (
                        <>
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 cursor-w-resize hover:w-1.5 transition-all"></div>
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-400 cursor-e-resize hover:w-1.5 transition-all"></div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          <div className="p-2 ml-[200px]">
             <button 
               onClick={onAddTrack}
               className="text-xs text-gray-500 hover:text-cyan-400 flex items-center gap-1 border border-dashed border-gray-700 px-4 py-2 rounded w-full justify-center hover:border-cyan-500 transition-colors"
             >
               <Icons.Plus size={14}/> Add New Track
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};