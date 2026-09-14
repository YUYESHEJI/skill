import { stepRK4, SystemState } from "./rk4";

let state: SystemState = [];
let dt = 0.01;
let stepsPerFrame = 10;

let NUM_PARTICLES = 1000000;
let particlePos = new Float32Array(NUM_PARTICLES * 3);
let particleVel = new Float32Array(NUM_PARTICLES * 3);
let particleColor = new Float32Array(NUM_PARTICLES * 3);
let particleLife = new Float32Array(NUM_PARTICLES); // 0 to 1
let trailLength = 0.1;
let particleSpeed = 1.0;
let particleColorMode: "body" | "rainbow" | "velocity" | "life" = "body";
const CUBE_HALF_SIZE = 20;

function resizeParticles(newCount: number) {
  if (newCount === NUM_PARTICLES) return;
  NUM_PARTICLES = newCount;
  particlePos = new Float32Array(NUM_PARTICLES * 3);
  particleVel = new Float32Array(NUM_PARTICLES * 3);
  particleColor = new Float32Array(NUM_PARTICLES * 3);
  particleLife = new Float32Array(NUM_PARTICLES);
  initParticles();
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [1, 1, 1];
}

function initParticle(i: number, bodyIndex: number) {
  const body = state[bodyIndex];
  if (!body) return;

  // 90% of particles are trail, 10% are orbiting cloud
  const isTrail = Math.random() < 0.9;

  if (isTrail) {
    // Emit from body position with very slight random offset to form a tight stream
    const offset = 0.02;
    particlePos[i * 3] = body.position[0] + (Math.random() - 0.5) * offset;
    particlePos[i * 3 + 1] = body.position[1] + (Math.random() - 0.5) * offset;
    particlePos[i * 3 + 2] = body.position[2] + (Math.random() - 0.5) * offset;

    // Velocity is body velocity + very small random spread
    const spread = 0.05 * particleSpeed;
    particleVel[i * 3] = body.velocity[0] + (Math.random() - 0.5) * spread;
    particleVel[i * 3 + 1] = body.velocity[1] + (Math.random() - 0.5) * spread;
    particleVel[i * 3 + 2] = body.velocity[2] + (Math.random() - 0.5) * spread;

    particleLife[i] = Math.random(); // Random initial life
  } else {
    // Orbiting cloud - tighter to the body
    const r = body.radius + Math.random() * 0.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    particlePos[i * 3] = body.position[0] + x;
    particlePos[i * 3 + 1] = body.position[1] + y;
    particlePos[i * 3 + 2] = body.position[2] + z;

    // Orbital velocity roughly
    const v = Math.sqrt(body.mass / r) * particleSpeed;
    // Cross product of position vector and up vector for circular orbit
    const upX = 0,
      upY = 0,
      upZ = 1;
    let vx = y * upZ - z * upY;
    let vy = z * upX - x * upZ;
    let vz = x * upY - y * upX;

    // Normalize and scale
    const vlen = Math.sqrt(vx * vx + vy * vy + vz * vz) + 0.001;
    particleVel[i * 3] = body.velocity[0] + (vx / vlen) * v;
    particleVel[i * 3 + 1] = body.velocity[1] + (vy / vlen) * v;
    particleVel[i * 3 + 2] = body.velocity[2] + (vz / vlen) * v;

    particleLife[i] = Math.random();
  }

  const [r, g, b] = hexToRgb(body.color);
  // Add some brightness variation
  const brightness = 0.5 + Math.random() * 0.5;
  particleColor[i * 3] = r * brightness;
  particleColor[i * 3 + 1] = g * brightness;
  particleColor[i * 3 + 2] = b * brightness;
}

function initParticles() {
  if (state.length === 0) return;
  const particlesPerBody = Math.floor(NUM_PARTICLES / state.length);

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const bodyIndex = Math.min(
      Math.floor(i / particlesPerBody),
      state.length - 1,
    );
    initParticle(i, bodyIndex);
  }
}

