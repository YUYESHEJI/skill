export type Vector3 = [number, number, number];

export interface BodyState {
  id: string;
  mass: number;
  position: Vector3;
  velocity: Vector3;
  color: string;
  radius: number;
}

export type SystemState = BodyState[];

const G = 1; // Gravitational constant (scaled for visualization)

export function computeDerivatives(state: SystemState): { dp: Vector3[], dv: Vector3[] } {
  const n = state.length;
  const dp: Vector3[] = new Array(n);
  const dv: Vector3[] = new Array(n);

  for (let i = 0; i < n; i++) {
    dp[i] = [...state[i].velocity] as Vector3;
    dv[i] = [0, 0, 0];
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = state[j].position[0] - state[i].position[0];
      const dy = state[j].position[1] - state[i].position[1];
      const dz = state[j].position[2] - state[i].position[2];

      const distSq = dx * dx + dy * dy + dz * dz;
      // Add a small softening parameter to avoid singularity
      const dist = Math.sqrt(distSq) + 0.01;
      const distCube = dist * dist * dist;

      const f = G / distCube;
      
      const fx = f * dx;
      const fy = f * dy;
      const fz = f * dz;

      dv[i][0] += fx * state[j].mass;
      dv[i][1] += fy * state[j].mass;
      dv[i][2] += fz * state[j].mass;

      dv[j][0] -= fx * state[i].mass;
      dv[j][1] -= fy * state[i].mass;
      dv[j][2] -= fz * state[i].mass;
    }
  }

  return { dp, dv };
}

function addState(state: SystemState, dp: Vector3[], dv: Vector3[], dt: number): SystemState {
  return state.map((body, i) => ({
    ...body,
    position: [
      body.position[0] + dp[i][0] * dt,
      body.position[1] + dp[i][1] * dt,
      body.position[2] + dp[i][2] * dt,
    ],
    velocity: [
      body.velocity[0] + dv[i][0] * dt,
      body.velocity[1] + dv[i][1] * dt,
      body.velocity[2] + dv[i][2] * dt,
    ]
  }));
}

export function stepRK4(state: SystemState, dt: number): SystemState {
  const k1 = computeDerivatives(state);
  
  const state2 = addState(state, k1.dp, k1.dv, dt / 2);
  const k2 = computeDerivatives(state2);
  
  const state3 = addState(state, k2.dp, k2.dv, dt / 2);
  const k3 = computeDerivatives(state3);
  
  const state4 = addState(state, k3.dp, k3.dv, dt);
  const k4 = computeDerivatives(state4);

  return state.map((body, i) => ({
    ...body,
    position: [
      body.position[0] + (dt / 6) * (k1.dp[i][0] + 2 * k2.dp[i][0] + 2 * k3.dp[i][0] + k4.dp[i][0]),
      body.position[1] + (dt / 6) * (k1.dp[i][1] + 2 * k2.dp[i][1] + 2 * k3.dp[i][1] + k4.dp[i][1]),
      body.position[2] + (dt / 6) * (k1.dp[i][2] + 2 * k2.dp[i][2] + 2 * k3.dp[i][2] + k4.dp[i][2]),
    ],
    velocity: [
      body.velocity[0] + (dt / 6) * (k1.dv[i][0] + 2 * k2.dv[i][0] + 2 * k3.dv[i][0] + k4.dv[i][0]),
      body.velocity[1] + (dt / 6) * (k1.dv[i][1] + 2 * k2.dv[i][1] + 2 * k3.dv[i][1] + k4.dv[i][1]),
      body.velocity[2] + (dt / 6) * (k1.dv[i][2] + 2 * k2.dv[i][2] + 2 * k3.dv[i][2] + k4.dv[i][2]),
    ]
  }));
}
