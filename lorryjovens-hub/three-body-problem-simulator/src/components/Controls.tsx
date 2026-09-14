import React from "react";
import { Play, Pause, RotateCcw, Settings2, Box, Sparkles, Camera } from "lucide-react";
import { SystemState } from "../physics/rk4";
import { PRESETS } from "../constants";

interface ControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  dt: number;
  onDtChange: (dt: number) => void;
  stepsPerFrame: number;
  onStepsChange: (steps: number) => void;
  state: SystemState;
  onStateChange: (state: SystemState) => void;
  particleCount: number;
  onParticleCountChange: (count: number) => void;
  particleSize: number;
  onParticleSizeChange: (size: number) => void;
  particleOpacity: number;
  onParticleOpacityChange: (opacity: number) => void;
  trailLength: number;
  onTrailLengthChange: (length: number) => void;
  particleSpeed: number;
  onParticleSpeedChange: (speed: number) => void;
  particleColorMode: "body" | "rainbow" | "velocity" | "life";
  onParticleColorModeChange: (mode: "body" | "rainbow" | "velocity" | "life") => void;
  cameraPitch: number;
  onCameraPitchChange: (pitch: number) => void;
  onResetCamera: () => void;
  cameraMode: "free" | "follow" | "cinematic";
  onCameraModeChange: (mode: "free" | "follow" | "cinematic") => void;
  followTargetId: string | null;
  onFollowTargetChange: (id: string | null) => void;
  shotType: "wide" | "medium" | "close";
  onShotTypeChange: (type: "wide" | "medium" | "close") => void;
  onPresetChange: (presetKey: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  dt,
  onDtChange,
  stepsPerFrame,
  onStepsChange,
  state,
  onStateChange,
  particleCount,
  onParticleCountChange,
  particleSize,
  onParticleSizeChange,
  particleOpacity,
  onParticleOpacityChange,
  trailLength,
  onTrailLengthChange,
  particleSpeed,
  onParticleSpeedChange,
  particleColorMode,
  onParticleColorModeChange,
  cameraPitch,
  onCameraPitchChange,
  onResetCamera,
  cameraMode,
  onCameraModeChange,
  followTargetId,
  onFollowTargetChange,
  shotType,
  onShotTypeChange,
  onPresetChange,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    "simulation" | "bodies" | "particles" | "camera"
  >("simulation");

  const handleBodyChange = (
    id: string,
    field: string,
    value: number,
    index?: number,
  ) => {
    const newState = state.map((body) => {
      if (body.id === id) {
        if (index !== undefined) {
          const newArr = [...(body as any)[field]];
          newArr[index] = value;
          return { ...body, [field]: newArr };
        }
        return { ...body, [field]: value };
      }
      return body;
    });
    onStateChange(newState);
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-white p-4 shadow-2xl flex flex-col gap-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-400">
          <Settings2 className="w-5 h-5" />
          Control Panel
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onTogglePlay}
            className={`p-2 rounded-lg transition-all ${isRunning ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"}`}
            title={isRunning ? "Pause" : "Play"}
          >
            {isRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>
          <button
            onClick={onReset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
        {[
          { id: "simulation", label: "Sim", icon: Settings2 },
          { id: "bodies", label: "Bodies", icon: Box },
          { id: "particles", label: "FX", icon: Sparkles },
          { id: "camera", label: "Cam", icon: Camera },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "simulation" && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              System Presets
            </label>
            <select
              onChange={(e) => onPresetChange(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {Object.entries(PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex justify-between">
              Time Step (dt)
              <span className="text-indigo-400">{dt.toFixed(4)}</span>
            </label>
            <input
              type="range"
              min="0.001"
              max="0.05"
              step="0.001"
              value={dt}
              onChange={(e) => onDtChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex justify-between">
              Sim Speed
              <span className="text-indigo-400">{stepsPerFrame}x</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={stepsPerFrame}
              onChange={(e) => onStepsChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      )}

      {activeTab === "particles" && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Color Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["body", "rainbow", "velocity", "life"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => onParticleColorModeChange(mode as any)}
                  className={`py-1.5 text-[10px] uppercase font-bold rounded border transition-all ${particleColorMode === mode ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex justify-between">
              Count
              <span className="text-indigo-400">{(particleCount / 1000).toFixed(0)}k</span>
            </label>
            <input
              type="range"
              min="10000"
              max="1000000"
              step="10000"
              value={particleCount}
              onChange={(e) => onParticleCountChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex justify-between">
              Size
              <span className="text-indigo-400">{particleSize.toFixed(3)}</span>
            </label>
            <input
              type="range"
              min="0.005"
              max="0.1"
              step="0.005"
              value={particleSize}
              onChange={(e) => onParticleSizeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex justify-between">
              Opacity
              <span className="text-indigo-400">{particleOpacity.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={particleOpacity}
              onChange={(e) => onParticleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex justify-between">
              Decay Rate
              <span className="text-indigo-400">{trailLength.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0.01"
              max="1.0"
              step="0.01"
              value={trailLength}
              onChange={(e) => onTrailLengthChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex justify-between">
              Flow Speed
              <span className="text-indigo-400">{particleSpeed.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={particleSpeed}
              onChange={(e) => onParticleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      )}

      {activeTab === "camera" && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Camera Mode
            </label>
            <div className="grid grid-cols-3 gap-1">
              {["free", "follow", "cinematic"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => onCameraModeChange(mode as any)}
                  className={`py-1.5 text-[9px] uppercase font-bold rounded border transition-all ${cameraMode === mode ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {cameraMode === "follow" && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                Follow Target
              </label>
              <div className="grid grid-cols-3 gap-1">
                {state.map((body, idx) => (
                  <button
                    key={body.id}
                    onClick={() => onFollowTargetChange(body.id)}
                    className={`py-1.5 text-[9px] uppercase font-bold rounded border transition-all ${followTargetId === body.id ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}
                  >
                    Body {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(cameraMode === "follow" || cameraMode === "cinematic") && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                Shot Type
              </label>
              <div className="grid grid-cols-3 gap-1">
                {["wide", "medium", "close"].map((type) => (
                  <button
                    key={type}
                    onClick={() => onShotTypeChange(type as any)}
                    className={`py-1.5 text-[9px] uppercase font-bold rounded border transition-all ${shotType === type ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex justify-between">
              Camera Pitch
              <span className="text-indigo-400">{((cameraPitch * 180) / Math.PI).toFixed(0)}°</span>
            </label>
            <input
              type="range"
              min={0}
              max={Math.PI}
              step={0.01}
              value={cameraPitch}
              onChange={(e) => onCameraPitchChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <p className="text-[10px] text-indigo-300 leading-relaxed">
              {cameraMode === "free" 
                ? "Use mouse/touch for free rotation. This slider specifically controls the vertical angle (pitch)."
                : "Camera is currently automated. Manual rotation is disabled in follow/cinematic modes."}
            </p>
          </div>
          <button
            onClick={onResetCamera}
            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors border border-white/10"
          >
            Reset Camera View
          </button>
        </div>
      )}

      {activeTab === "bodies" && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-200">
          {isRunning && (
            <div className="text-[10px] text-amber-400 bg-amber-400/10 p-2 rounded border border-amber-400/20 uppercase font-bold tracking-wider">
              Pause to edit bodies
            </div>
          )}
          {state.map((body, i) => (
            <div
              key={body.id}
              className="flex flex-col gap-3 p-3 bg-white/5 rounded-lg border border-white/5"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ backgroundColor: body.color }}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Body {i + 1}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] text-white/30 uppercase font-bold">Mass</label>
                  <input
                    type="number"
                    value={body.mass}
                    disabled={isRunning}
                    onChange={(e) => handleBodyChange(body.id, "mass", parseFloat(e.target.value) || 0)}
                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs w-full disabled:opacity-50 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] text-white/30 uppercase font-bold">Radius</label>
                  <input
                    type="number"
                    value={body.radius}
                    disabled={isRunning}
                    onChange={(e) => handleBodyChange(body.id, "radius", parseFloat(e.target.value) || 0)}
                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs w-full disabled:opacity-50 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-white/30 uppercase font-bold">Position</label>
                <div className="grid grid-cols-3 gap-1">
                  {["x", "y", "z"].map((axis, idx) => (
                    <input
                      key={`pos-${axis}`}
                      type="number"
                      value={body.position[idx]}
                      disabled={isRunning}
                      onChange={(e) => handleBodyChange(body.id, "position", parseFloat(e.target.value) || 0, idx)}
                      className="bg-black/50 border border-white/10 rounded px-2 py-1 text-[10px] w-full disabled:opacity-50 focus:border-indigo-500 transition-colors"
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-white/30 uppercase font-bold">Velocity</label>
                <div className="grid grid-cols-3 gap-1">
                  {["x", "y", "z"].map((axis, idx) => (
                    <input
                      key={`vel-${axis}`}
                      type="number"
                      value={body.velocity[idx]}
                      disabled={isRunning}
                      onChange={(e) => handleBodyChange(body.id, "velocity", parseFloat(e.target.value) || 0, idx)}
                      className="bg-black/50 border border-white/10 rounded px-2 py-1 text-[10px] w-full disabled:opacity-50 focus:border-indigo-500 transition-colors"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
