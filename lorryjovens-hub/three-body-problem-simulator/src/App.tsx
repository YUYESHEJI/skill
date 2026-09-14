/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from "react";
import { Simulation } from "./components/Simulation";
import { Controls } from "./components/Controls";
import { Landing } from "./components/Landing";
import { SystemState } from "./physics/rk4";
import { PRESETS } from "./constants";

export default function App() {
  const [showSimulation, setShowSimulation] = useState(false);
  
  const [state, setState] = useState<SystemState>(PRESETS.figure8.state);
  const [isRunning, setIsRunning] = useState(false);
  const [dt, setDt] = useState(0.01);
  const [stepsPerFrame, setStepsPerFrame] = useState(10);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [particleCount, setParticleCount] = useState(1000000);
  const [particleSize, setParticleSize] = useState(0.015);
  const [particleOpacity, setParticleOpacity] = useState(0.8);
  const [trailLength, setTrailLength] = useState(0.1);
  const [particleSpeed, setParticleSpeed] = useState(1.0);
  const [particleColorMode, setParticleColorMode] = useState<"body" | "rainbow" | "velocity" | "life">("body");
  const [cameraPitch, setCameraPitch] = useState(Math.PI / 4);
  const [cameraMode, setCameraMode] = useState<"free" | "follow" | "cinematic">("free");
  const [followTargetId, setFollowTargetId] = useState<string | null>(null);
  const [shotType, setShotType] = useState<"wide" | "medium" | "close">("medium");
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);

  const handleStateUpdate = useCallback((newState: SystemState) => {
    setState(newState);
  }, []);

  const handleReset = useCallback(() => {
    setState(state); // Reset to current state (or maybe initial state of current preset)
    setIsRunning(false);
    setResetTrigger((prev) => prev + 1);
  }, [state]);

  const handlePresetChange = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setState(preset.state);
      setIsRunning(false);
      setResetTrigger((prev) => prev + 1);
      setFollowTargetId(null);
    }
  };

  return (
    <>
      {!showSimulation ? (
        <Landing onStart={() => setShowSimulation(true)} />
      ) : (
        <div className="w-full h-screen bg-black overflow-hidden relative font-sans">
          <Simulation
            state={state}
            isRunning={isRunning}
            dt={dt}
            stepsPerFrame={stepsPerFrame}
            onStateUpdate={handleStateUpdate}
            resetTrigger={resetTrigger}
            particleCount={particleCount}
            particleSize={particleSize}
            particleOpacity={particleOpacity}
            trailLength={trailLength}
            particleSpeed={particleSpeed}
            particleColorMode={particleColorMode}
            cameraPitch={cameraPitch}
            cameraMode={cameraMode}
            followTargetId={followTargetId}
            shotType={shotType}
            cameraResetTrigger={cameraResetTrigger}
          />
          <Controls
            isRunning={isRunning}
            onTogglePlay={() => setIsRunning(!isRunning)}
            onReset={handleReset}
            dt={dt}
            onDtChange={setDt}
            stepsPerFrame={stepsPerFrame}
            onStepsChange={setStepsPerFrame}
            state={state}
            onStateChange={setState}
            particleCount={particleCount}
            onParticleCountChange={setParticleCount}
            particleSize={particleSize}
            onParticleSizeChange={setParticleSize}
            particleOpacity={particleOpacity}
            onParticleOpacityChange={setParticleOpacity}
            trailLength={trailLength}
            onTrailLengthChange={setTrailLength}
            particleSpeed={particleSpeed}
            onParticleSpeedChange={setParticleSpeed}
            particleColorMode={particleColorMode}
            onParticleColorModeChange={setParticleColorMode}
            cameraPitch={cameraPitch}
            onCameraPitchChange={setCameraPitch}
            cameraMode={cameraMode}
            onCameraModeChange={setCameraMode}
            followTargetId={followTargetId}
            onFollowTargetChange={setFollowTargetId}
            shotType={shotType}
            onShotTypeChange={setShotType}
            onResetCamera={() => {
              setCameraMode("free");
              setCameraPitch(Math.PI / 4);
              setCameraResetTrigger((prev) => prev + 1);
            }}
            onPresetChange={handlePresetChange}
          />
          <div className="absolute bottom-4 left-4 text-white/50 text-xs font-mono pointer-events-none">
            Three-Body Problem Simulation • RK4 Integrator • WebGL
          </div>
          
          {/* Back to landing button */}
          <button
            onClick={() => setShowSimulation(false)}
            className="absolute top-4 right-4 z-50 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors duration-200"
          >
            ← 返回介绍
          </button>
        </div>
      )}
    </>
  );
}
