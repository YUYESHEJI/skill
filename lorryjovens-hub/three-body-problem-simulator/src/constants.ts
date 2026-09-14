import { SystemState } from "./physics/rk4";

export const PRESETS: Record<string, { name: string; state: SystemState }> = {
  figure8: {
    name: "Figure-8 (Stable)",
    state: [
      {
        id: "body-1",
        mass: 1,
        position: [0.97000436, -0.24308753, 0],
        velocity: [0.466203685, 0.43236573, 0],
        color: "#ff4e00",
        radius: 0.1,
      },
      {
        id: "body-2",
        mass: 1,
        position: [-0.97000436, 0.24308753, 0],
        velocity: [0.466203685, 0.43236573, 0],
        color: "#00d2ff",
        radius: 0.1,
      },
      {
        id: "body-3",
        mass: 1,
        position: [0, 0, 0],
        velocity: [-2 * 0.466203685, -2 * 0.43236573, 0],
        color: "#00ff66",
        radius: 0.1,
      },
    ],
  },
  binary: {
    name: "Binary System",
    state: [
      {
        id: "sun-1",
        mass: 2,
        position: [-1, 0, 0],
        velocity: [0, 1, 0],
        color: "#facc15",
        radius: 0.15,
      },
      {
        id: "sun-2",
        mass: 2,
        position: [1, 0, 0],
        velocity: [0, -1, 0],
        color: "#f87171",
        radius: 0.15,
      },
    ],
  },
  triple: {
    name: "Triple Star System",
    state: [
      {
        id: "star-1",
        mass: 1.5,
        position: [0, 2, 0],
        velocity: [0.8, 0, 0],
        color: "#60a5fa",
        radius: 0.12,
      },
      {
        id: "star-2",
        mass: 1.5,
        position: [-1.732, -1, 0],
        velocity: [-0.4, -0.692, 0],
        color: "#f472b6",
        radius: 0.12,
      },
      {
        id: "star-3",
        mass: 1.5,
        position: [1.732, -1, 0],
        velocity: [-0.4, 0.692, 0],
        color: "#fbbf24",
        radius: 0.12,
      },
    ],
  },
  solar: {
    name: "Mini Solar System",
    state: [
      {
        id: "sun",
        mass: 10,
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        color: "#fbbf24",
        radius: 0.2,
      },
      {
        id: "planet-1",
        mass: 0.1,
        position: [1.5, 0, 0],
        velocity: [0, 2.5, 0],
        color: "#34d399",
        radius: 0.05,
      },
      {
        id: "planet-2",
        mass: 0.2,
        position: [3, 0, 0],
        velocity: [0, 1.8, 0],
        color: "#60a5fa",
        radius: 0.07,
      },
      {
        id: "planet-3",
        mass: 0.05,
        position: [4.5, 0, 0],
        velocity: [0, 1.5, 0],
        color: "#f87171",
        radius: 0.04,
      },
    ],
  },
  dance: {
    name: "Chaotic Dance",
    state: [
      { id: "a", mass: 1, position: [1, 1, 0], velocity: [0.5, -0.5, 0], color: "#a78bfa", radius: 0.1 },
      { id: "b", mass: 1, position: [-1, -1, 0], velocity: [-0.5, 0.5, 0], color: "#f472b6", radius: 0.1 },
      { id: "c", mass: 1, position: [1, -1, 0], velocity: [-0.5, -0.5, 0], color: "#4ade80", radius: 0.1 },
      { id: "d", mass: 1, position: [-1, 1, 0], velocity: [0.5, 0.5, 0], color: "#fb923c", radius: 0.1 },
    ],
  },
  pyramid: {
    name: "Tetrahedron",
    state: [
      { id: "1", mass: 1, position: [0, 1.633, 0], velocity: [0.5, 0, 0.5], color: "#ef4444", radius: 0.1 },
      { id: "2", mass: 1, position: [-1, 0, -0.577], velocity: [-0.5, 0, 0.5], color: "#3b82f6", radius: 0.1 },
      { id: "3", mass: 1, position: [1, 0, -0.577], velocity: [0, 0, -0.5], color: "#10b981", radius: 0.1 },
      { id: "4", mass: 1, position: [0, 0, 1.154], velocity: [0, 0.5, 0], color: "#f59e0b", radius: 0.1 },
    ],
  },
  ring: {
    name: "Ring of Fire",
    state: Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const r = 4;
      const v = Math.sqrt(5 / r); // roughly
      return {
        id: `ring-${i}`,
        mass: 0.5,
        position: [r * Math.cos(angle), r * Math.sin(angle), 0],
        velocity: [-v * Math.sin(angle), v * Math.cos(angle), 0],
        color: `hsl(${(i / 8) * 360}, 70%, 60%)`,
        radius: 0.08,
      };
    }),
  },
  collision: {
    name: "Galaxy Collision",
    state: [
      // Galaxy 1
      { id: "g1-core", mass: 5, position: [-5, 0, 0], velocity: [0.5, 0, 0], color: "#ffffff", radius: 0.2 },
      { id: "g1-p1", mass: 0.1, position: [-4, 0.5, 0.2], velocity: [0.5, 1, 0.5], color: "#60a5fa", radius: 0.05 },
      { id: "g1-p2", mass: 0.1, position: [-6, -0.5, -0.2], velocity: [0.5, -1, -0.5], color: "#60a5fa", radius: 0.05 },
      // Galaxy 2
      { id: "g2-core", mass: 5, position: [5, 0, 0], velocity: [-0.5, 0, 0], color: "#ffffff", radius: 0.2 },
      { id: "g2-p1", mass: 0.1, position: [4, -0.5, 0.2], velocity: [-0.5, -1, 0.5], color: "#f87171", radius: 0.05 },
      { id: "g2-p2", mass: 0.1, position: [6, 0.5, -0.2], velocity: [-0.5, 1, -0.5], color: "#f87171", radius: 0.05 },
    ],
  },
  butterfly: {
    name: "Butterfly Orbit",
    state: [
      { id: "b1", mass: 1, position: [0.5, 0, 0], velocity: [0, 1, 0.5], color: "#818cf8", radius: 0.1 },
      { id: "b2", mass: 1, position: [-0.5, 0, 0], velocity: [0, -1, 0.5], color: "#f472b6", radius: 0.1 },
      { id: "b3", mass: 1, position: [0, 0, 0.5], velocity: [1, 0, -0.5], color: "#4ade80", radius: 0.1 },
    ],
  },
  clover: {
    name: "Four-Leaf Clover",
    state: [
      { id: "c1", mass: 1, position: [2, 0, 0], velocity: [0, 1, 0], color: "#fbbf24", radius: 0.1 },
      { id: "c2", mass: 1, position: [-2, 0, 0], velocity: [0, -1, 0], color: "#fbbf24", radius: 0.1 },
      { id: "c3", mass: 1, position: [0, 2, 0], velocity: [-1, 0, 0], color: "#34d399", radius: 0.1 },
      { id: "c4", mass: 1, position: [0, -2, 0], velocity: [1, 0, 0], color: "#34d399", radius: 0.1 },
    ],
  },
  vortex: {
    name: "Cosmic Vortex",
    state: Array.from({ length: 12 }).map((_, i) => {
      const r = 1 + i * 0.5;
      const angle = (i / 12) * Math.PI * 8;
      const v = Math.sqrt(10 / r);
      return {
        id: `v-${i}`,
        mass: 0.2,
        position: [r * Math.cos(angle), r * Math.sin(angle), i * 0.2],
        velocity: [-v * Math.sin(angle), v * Math.cos(angle), 0.1],
        color: `hsl(${(i / 12) * 360}, 80%, 50%)`,
        radius: 0.05,
      };
    }),
  },
};
