import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Trail } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { SystemState } from "../physics/rk4";

interface SimulationProps {
  state: SystemState;
  isRunning: boolean;
  dt: number;
  stepsPerFrame: number;
  onStateUpdate: (newState: SystemState) => void;
  resetTrigger: number;
  particleCount: number;
  particleSize: number;
  particleOpacity: number;
  trailLength: number;
  particleSpeed: number;
  particleColorMode: "body" | "rainbow" | "velocity" | "life";
  cameraPitch: number;
  cameraMode: "free" | "follow" | "cinematic";
  followTargetId: string | null;
  shotType: "wide" | "medium" | "close";
  cameraResetTrigger: number;
}

const Body = ({
  id,
  stateRef,
  initialColor,
  initialRadius,
  initialMass,
}: {
  id: string;
  stateRef: React.MutableRefObject<SystemState>;
  initialColor: string;
  initialRadius: number;
  initialMass: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const bodyState = stateRef.current.find((b) => b.id === id);
    if (bodyState && groupRef.current) {
      groupRef.current.position.set(
        bodyState.position[0],
        bodyState.position[1],
        bodyState.position[2],
      );
    }
  });

  return (
    <group ref={groupRef}>
      <Trail
        width={0.5}
        length={50}
        color={new THREE.Color(initialColor)}
        attenuation={(t) => t * t}
      >
        <mesh>
          <sphereGeometry args={[initialRadius, 32, 32]} />
          <meshStandardMaterial
            color={initialColor}
            emissive={initialColor}
            emissiveIntensity={2}
          />
        </mesh>
      </Trail>
      <pointLight
        color={initialColor}
        intensity={initialMass * 2}
        distance={50}
      />
    </group>
  );
};

