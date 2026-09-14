
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, Square, Music, SkipForward, SkipBack, 
  ChevronRight, ChevronLeft, Mic, Camera, CameraOff, 
  MicOff, RefreshCcw, Repeat, Repeat1, Disc, Pause,
  Layers, Activity, Grid as GridIcon, Maximize, Minimize
} from 'lucide-react';
import Visualizer from './components/Visualizer';
import FileUpload from './components/FileUpload';
import { audioService } from './services/audioService';
import { cameraService } from './services/cameraService';
import { ShapeType, AudioData, AudioInputSource, LoopMode, VisualMode } from './types';

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<AudioData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.RiemannSurface);
  const [visualMode, setVisualMode] = useState<VisualMode>(VisualMode.Particles);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isImmersive, setIsImmersive] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  
  const [audioSource, setAudioSource] = useState<AudioInputSource>('file');
  const [loopMode, setLoopMode] = useState<LoopMode>(LoopMode.List);
  const [cameraActive, setCameraActive] = useState(false);
  const cameraPreviewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseTimerRef = useRef<number | null>(null);

  const shapes = Object.values(ShapeType);

  // 处理沉浸模式下的鼠标移动检测，显示退出按钮
  useEffect(() => {
    const handleMouseMove = () => {
      if (!isImmersive) return;
      setShowExitButton(true);
      if (mouseTimerRef.current) window.clearTimeout(mouseTimerRef.current);
      mouseTimerRef.current = window.setTimeout(() => {
        setShowExitButton(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimerRef.current) window.clearTimeout(mouseTimerRef.current);
    };
  }, [isImmersive]);

  const toggleImmersive = () => {
    if (!isImmersive) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsImmersive(true);
      setIsSidebarOpen(false);
      // 同时通过 CSS 选择器隐藏 dat.GUI
      const gui = document.querySelector('.dg.main') as HTMLElement;
      if (gui) gui.style.display = 'none';
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsImmersive(false);
      setIsSidebarOpen(true);
      const gui = document.querySelector('.dg.main') as HTMLElement;
      if (gui) gui.style.display = 'block';
    }
  };

  // 监听全屏变化（针对 Esc 键退出）
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isImmersive) {
        setIsImmersive(false);
        setIsSidebarOpen(true);
        const gui = document.querySelector('.dg.main') as HTMLElement;
        if (gui) gui.style.display = 'block';
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isImmersive]);

  const handleNewUploads = (newItems: AudioData[]) => {
    setPlaylist(prev => {
      const updated = [...prev, ...newItems];
      if (prev.length === 0) setCurrentIndex(0);
      return updated;
    });
  };

  const nextShape = useCallback(() => {
    setCurrentShape(prev => {
      const idx = shapes.indexOf(prev);
      return shapes[(idx + 1) % shapes.length];
    });
  }, [shapes]);

  const toggleLoopMode = () => {
    setLoopMode(prev => {
      if (prev === LoopMode.List) return LoopMode.Single;
      if (prev === LoopMode.Single) return LoopMode.None;
      return LoopMode.List;
    });
  };

  const playSong = useCallback((index: number, resume: boolean = false) => {
    if (index < 0 || index >= playlist.length) {
      setIsPlaying(false);
      return;
    }
    
    if (audioSource === 'mic') {
      audioService.stop();
      setAudioSource('file');
    }

    if (!resume || currentIndex !== index) {
      setCurrentIndex(index);
      audioService.play(playlist[index].buffer, () => {
        setLoopMode(currentLoop => {
          if (currentLoop === LoopMode.Single) {
            playSong(index);
            return currentLoop;
          } else if (currentLoop === LoopMode.List) {
            playSong((index + 1) % playlist.length);
            return currentLoop;
          } else {
            if (index + 1 < playlist.length) playSong(index + 1);
            else setIsPlaying(false);
            return currentLoop;
          }
        });
      });
    } else {
      audioService.resume();
    }
    setIsPlaying(true);
  }, [playlist, audioSource, currentIndex]);

  const toggleMic = async () => {
    if (audioSource === 'mic' && isPlaying) {
      audioService.stop();
      setIsPlaying(false);
      setAudioSource('file');
    } else {
      await audioService.startMic();
      setAudioSource('mic');
      setIsPlaying(true);
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      cameraService.stop();
      setCameraActive(false);
    } else {
      cameraService.start('user', (type) => {
        if (type === 'point') nextShape();
      });
      setCameraActive(true);
    }
  };

  useEffect(() => {
    if (cameraActive && cameraPreviewRef.current) {
      const video = cameraService.getVideoElement();
      if (video) {
        video.className = "w-full h-full object-cover rounded-xl scale-x-[-1] border border-cyan-500/30";
        cameraPreviewRef.current.innerHTML = '';
        cameraPreviewRef.current.appendChild(video);
        
        const overlay = document.createElement('div');
        overlay.className = "absolute top-0 right-0 w-[40%] h-[40%] border-2 border-cyan-500/50 rounded-bl-3xl bg-cyan-500/10 flex items-center justify-center";
        overlay.innerHTML = '<span class="text-[8px] font-bold text-cyan-400 opacity-50 text-center px-2">WAVE HERE TO MORPH</span>';
        cameraPreviewRef.current.appendChild(overlay);
      }
    }
  }, [cameraActive]);

  const togglePlay = () => {
    if (isPlaying) {
      audioService.pause();
      setIsPlaying(false);
    } else if (audioSource === 'mic') {
      toggleMic();
    } else if (currentIndex !== -1) {
      playSong(currentIndex, true);
    } else if (playlist.length > 0) {
      playSong(0);
    }
  };

  return (
    <div ref={containerRef} className="relative w-screen h-screen bg-black overflow-hidden select-none font-sans antialiased text-white">
      <Visualizer currentShape={currentShape} mode={visualMode} onNextShape={nextShape} />

      {/* 沉浸模式下的快速退出按钮 */}
      {isImmersive && (
        <button 
          onClick={toggleImmersive}
          className={`absolute top-8 right-8 z-50 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 transition-all duration-500 ${showExitButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
        >
          <div className="flex items-center gap-3">
             <Minimize size={20} className="text-cyan-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/80">退出沉浸模式</span>
          </div>
        </button>
      )}

      <div className={`absolute left-0 top-0 h-full bg-black/80 backdrop-blur-3xl transition-all duration-700 border-r border-white/10 z-20 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 flex flex-col h-full">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Disc className={`w-8 h-8 ${isPlaying ? 'animate-[spin_2s_linear_infinite]' : ''} text-cyan-400`} /> NEBULA
            </h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-2">Quantum 3D Engine</p>
          </header>

          <div className="grid grid-cols-2 gap-3 mb-8">
             <button onClick={toggleMic} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${audioSource === 'mic' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'}`}>
               {audioSource === 'mic' ? <Mic className="animate-pulse" /> : <MicOff />}
               <span className="text-[9px] font-black uppercase">Live Mic</span>
             </button>
             <button onClick={toggleCamera} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${cameraActive ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'}`}>
               {cameraActive ? <Camera /> : <CameraOff />}
               <span className="text-[9px] font-black uppercase">Motion</span>
             </button>
          </div>

          {cameraActive && (
            <div className="mb-6 relative group">
              <div ref={cameraPreviewRef} className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative" />
              <p className="text-[8px] text-white/40 mt-2 text-center uppercase tracking-widest font-black">Wave in the cyan box to switch shapes</p>
            </div>
          )}

          <FileUpload onUpload={handleNewUploads} />

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scroll">
            <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-3">Sound Waves</h3>
            {playlist.length === 0 ? (
              <div className="text-center py-10 opacity-10 border border-dashed border-white/20 rounded-2xl">
                <Music className="mx-auto mb-2" />
                <span className="text-[8px] font-black uppercase tracking-widest">Awaiting Audio</span>
              </div>
            ) : (
              playlist.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => playSong(idx)}
                  className={`group w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all ${currentIndex === idx && audioSource === 'file' ? 'bg-cyan-500 text-black font-black shadow-lg translate-x-1' : 'text-white/30 bg-white/5 hover:bg-white/10'}`}
                >
                  <Music size={12} className={currentIndex === idx && isPlaying ? 'animate-bounce' : ''} />
                  <span className="truncate text-[10px] uppercase tracking-tighter flex-1">{item.name}</span>
                </button>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
             <div>
                <span className="text-[9px] text-white/30 uppercase font-black tracking-widest block mb-3">Model Selection</span>
                <select 
                   value={currentShape} 
                   onChange={(e) => setCurrentShape(e.target.value as ShapeType)}
                   className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                   {shapes.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                </select>
             </div>

             <div>
                <span className="text-[9px] text-white/30 uppercase font-black tracking-widest block mb-3">Engine Mode</span>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setVisualMode(VisualMode.Particles)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${visualMode === VisualMode.Particles ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/5 bg-white/5 text-white/20 hover:bg-white/10'}`}>
                    <Layers size={14} />
                    <span className="text-[7px] font-black uppercase">Quantum</span>
                  </button>
                  <button onClick={() => setVisualMode(VisualMode.Waveform3D)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${visualMode === VisualMode.Waveform3D ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/5 bg-white/5 text-white/20 hover:bg-white/10'}`}>
                    <Activity size={14} />
                    <span className="text-[7px] font-black uppercase">Silk</span>
                  </button>
                  <button onClick={() => setVisualMode(VisualMode.SpectrumGrid)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${visualMode === VisualMode.SpectrumGrid ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 bg-white/5 text-white/20 hover:bg-white/10'}`}>
                    <GridIcon size={14} />
                    <span className="text-[7px] font-black uppercase">Grid</span>
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {!isImmersive && (
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 backdrop-blur-xl p-4 rounded-r-3xl border border-white/10 border-l-0 z-30 transition-all group"
        >
          {isSidebarOpen ? <ChevronLeft size={20} className="text-white/40 group-hover:text-white" /> : <ChevronRight size={20} className="text-white/40 group-hover:text-white" />}
        </button>
      )}

      {/* 控制器容器：在沉浸模式下淡出 */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] z-10 shadow-2xl transition-all duration-700 hover:scale-105 group ${isImmersive ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <button onClick={toggleLoopMode} className={`p-4 rounded-2xl transition-all ${loopMode === LoopMode.None ? 'text-white/10' : 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'}`}>
          {loopMode === LoopMode.Single ? <Repeat1 size={22} /> : <Repeat size={22} />}
        </button>
        <button onClick={() => playSong((currentIndex - 1 + playlist.length) % playlist.length)} className="p-4 text-white/20 hover:text-white transition-all active:scale-90">
          <SkipBack size={26} fill="currentColor" />
        </button>
        <button onClick={togglePlay} className="w-20 h-20 flex items-center justify-center rounded-[1.8rem] bg-white text-black shadow-2xl transition-all hover:bg-cyan-400 active:scale-95">
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        <button onClick={() => playSong((currentIndex + 1) % playlist.length)} className="p-4 text-white/20 hover:text-white transition-all active:scale-90">
          <SkipForward size={26} fill="currentColor" />
        </button>
        <div className="h-12 w-px bg-white/10 mx-2" />
        <div className="flex flex-col min-w-[150px] flex-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-cyan-500 mb-1">
            {audioSource === 'mic' ? 'Live Mic Input' : 'Nebula Audio Engine'}
          </span>
          <span className="text-[11px] font-black text-white uppercase truncate w-40 drop-shadow-md">
            {currentIndex !== -1 ? playlist[currentIndex].name : 'System Inactive'}
          </span>
        </div>
        <div className="h-12 w-px bg-white/10 mx-2" />
        <button 
          onClick={toggleImmersive}
          className="p-4 text-white/40 hover:text-cyan-400 transition-all flex flex-col items-center gap-1 group"
        >
          <Maximize size={22} />
          <span className="text-[7px] font-black uppercase">沉浸模式</span>
        </button>
      </div>

      <div className={`fixed bottom-0 left-0 w-full h-[8px] flex items-end gap-[1px] opacity-40 pointer-events-none z-0 transition-opacity duration-700 ${isImmersive ? 'opacity-0' : 'opacity-40'}`}>
         {Array.from({length: 64}).map((_, i) => (
           <div key={i} className="flex-1 bg-gradient-to-t from-cyan-600 to-transparent transition-all duration-75" style={{ height: '0%' }} id={`v-bar-${i}`} />
         ))}
      </div>
    </div>
  );
};

export default App;