function updateParticles(totalDt: number) {
  if (state.length === 0) return;
  const particlesPerBody = Math.floor(NUM_PARTICLES / state.length);

  for (let i = 0; i < NUM_PARTICLES; i++) {
    // Age particles faster to make the trail shorter and more dynamic
    particleLife[i] -= totalDt * trailLength; // trailLength acts as decay rate

    if (particleLife[i] <= 0) {
      // Respawn
      const bodyIndex = Math.min(
        Math.floor(i / particlesPerBody),
        state.length - 1,
      );
      initParticle(i, bodyIndex);
      particleLife[i] = 1.0;
      continue;
    }

    let ax = 0,
      ay = 0,
      az = 0;
    const px = particlePos[i * 3];
    const py = particlePos[i * 3 + 1];
    const pz = particlePos[i * 3 + 2];

    for (let j = 0; j < state.length; j++) {
      const body = state[j];
      const dx = body.position[0] - px;
      const dy = body.position[1] - py;
      const dz = body.position[2] - pz;
      const distSq = dx * dx + dy * dy + dz * dz;
      const dist = Math.sqrt(distSq) + 0.05; // softening
      const f = body.mass / (dist * dist * dist);
      ax += f * dx;
      ay += f * dy;
      az += f * dz;
    }

    // Add more drag to trails so they follow the path more closely
    const drag = 0.95;
    particleVel[i * 3] = (particleVel[i * 3] + ax * totalDt) * drag;
    particleVel[i * 3 + 1] = (particleVel[i * 3 + 1] + ay * totalDt) * drag;
    particleVel[i * 3 + 2] = (particleVel[i * 3 + 2] + az * totalDt) * drag;

    particlePos[i * 3] += particleVel[i * 3] * totalDt * particleSpeed;
    particlePos[i * 3 + 1] += particleVel[i * 3 + 1] * totalDt * particleSpeed;
    particlePos[i * 3 + 2] += particleVel[i * 3 + 2] * totalDt * particleSpeed;

    // Bounding box for particles
    for (let axis = 0; axis < 3; axis++) {
      const idx = i * 3 + axis;
      if (Math.abs(particlePos[idx]) > CUBE_HALF_SIZE) {
        particlePos[idx] = Math.sign(particlePos[idx]) * CUBE_HALF_SIZE;
        particleVel[idx] *= -0.5; // Stronger dampening for particles
      }
    }

    // Fade out color based on life
    const bodyIndex = Math.min(
      Math.floor(i / particlesPerBody),
      state.length - 1,
    );
    const body = state[bodyIndex];
    if (body) {
      let r = 1,
        g = 1,
        b = 1;

      if (particleColorMode === "body") {
        [r, g, b] = hexToRgb(body.color);
      } else if (particleColorMode === "rainbow") {
        const hue = (i / NUM_PARTICLES) * 360 + particleLife[i] * 100;
        const rgb = hslToRgb(hue / 360, 0.8, 0.6);
        [r, g, b] = rgb;
      } else if (particleColorMode === "velocity") {
        const vx = particleVel[i * 3];
        const vy = particleVel[i * 3 + 1];
        const vz = particleVel[i * 3 + 2];
        const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
        r = Math.min(speed * 0.5, 1);
        g = Math.min(speed * 0.2, 1);
        b = 1.0 - Math.min(speed * 0.5, 1);
      } else if (particleColorMode === "life") {
        r = particleLife[i];
        g = 1.0 - particleLife[i];
        b = 0.5;
      }

      const lifeSq = particleLife[i] * particleLife[i];
      particleColor[i * 3] = r * lifeSq;
      particleColor[i * 3 + 1] = g * lifeSq;
      particleColor[i * 3 + 2] = b * lifeSq;
    }
  }
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r, g, b];
}

function hue2rgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case "INIT":
      state = payload.state;
      dt = payload.dt || 0.01;
      stepsPerFrame = payload.stepsPerFrame || 10;
      if (payload.particleCount) resizeParticles(payload.particleCount);
      if (payload.trailLength) trailLength = payload.trailLength;
      if (payload.particleSpeed) particleSpeed = payload.particleSpeed;
      if (payload.particleColorMode) particleColorMode = payload.particleColorMode;
      initParticles();
      self.postMessage({
        type: "INIT_ACK",
        payload: { particleColor, particlePos },
      });
      self.postMessage({
        type: "UPDATE",
        payload: { state, particlePos, particleColor },
      });
      break;
    case "STEP":
      for (let i = 0; i < stepsPerFrame; i++) {
        state = stepRK4(state, dt);
        // Bounding box for bodies
        state = state.map(body => {
          const newPos = [...body.position] as [number, number, number];
          const newVel = [...body.velocity] as [number, number, number];
          for (let i = 0; i < 3; i++) {
            if (Math.abs(newPos[i]) > CUBE_HALF_SIZE) {
              newPos[i] = Math.sign(newPos[i]) * CUBE_HALF_SIZE;
              newVel[i] *= -0.8; // Bounce with some energy loss
            }
          }
          return { ...body, position: newPos, velocity: newVel };
        });
      }
      updateParticles(dt * stepsPerFrame);
      self.postMessage({
        type: "UPDATE",
        payload: { state, particlePos, particleColor },
      });
      break;
    case "UPDATE_PARAMS":
      if (payload.dt !== undefined) dt = payload.dt;
      if (payload.stepsPerFrame !== undefined)
        stepsPerFrame = payload.stepsPerFrame;
      if (payload.trailLength !== undefined) trailLength = payload.trailLength;
      if (payload.particleSpeed !== undefined)
        particleSpeed = payload.particleSpeed;
      if (payload.particleColorMode !== undefined)
        particleColorMode = payload.particleColorMode;
      if (
        payload.particleCount !== undefined &&
        payload.particleCount !== NUM_PARTICLES
      ) {
        resizeParticles(payload.particleCount);
        self.postMessage({
          type: "INIT_ACK",
          payload: { particleColor, particlePos },
        });
      }
      break;
    case "SET_STATE":
      state = payload;
      self.postMessage({
        type: "UPDATE",
        payload: { state, particlePos, particleColor },
      });
      break;
    case "RESET_PARTICLES":
      initParticles();
      self.postMessage({
        type: "INIT_ACK",
        payload: { particleColor, particlePos },
      });
      self.postMessage({
        type: "UPDATE",
        payload: { state, particlePos, particleColor },
      });
      break;
  }
};