const Particles = ({
  particlesRef,
  particleCount,
  particleSize,
  particleOpacity,
}: {
  particlesRef: React.RefObject<THREE.Points | null>;
  particleCount: number;
  particleSize: number;
  particleOpacity: number;
}) => {
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    if (geometryRef.current) {
      const positions = new Float32Array(particleCount * 3);
      geometryRef.current.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
    }
  }, [particleCount]);

  return (
    <points ref={particlesRef}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        size={particleSize}
        vertexColors
        transparent
        opacity={particleOpacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export const Simulation: React.FC<SimulationProps> = ({
  state,
  isRunning,
  dt,
  stepsPerFrame,
  onStateUpdate,
  resetTrigger,
  particleCount,
  particleSize,
  particleOpacity,
  trailLength,
  particleSpeed,
  particleColorMode,
  cameraPitch,
  cameraMode,
  followTargetId,
  shotType,
  cameraResetTrigger,
}) => {
  const workerRef = useRef<Worker | null>(null);
  const stateRef = useRef<SystemState>(state);
  const isRunningRef = useRef(isRunning);
  const particlesRef = useRef<THREE.Points>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const lastUpdateRef = useRef(0);
  const isWorkerReadyRef = useRef(true);
  const controlsRef = useRef<any>(null);

  const getShotDistance = (type: "wide" | "medium" | "close") => {
    switch (type) {
      case "wide":
        return 15;
      case "medium":
        return 8;
      case "close":
        return 3;
      default:
        return 8;
    }
  };

  useEffect(() => {
    if (controlsRef.current && cameraMode === "free") {
      controlsRef.current.setPolarAngle(cameraPitch);
    }
  }, [cameraPitch, cameraMode]);

  useEffect(() => {
    if (controlsRef.current && cameraResetTrigger > 0) {
      controlsRef.current.reset();
      // Reset camera position to default
      const defaultPos = new THREE.Vector3(0, 5, 10);
      controlsRef.current.object.position.copy(defaultPos);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [cameraResetTrigger]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../physics/worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (e) => {
      if (e.data.type === "INIT_ACK") {
        if (particlesRef.current && particlesRef.current.geometry) {
          particlesRef.current.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(e.data.payload.particlePos, 3),
          );
          particlesRef.current.geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(e.data.payload.particleColor, 3),
          );
        }
      } else if (e.data.type === "UPDATE") {
        const { state: newState, particlePos, particleColor } = e.data.payload;
        stateRef.current = newState;
        isWorkerReadyRef.current = true;

        if (particlesRef.current && particlesRef.current.geometry) {
          const posAttr = particlesRef.current.geometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;
          if (posAttr && posAttr.array.length === particlePos.length) {
            posAttr.array.set(particlePos);
            posAttr.needsUpdate = true;
          } else {
            particlesRef.current.geometry.setAttribute(
              "position",
              new THREE.BufferAttribute(particlePos, 3),
            );
          }
          const colAttr = particlesRef.current.geometry.getAttribute(
            "color",
          ) as THREE.BufferAttribute;
          if (colAttr && colAttr.array.length === particleColor.length) {
            colAttr.array.set(particleColor);
            colAttr.needsUpdate = true;
          } else {
            particlesRef.current.geometry.setAttribute(
              "color",
              new THREE.BufferAttribute(particleColor, 3),
            );
          }
        }

        // Only update React state occasionally to keep UI somewhat in sync, or when paused
        if (!isRunningRef.current) {
          onStateUpdate(newState);
        } else {
          // Throttle UI updates to ~10fps
          const now = performance.now();
          if (now - lastUpdateRef.current > 100) {
            onStateUpdate(newState);
            lastUpdateRef.current = now;
          }
        }
      }
    };

    workerRef.current.postMessage({
      type: "INIT",
      payload: {
        state,
        dt,
        stepsPerFrame,
        particleCount,
        trailLength,
        particleSpeed,
        particleColorMode,
      },
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "UPDATE_PARAMS",
        payload: {
          dt,
          stepsPerFrame,
          particleCount,
          trailLength,
          particleSpeed,
          particleColorMode,
        },
      });
    }
  }, [
    dt,
    stepsPerFrame,
    particleCount,
    trailLength,
    particleSpeed,
    particleColorMode,
  ]);

  useEffect(() => {
    if (workerRef.current && !isRunning) {
      workerRef.current.postMessage({
        type: "SET_STATE",
        payload: state,
      });
    }
  }, [state, isRunning]);

  useEffect(() => {
    if (workerRef.current && resetTrigger > 0) {
      workerRef.current.postMessage({ type: "RESET_PARTICLES" });
    }
  }, [resetTrigger]);

  const WorkerDriver = () => {
    useFrame((state) => {
      if (
        isRunningRef.current &&
        workerRef.current &&
        isWorkerReadyRef.current
      ) {
        isWorkerReadyRef.current = false;
        workerRef.current.postMessage({ type: "STEP" });
      }

      // Sync camera pitch if it's being controlled by slider
      // Note: OrbitControls will override this if user interacts, but we can force it
      // or just let it be a starting point.
    });
    return null;
  };

  const CameraController = () => {
    useFrame((state) => {
      if (cameraMode === "free") return;

      let targetPos = new THREE.Vector3(0, 0, 0);
      const distance = getShotDistance(shotType);

      if (cameraMode === "follow" && followTargetId) {
        const targetBody = stateRef.current.find((b) => b.id === followTargetId);
        if (targetBody) {
          targetPos.set(
            targetBody.position[0],
            targetBody.position[1],
            targetBody.position[2],
          );
        }
      } else if (cameraMode === "cinematic") {
        // Find center of mass or just average position
        let avgX = 0,
          avgY = 0,
          avgZ = 0;
        stateRef.current.forEach((b) => {
          avgX += b.position[0];
          avgY += b.position[1];
          avgZ += b.position[2];
        });
        targetPos.set(
          avgX / stateRef.current.length,
          avgY / stateRef.current.length,
          avgZ / stateRef.current.length,
        );

        // Slow rotation for cinematic effect
        const time = state.clock.getElapsedTime() * 0.2;
        const orbitRadius = distance * 1.5;
        const camX = targetPos.x + Math.cos(time) * orbitRadius;
        const camZ = targetPos.z + Math.sin(time) * orbitRadius;
        const camY = targetPos.y + Math.sin(time * 0.5) * (orbitRadius * 0.5);

        state.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.05);
      }

      if (cameraMode === "follow") {
        // Position camera relative to target
        const offset = new THREE.Vector3(0, distance * 0.5, distance).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          state.clock.getElapsedTime() * 0.1,
        );
        const desiredCamPos = targetPos.clone().add(offset);
        state.camera.position.lerp(desiredCamPos, 0.05);
      }

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetPos, 0.1);
        controlsRef.current.update();
      }
    });
    return null;
  };

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.1} />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {state.map((body) => (
        <Body
          key={body.id}
          id={body.id}
          stateRef={stateRef}
          initialColor={body.color}
          initialRadius={body.radius}
          initialMass={body.mass}
        />
      ))}

      <Particles
        particlesRef={particlesRef}
        particleCount={particleCount}
        particleSize={particleSize}
        particleOpacity={particleOpacity}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={300}
          intensity={1.5}
        />
      </EffectComposer>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        enabled={cameraMode === "free"}
      />
      <WorkerDriver />
      <CameraController />

      <mesh>
        <boxGeometry args={[40, 40, 40]} />
        <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Corner accents */}
      {[
        [20, 20, 20], [20, 20, -20], [20, -20, 20], [20, -20, -20],
        [-20, 20, 20], [-20, 20, -20], [-20, -20, 20], [-20, -20, -20]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>
      ))}

      <gridHelper
        args={[40, 10, "#4f46e5", "#1e1b4b"]}
        position={[0, -20, 0]}
      />
    </Canvas>
  );
};
