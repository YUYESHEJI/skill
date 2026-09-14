
export interface AudioData {
  buffer: AudioBuffer;
  name: string;
}

export enum LoopMode {
  List = 'List Loop',
  Single = 'Single Loop',
  None = 'No Loop'
}

export enum VisualMode {
  Particles = 'Morphing Particles',
  Waveform3D = '3D Silk Waveform',
  SpectrumGrid = 'Spectral Grid'
}

export enum ShapeType {
  // Cosmic Entities
  Galaxy = 'Celestial Galaxy',
  Nebula = 'Gaseous Nebula',
  AndromedaGalaxy = 'Andromeda Spiral',
  StarryNebula = 'Starry Cloud',
  GalacticCore = 'Supermassive Core',
  EventHorizon = 'Event Horizon',
  
  // Complex Mathematical Models
  RiemannSurface = 'Riemannian Manifold',
  HyperKnot = 'Golden Hyper-Knot',
  LorenzAttractor = 'Lorenz Chaos Ribbon',
  Mandelbulb = 'Mandelbulb Fractal',
  
  // Organic & Biological
  BioBloom = 'Bioluminescent Bloom',
  NeuralVine = 'Neural Network Vine',
  NautilusShell = 'Fibonacci Nautilus',
  DNAHelix = 'Triple Helix DNA',
  
  // Abstract & Tech
  CyberCity = 'Cyber-Grid City',
  HyperCube = 'Tesseract Fold',
  VortexPortal = 'Vortex Singularity'
}

export type AudioInputSource = 'file' | 'mic';
