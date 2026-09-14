import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TabOption, Asset, Track, TrackClip, FilterConfig } from './types';
import { Icons } from './components/Icon';
import { AssetLibrary } from './components/AssetLibrary';
import { AIPanel } from './components/AIPanel';
import { Player } from './components/Player';
import { Timeline } from './components/Timeline';
import { analyzeAssetContent } from './services/geminiService';

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_TRACKS: Track[] = [
  { id: '1', type: 'video', clips: [] },
  { id: '2', type: 'audio', clips: [] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.ASSETS);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [projectDuration, setProjectDuration] = useState(60); 
  const [pixelsPerSecond, setPixelsPerSecond] = useState(40);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isProxyMode, setIsProxyMode] = useState(false);
  const [rippleMode, setRippleMode] = useState(false);
  
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const selectedClip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId);

  // --- Helpers ---
  
  const calculateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const createThumbnailAndTags = async (asset: Asset, file: File) => {
     // For Video, extract frame. For Image, use src.
     let base64Image = "";
     let thumbnail = "";

     if (asset.type === 'image') {
       // Convert file to base64 for Gemini
       const reader = new FileReader();
       reader.readAsDataURL(file);
       await new Promise(resolve => reader.onload = resolve);
       base64Image = reader.result as string;
       thumbnail = base64Image;
     } else if (asset.type === 'video') {
       // Create temp video element to capture frame
       const video = document.createElement('video');
       video.src = asset.src;
       video.currentTime = 1; // Capture at 1s
       await new Promise(resolve => video.onloadeddata = resolve);
       
       const canvas = document.createElement('canvas');
       canvas.width = 320;
       canvas.height = 180;
       canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
       thumbnail = canvas.toDataURL('image/jpeg', 0.7);
       base64Image = thumbnail;
     }

     if (base64Image) {
        // Update asset with processing status
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, thumbnail, uploadStatus: 'processing' } : a));
        
        // Call Gemini
        const tags = await analyzeAssetContent(base64Image, asset.type === 'video' ? 'image/jpeg' : file.type);
        
        // Update asset with tags
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, tags, uploadStatus: 'done' } : a));
     }
  };

  // --- Handlers ---

  const handleAddAsset = async (file: File) => {
    // 1. Check Duplicate via Hash
    const hash = await calculateHash(file);
    const exists = assets.find(a => a.fileHash === hash);
    if (exists) {
      alert(`Duplicate file detected: ${exists.name}`);
      return;
    }

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('audio') ? 'audio' : 'video';
    
    const newAsset: Asset = {
      id: generateId(),
      type,
      src: url,
      name: file.name,
      duration: 10,
      fileHash: hash,
      uploadStatus: 'uploading'
    };
    
    if (type === 'video' || type === 'audio') {
      const el = document.createElement(type === 'video' ? 'video' : 'audio');
      el.src = url;
      el.onloadedmetadata = () => {
        newAsset.duration = el.duration;
        setAssets(prev => prev.map(a => a.id === newAsset.id ? { ...a, duration: el.duration } : a));
      };
    }

    setAssets(prev => [...prev, newAsset]);
    
    // 2. Trigger AI Analysis
    createThumbnailAndTags(newAsset, file);
  };

  const handleAddGeneratedVideo = (blobUrl: string) => {
    const newAsset: Asset = {
      id: generateId(),
      type: 'video',
      src: blobUrl,
      name: `AI_Gen_${new Date().toLocaleTimeString()}.mp4`,
      duration: 4,
      uploadStatus: 'done',
      tags: ['AI Generated', 'Veo']
    };
    const el = document.createElement('video');
    el.src = blobUrl;
    el.onloadedmetadata = () => {
        setAssets(prev => prev.map(a => a.id === newAsset.id ? { ...a, duration: el.duration } : a));
    };
    setAssets(prev => [newAsset, ...prev]);
    setActiveTab(TabOption.ASSETS);
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData("application/json", JSON.stringify(asset));
    e.dataTransfer.setData("assetId", asset.id);
  };

  const handleDropAssetToTimeline = (asset: Asset, trackId: string, startTime: number) => {
    const newClip: TrackClip = {
      id: generateId(),
      assetId: asset.id,
      startTime: startTime,
      duration: asset.duration || 5, 
      offset: 0,
      name: asset.name,
      type: asset.type,
      src: asset.src,
      filters: []
    };

    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return { ...track, clips: [...track.clips, newClip] };
      }
      return track;
    }));

    if (startTime + newClip.duration > projectDuration) {
      setProjectDuration(startTime + newClip.duration + 30);
    }
  };

  const handleDeleteClip = (trackIdInput: string, clipId: string) => {
    let targetTrackId = trackIdInput;
    
    // If we call with 'auto', find the track
    if (trackIdInput === 'auto') {
       const track = tracks.find(t => t.clips.some(c => c.id === clipId));
       if (track) targetTrackId = track.id;
       else return; 
    }

    if (selectedClipId === clipId) setSelectedClipId(null);
    
    setTracks(prev => prev.map(t => {
      if (t.id === targetTrackId) {
        const clipToDelete = t.clips.find(c => c.id === clipId);
        if (!clipToDelete) return t;

        let newClips = t.clips.filter(c => c.id !== clipId);

        // Ripple Logic: Shift all subsequent clips left
        if (rippleMode) {
           newClips = newClips.map(c => {
             if (c.startTime > clipToDelete.startTime) {
               return { ...c, startTime: c.startTime - clipToDelete.duration };
             }
             return c;
           });
        }
        return { ...t, clips: newClips };
      }
      return t;
    }));
  };

  const handleSplitClip = () => {
    // Find clip under playhead (prioritize selected, then top track)
    let clipToSplit: TrackClip | undefined;
    let trackId: string | undefined;

    // Try selected first
    if (selectedClipId) {
      const t = tracks.find(t => t.clips.some(c => c.id === selectedClipId));
      const c = t?.clips.find(c => c.id === selectedClipId);
      if (c && currentTime > c.startTime && currentTime < c.startTime + c.duration) {
        clipToSplit = c;
        trackId = t?.id;
      }
    }

    // If no valid selected clip under playhead, find top-most visual clip
    if (!clipToSplit) {
      for (const t of tracks) {
        const c = t.clips.find(c => currentTime > c.startTime && currentTime < c.startTime + c.duration);
        if (c) {
          clipToSplit = c;
          trackId = t.id;
          break; // Stop at first found (top visual)
        }
      }
    }

    if (!clipToSplit || !trackId) return;

    // Logic to split
    const splitPoint = currentTime - clipToSplit.startTime;
    const firstDuration = splitPoint;
    const secondDuration = clipToSplit.duration - splitPoint;

    if (firstDuration < 0.1 || secondDuration < 0.1) return; // Too short

    const leftClip: TrackClip = {
      ...clipToSplit,
      id: generateId(),
      duration: firstDuration
    };

    const rightClip: TrackClip = {
      ...clipToSplit,
      id: generateId(),
      startTime: currentTime,
      duration: secondDuration,
      offset: clipToSplit.offset + splitPoint
    };

    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          clips: t.clips.filter(c => c.id !== clipToSplit!.id).concat([leftClip, rightClip])
        };
      }
      return t;
    }));
    
    // Select the second part
    setSelectedClipId(rightClip.id);
  };

  const handleAddTrack = () => {
    const newId = (tracks.length + 1).toString();
    const newTrack: Track = {
      id: newId,
      type: 'video', // Default to video
      clips: []
    };
    setTracks(prev => [...prev, newTrack]);
  };

  const updateSelectedClipFilter = (type: FilterConfig['type'], value: number) => {
    if (!selectedClipId) return;
    setTracks(prev => prev.map(track => ({
      ...track,
      clips: track.clips.map(clip => {
        if (clip.id === selectedClipId) {
          const filters = clip.filters || [];
          const existingIndex = filters.findIndex(f => f.type === type);
          let newFilters = [...filters];
          if (existingIndex >= 0) {
            newFilters[existingIndex] = { type, value };
          } else {
            newFilters.push({ type, value });
          }
          return { ...clip, filters: newFilters };
        }
        return clip;
      })
    })));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Playback Loop
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const delta = (time - lastTimeRef.current) / 1000;
      setCurrentTime(prev => {
        const next = prev + delta;
        if (next >= projectDuration) {
          setIsPlaying(false);
          return projectDuration;
        }
        return next;
      });
    }
    lastTimeRef.current = time;
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, projectDuration]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, animate]);


  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="h-12 border-b border-gray-800 flex items-center px-4 justify-between bg-gray-900 shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-600 p-1.5 rounded">
             <Icons.Scissors size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">OmniCut <span className="text-cyan-400 text-xs font-normal border border-cyan-500/30 px-1 rounded ml-1">AI STUDIO</span></h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsProxyMode(!isProxyMode)}
            className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors ${isProxyMode ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            title="Simulate low-res proxy workflow for performance"
          >
            {isProxyMode ? 'PROXY: ON' : 'PROXY: OFF'}
          </button>
          <button className="px-4 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-xs font-medium border border-gray-700 transition-colors">
            Export Project
          </button>
          <button className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/20 transition-all">
            Export Video
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Assets & AI) */}
        <div className="w-80 flex flex-col border-r border-gray-800 bg-gray-900 shrink-0">
          <div className="flex border-b border-gray-800">
            <button 
              onClick={() => setActiveTab(TabOption.ASSETS)}
              className={`flex-1 py-3 flex justify-center ${activeTab === TabOption.ASSETS ? 'border-b-2 border-cyan-500 text-cyan-500' : 'text-gray-500 hover:text-gray-300'}`}
              title="Media"
            >
              <Icons.Film size={20} />
            </button>
            <button 
              onClick={() => setActiveTab(TabOption.AI_SCRIPT)}
              className={`flex-1 py-3 flex justify-center ${activeTab === TabOption.AI_SCRIPT ? 'border-b-2 border-purple-500 text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
              title="AI Tools"
            >
              <Icons.Sparkles size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {activeTab === TabOption.ASSETS && (
              <AssetLibrary 
                assets={assets} 
                onAddAsset={handleAddAsset} 
                onDragStart={handleDragStart} 
              />
            )}
            {activeTab === TabOption.AI_SCRIPT && (
              <AIPanel onAddGeneratedVideo={handleAddGeneratedVideo} />
            )}
          </div>
        </div>

        {/* Center/Right Split: Player & Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Half: Player & Properties */}
          <div className="h-[55%] flex bg-black border-b border-gray-800">
            <div className="flex-1 p-4 flex items-center justify-center bg-gray-950 relative">
              <div className="aspect-video h-full bg-black shadow-2xl rounded-sm overflow-hidden border border-gray-800 relative ring-1 ring-white/5">
                 <Player 
                   currentTime={currentTime}
                   duration={projectDuration}
                   isPlaying={isPlaying}
                   clips={tracks.flatMap(t => t.clips)}
                   onTogglePlay={togglePlay}
                   onSeek={(t) => setCurrentTime(t)}
                   isProxyMode={isProxyMode}
                 />
              </div>
            </div>
            
            {/* Inspector / Properties Panel */}
            <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0">
              <div className="h-10 border-b border-gray-800 flex items-center px-4 bg-gray-850">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                   <Icons.Sliders size={14}/> Inspector
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {selectedClip ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-200 mb-1 truncate">{selectedClip.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">{selectedClip.id}</p>
                    </div>

                    <div className="space-y-4">
                       <h5 className="text-xs font-bold text-cyan-500 uppercase">Video Effects</h5>
                       
                       {/* Brightness Control */}
                       <div>
                         <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>Brightness</span>
                           <span>{selectedClip.filters?.find(f => f.type === 'brightness')?.value || 100}%</span>
                         </div>
                         <input 
                           type="range" min="0" max="200" step="5"
                           value={selectedClip.filters?.find(f => f.type === 'brightness')?.value || 100}
                           onChange={(e) => updateSelectedClipFilter('brightness', parseInt(e.target.value))}
                           className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                         />
                       </div>

                       {/* Contrast Control */}
                       <div>
                         <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>Contrast</span>
                           <span>{selectedClip.filters?.find(f => f.type === 'contrast')?.value || 100}%</span>
                         </div>
                         <input 
                           type="range" min="0" max="200" step="5"
                           value={selectedClip.filters?.find(f => f.type === 'contrast')?.value || 100}
                           onChange={(e) => updateSelectedClipFilter('contrast', parseInt(e.target.value))}
                           className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                         />
                       </div>
                       
                       {/* Blur Control */}
                       <div>
                         <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>Blur</span>
                           <span>{selectedClip.filters?.find(f => f.type === 'blur')?.value || 0}px</span>
                         </div>
                         <input 
                           type="range" min="0" max="20" step="0.5"
                           value={selectedClip.filters?.find(f => f.type === 'blur')?.value || 0}
                           onChange={(e) => updateSelectedClipFilter('blur', parseFloat(e.target.value))}
                           className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                         />
                       </div>

                       {/* Grayscale Control */}
                       <div>
                         <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>Grayscale</span>
                           <span>{selectedClip.filters?.find(f => f.type === 'grayscale')?.value || 0}%</span>
                         </div>
                         <input 
                           type="range" min="0" max="100" step="5"
                           value={selectedClip.filters?.find(f => f.type === 'grayscale')?.value || 0}
                           onChange={(e) => updateSelectedClipFilter('grayscale', parseInt(e.target.value))}
                           className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                         />
                       </div>

                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-3">
                    <Icons.Monitor size={32} className="opacity-20" />
                    <p className="text-xs text-center px-4">Select a clip in the timeline to edit properties and add effects.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Half: Timeline */}
          <div className="flex-1 flex flex-col min-h-0 relative">
             <Timeline 
               tracks={tracks}
               duration={projectDuration}
               currentTime={currentTime}
               pixelsPerSecond={pixelsPerSecond}
               selectedClipId={selectedClipId}
               rippleMode={rippleMode}
               onSeek={(t) => setCurrentTime(t)}
               onDropAsset={handleDropAssetToTimeline}
               onDeleteClip={handleDeleteClip}
               onSelectClip={setSelectedClipId}
               onZoomChange={(z) => setPixelsPerSecond(Math.max(2, Math.min(200, z)))}
               onSplitClip={handleSplitClip}
               onToggleRipple={() => setRippleMode(!rippleMode)}
               onAddTrack={handleAddTrack}
             />
          </div>

        </div>
      </div>
    </div>
  );
}