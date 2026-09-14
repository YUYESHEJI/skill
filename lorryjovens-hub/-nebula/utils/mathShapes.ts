
import * as THREE from 'three';
import { ShapeType } from '../types';

const COUNT = 100000;

export const generateColors = (): Float32Array => {
  const colors = new Float32Array(COUNT * 3);
  const palette = [
    new THREE.Color('#ff00ff'), // Magenta
    new THREE.Color('#00ffff'), // Cyan
    new THREE.Color('#ffff00'), // Yellow
    new THREE.Color('#3bb2f6'), // Blue
    new THREE.Color('#ffffff'), // White
  ];

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const color = palette[Math.floor(Math.random() * palette.length)].clone();
    // Add random jitter to colors
    color.r += (Math.random() - 0.5) * 0.2;
    color.g += (Math.random() - 0.5) * 0.2;
    color.b += (Math.random() - 0.5) * 0.2;
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }
  return colors;
};

export const generatePositions = (type: ShapeType): Float32Array => {
  const positions = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (type) {
      case ShapeType.Galaxy: {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.8) * 10;
        const arms = 3;
        const armOffset = (i % arms) * (Math.PI * 2 / arms);
        const spiral = radius * 0.5;
        const scatter = (Math.random() - 0.5) * (radius * 0.2 + 0.1);
        
        x = radius * Math.cos(angle * 0.1 + spiral + armOffset) + scatter;
        z = radius * Math.sin(angle * 0.1 + spiral + armOffset) + scatter;
        y = (Math.random() - 0.5) * (2.5 / (radius + 0.5));
        break;
      }
      case ShapeType.Nebula: {
        const r = Math.pow(Math.random(), 0.6) * 7;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        // Use fractal-like clusters
        const noise = Math.sin(theta * 4.0) * Math.cos(phi * 2.0) * 1.5;
        const dist = r + noise;
        
        x = dist * Math.sin(phi) * Math.cos(theta);
        y = dist * Math.sin(phi) * Math.sin(theta);
        z = dist * Math.cos(phi);
        
        // Add dust clouds
        if (i % 5 === 0) {
          x += (Math.random() - 0.5) * 3.0;
          y += (Math.random() - 0.5) * 3.0;
          z += (Math.random() - 0.5) * 3.0;
        }
        break;
      }
      case ShapeType.AndromedaGalaxy: {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.8) * 8;
        const arms = 2;
        const armOffset = (i % arms) * (Math.PI * 2 / arms);
        const spiral = dist * 0.7;
        const scatter = (Math.random() - 0.5) * (dist * 0.3 + 0.2);
        x = dist * Math.cos(angle * 0.1 + spiral + armOffset) + scatter;
        z = dist * Math.sin(angle * 0.1 + spiral + armOffset) + scatter;
        y = (Math.random() - 0.5) * (2.0 / (dist + 0.5));
        break;
      }
      case ShapeType.StarryNebula: {
        const r = Math.pow(Math.random(), 0.5) * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const cluster = Math.sin(theta * 2.5) * Math.cos(phi * 3.0) * 2.0;
        const rad = r + cluster;
        x = rad * Math.sin(phi) * Math.cos(theta);
        y = rad * Math.sin(phi) * Math.sin(theta);
        z = rad * Math.cos(phi);
        x += (Math.random() - 0.5) * 1.5;
        y += (Math.random() - 0.5) * 1.5;
        z += (Math.random() - 0.5) * 1.5;
        break;
      }
      case ShapeType.GalacticCore: {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 3) * 5;
        const swirl = 1.0 / (radius + 0.1);
        x = radius * Math.cos(angle + swirl * 5.0);
        z = radius * Math.sin(angle + swirl * 5.0);
        y = (Math.random() - 0.5) * (1.0 / (radius + 0.2)) * 3.0;
        break;
      }
      case ShapeType.EventHorizon: {
        const angle = Math.random() * Math.PI * 2;
        const r = 1.5 + Math.pow(Math.random(), 2.0) * 4.5;
        x = r * Math.cos(angle);
        z = r * Math.sin(angle);
        y = (Math.random() - 0.5) * 0.05;
        break;
      }
      case ShapeType.RiemannSurface: {
        const u = Math.random() * 4 * Math.PI;
        const v = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(u);
        x = r * Math.cos(u / 2) * Math.sin(v);
        y = r * Math.sin(u / 2) * Math.sin(v);
        z = r * Math.cos(v);
        break;
      }
      case ShapeType.HyperKnot: {
        const t = (i / COUNT) * Math.PI * 2;
        const p = 3, q = 8;
        const r = 0.5 * (3 + Math.sin(q * t));
        x = r * Math.cos(p * t);
        y = r * Math.sin(p * t);
        z = r * Math.cos(q * t);
        x += (Math.random() - 0.5) * 0.5;
        y += (Math.random() - 0.5) * 0.5;
        break;
      }
      case ShapeType.LorenzAttractor: {
        let lx = 0.1, ly = 0, lz = 0;
        const dt = 0.008, s = 10, r = 28, b = 8 / 3;
        const iters = 200 + (i % 600);
        for(let j=0; j<iters; j++) {
          lx += s * (ly - lx) * dt;
          ly += (lx * (r - lz) - ly) * dt;
          lz += (lx * ly - b * lz) * dt;
        }
        x = lx * 0.1; y = ly * 0.1; z = (lz - 25) * 0.1;
        break;
      }
      case ShapeType.Mandelbulb: {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = 1.5 + Math.pow(Math.random(), 2.0) * 1.0;
        const power = 8.0;
        x = r * Math.sin(phi * power) * Math.cos(theta * power);
        y = r * Math.sin(phi * power) * Math.sin(theta * power);
        z = r * Math.cos(phi * power);
        break;
      }
      case ShapeType.BioBloom: {
        const t = (i / COUNT) * Math.PI * 2;
        const petals = 6;
        const r = 2.0 + Math.sin(petals * t) * 0.8;
        const phi = Math.random() * Math.PI;
        x = r * Math.cos(t) * Math.sin(phi);
        y = r * Math.sin(t) * Math.sin(phi);
        z = r * Math.cos(phi);
        break;
      }
      case ShapeType.NeuralVine: {
        const t = (i / COUNT) * 12;
        const offset = (i % 10) * (Math.PI * 2 / 10);
        x = Math.sin(t + offset) * (1 + t * 0.3);
        y = t - 6;
        z = Math.cos(t + offset) * (1 + t * 0.3);
        break;
      }
      case ShapeType.NautilusShell: {
        const t = (i / COUNT) * Math.PI * 15;
        const r = 0.15 * Math.exp(0.12 * t);
        const phi = Math.random() * Math.PI * 2;
        const thick = 0.25 * r;
        x = r * Math.cos(t) + Math.cos(phi) * thick;
        y = r * Math.sin(t) + Math.sin(phi) * thick;
        z = t * 0.15;
        break;
      }
      case ShapeType.DNAHelix: {
        const strand = i % 2;
        const t = (i / COUNT) * Math.PI * 12;
        const angle = t + (strand * Math.PI);
        const r = 1.5;
        x = Math.cos(angle) * r;
        z = Math.sin(angle) * r;
        y = t * 1.2 - 8;
        break;
      }
      case ShapeType.HyperCube: {
        const corner = i % 8;
        const corners = [[-1,-1,-1], [1,-1,-1], [-1,1,-1], [1,1,-1], [-1,-1,1], [1,-1,1], [-1,1,1], [1,1,1]];
        const c1 = corners[corner];
        const c2 = corners[(corner + 1) % 8];
        const t = Math.random();
        x = (c1[0] * (1-t) + c2[0] * t) * 2.5;
        y = (c1[1] * (1-t) + c2[1] * t) * 2.5;
        z = (c1[2] * (1-t) + c2[2] * t) * 2.5;
        break;
      }
      case ShapeType.VortexPortal: {
        const t = (i / COUNT);
        const angle = t * Math.PI * 150;
        const radius = Math.pow(t, 0.4) * 4;
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = (1.0 - t) * 10 - 5;
        break;
      }
      case ShapeType.CyberCity: {
        const gridSize = 10;
        const ix = Math.floor(Math.random() * gridSize) - gridSize/2;
        const iz = Math.floor(Math.random() * gridSize) - gridSize/2;
        x = ix * 1.2 + (Math.random() - 0.5) * 0.5;
        z = iz * 1.2 + (Math.random() - 0.5) * 0.5;
        y = Math.pow(Math.random(), 3) * 5;
        break;
      }
      default: {
        const phi = Math.acos(-1 + (2 * i) / COUNT);
        const theta = Math.sqrt(COUNT * Math.PI) * phi;
        x = Math.cos(theta) * Math.sin(phi) * 2.0;
        y = Math.sin(theta) * Math.sin(phi) * 2.0;
        z = Math.cos(phi) * 2.0;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};
