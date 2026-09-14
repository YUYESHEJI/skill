
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { audioService } from '../services/audioService';
import { generatePositions, generateColors } from '../utils/mathShapes';
import { ShapeType, VisualMode } from '../types';

const vertexShader = `
  uniform float uTime;
  uniform float uMorphProgress;
  uniform float uOpeningProgress;
  uniform float uAudioIntensity;
  uniform float uExplosionStrength;
  uniform float uParticleSize;
  uniform float uSpatialScale;
  uniform float uSwirlForce;
  uniform float uDriftAmplitude;
  
  attribute vec3 targetPosition;
  attribute vec3 color;
  
  varying vec3 vColor;
  varying float vDist;

  void main() {
    // 1. 基础形态切换
    vec3 basePos = mix(position, targetPosition, uMorphProgress);
    
    // 2. 开场爆发现象：从中心奇点向外扩散
    // uOpeningProgress: 0.0 -> 1.0
    float spawnScale = mix(0.05, uSpatialScale, uOpeningProgress);
    vec3 scaledPos = basePos * spawnScale;
    
    // 3. 柔和摆动
    float swayTime = uTime * 0.6;
    vec3 sway = vec3(
      sin(swayTime + scaledPos.y * 0.4) * 0.5,
      cos(swayTime * 0.8 + scaledPos.x * 0.4) * 0.3,
      sin(swayTime * 1.1 + scaledPos.z * 0.4) * 0.5
    ) * uDriftAmplitude * uOpeningProgress;
    
    vec3 animatedPos = scaledPos + sway;
    
    // 4. 旋转与旋涡 (开场时旋转速度更快)
    float d = length(animatedPos);
    vDist = d;
    float currentSwirl = mix(uSwirlForce + 2.0, uSwirlForce, uOpeningProgress);
    float swirlAngle = (uTime * (0.15 + (1.0 - uOpeningProgress)) + d * currentSwirl) + (uAudioIntensity * 1.2);
    float s = sin(swirlAngle);
    float c = cos(swirlAngle);
    mat2 rot = mat2(c, -s, s, c);
    animatedPos.xz = rot * animatedPos.xz;
    
    // 5. 音频脉冲
    vec3 dir = normalize(animatedPos + 0.0001);
    float pulse = uAudioIntensity * uExplosionStrength * (1.5 / (d + 1.0));
    animatedPos += dir * pulse;

    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
    
    // 粒子大小：从 0.1 逐渐过渡到目标大小
    float startSize = 0.1;
    float targetSize = uParticleSize * (1.0 + uAudioIntensity * 0.8);
    float currentSize = mix(startSize, targetSize, uOpeningProgress);
    
    gl_PointSize = currentSize * (550.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vDist;
  uniform float uBrightness;
  uniform float uOpeningProgress;
  uniform vec3 uBaseColor;
  uniform float uHueShift;
  uniform float uColorShift;
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseSpeed;

  float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec3 hueShift(vec3 color, float shift) {
      vec3 k = vec3(0.57735, 0.57735, 0.57735);
      float cosAngle = cos(shift);
      return color * cosAngle + cross(k, color) * sin(shift) + k * dot(k, color) * (1.0 - cosAngle);
  }

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    vec2 noiseUV = gl_PointCoord * uNoiseScale + (uTime * uNoiseSpeed);
    float n = noise(noiseUV) * 0.2 + 0.8; 
    
    float glow = pow(1.0 - (r * 2.0), 3.5);
    glow *= n;
    
    vec3 shiftedBase = hueShift(vColor, uHueShift);
    vec3 finalColor = shiftedBase * uBaseColor;
    
    finalColor.r += sin(vDist * 0.4 + uColorShift) * 0.15;
    finalColor.b += cos(vDist * 0.6 - uTime) * 0.15;
    
    // 亮度受开场进度控制 (0 -> 1)
    float brightness = uBrightness * uOpeningProgress;
    gl_FragColor = vec4(finalColor * brightness, glow * 0.9);
  }
`;

interface VisualizerProps {
  currentShape: ShapeType;
  mode: VisualMode;
  onNextShape?: () => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ currentShape, mode, onNextShape }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const targetAttrRef = useRef<THREE.BufferAttribute | null>(null);
  const positionAttrRef = useRef<THREE.BufferAttribute | null>(null);
  const colorAttrRef = useRef<THREE.BufferAttribute | null>(null);
  const morphingRef = useRef<{ active: boolean; progress: number }>({ active: false, progress: 1.0 });
  const openingRef = useRef<{ active: boolean; progress: number }>({ active: true, progress: 0 });
  const pointsRef = useRef<THREE.Points | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const afterimagePassRef = useRef<AfterimagePass | null>(null);

  const waveformBarsRef = useRef<THREE.Mesh[]>([]);
  const gridCubesRef = useRef<THREE.Mesh[]>([]);
  const waveformGroupRef = useRef<THREE.Group | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);

  const smoothedIntensityRef = useRef<number>(0);

  const config = useRef({
    particleSize: 1.6,
    spatialScale: 1.5,
    swirlForce: 0.35,
    driftAmplitude: 0.8,
    morphSpeed: 0.015,
    explosionStrength: 3.0,
    pulseSensitivity: 1.5,
    pulseSmoothing: 0.1,
    brightness: 4.5,
    baseColor: '#3bb2f6',
    trailLength: 0.92,
    enableTrails: true,
    noiseScale: 10.0,
    noiseSpeed: 4.0,
    hueDrift: true,
    randomizeColors: () => {
        if (colorAttrRef.current) {
            colorAttrRef.current.array.set(generateColors());
            colorAttrRef.current.needsUpdate = true;
        }
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 18, 28);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, 
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const afterimagePass = new AfterimagePass(config.current.trailLength);
    composer.addPass(afterimagePass);
    composerRef.current = composer;
    afterimagePassRef.current = afterimagePass;

    const geometry = new THREE.BufferGeometry();
    positionAttrRef.current = new THREE.BufferAttribute(generatePositions(currentShape), 3);
    targetAttrRef.current = new THREE.BufferAttribute(generatePositions(currentShape), 3);
    colorAttrRef.current = new THREE.BufferAttribute(generateColors(), 3);
    
    geometry.setAttribute('position', positionAttrRef.current);
    geometry.setAttribute('targetPosition', targetAttrRef.current);
    geometry.setAttribute('color', colorAttrRef.current);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: 1.0 },
        uOpeningProgress: { value: 0.0 }, // 初始为 0
        uAudioIntensity: { value: 0 },
        uExplosionStrength: { value: config.current.explosionStrength },
        uParticleSize: { value: 0.1 }, // 初始设为 0.1
        uSpatialScale: { value: config.current.spatialScale },
        uSwirlForce: { value: config.current.swirlForce },
        uDriftAmplitude: { value: config.current.driftAmplitude },
        uBrightness: { value: config.current.brightness },
        uBaseColor: { value: new THREE.Color(config.current.baseColor) },
        uHueShift: { value: 0 },
        uColorShift: { value: 0 },
        uNoiseScale: { value: config.current.noiseScale },
        uNoiseSpeed: { value: config.current.noiseSpeed }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    materialRef.current = material;
    
    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    // --- 其他视觉模式 ---
    const waveformGroup = new THREE.Group();
    waveformGroup.visible = false;
    scene.add(waveformGroup);
    waveformGroupRef.current = waveformGroup;
    for (let i = 0; i < 128; i++) {
        const mat = new THREE.MeshPhongMaterial({ color: config.current.baseColor, emissive: config.current.baseColor, emissiveIntensity: 2.0 });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), mat);
        mesh.position.x = (i - 64) * 0.4;
        waveformGroup.add(mesh);
        waveformBarsRef.current.push(mesh);
    }

    const gridGroup = new THREE.Group();
    gridGroup.visible = false;
    scene.add(gridGroup);
    gridGroupRef.current = gridGroup;
    for (let x = 0; x < 12; x++) {
      for (let z = 0; z < 12; z++) {
        const mat = new THREE.MeshPhongMaterial({ color: config.current.baseColor, emissive: config.current.baseColor });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), mat);
        mesh.position.set((x - 6) * 2.2, 0, (z - 6) * 2.2);
        gridGroup.add(mesh);
        gridCubesRef.current.push(mesh);
      }
    }

    scene.add(new THREE.PointLight(0xffffff, 20, 300).translateY(30));
    scene.add(new THREE.AmbientLight(0x777777));

    const gui = new dat.GUI({ autoPlace: false });
    const f1 = gui.addFolder('粒子动态 (Motion)');
    f1.add(config.current, 'particleSize', 0.1, 15).name('粒子大小');
    f1.add(config.current, 'spatialScale', 0.1, 10).name('空间扩散 (Diffusion)');
    f1.add(config.current, 'driftAmplitude', 0, 5.0).name('柔和摆动幅度');
    f1.add(config.current, 'swirlForce', -2.0, 2.0).name('旋转强度');
    f1.add(config.current, 'morphSpeed', 0.001, 0.4).name('变换速度');
    f1.open();

    const fDyn = gui.addFolder('音乐感应 (Audio)');
    fDyn.add(config.current, 'explosionStrength', 0, 60).name('律动跳动强度');
    fDyn.add(config.current, 'pulseSensitivity', 0.1, 10).name('感应灵敏度');
    fDyn.add(config.current, 'pulseSmoothing', 0.01, 0.4).name('响应平滑度');
    fDyn.open();
    
    const f2 = gui.addFolder('视觉风格 (Style)');
    f2.add(config.current, 'brightness', 0.1, 30.0).name('整体亮度');
    f2.addColor(config.current, 'baseColor').name('主题色').onChange(v => {
      const c = new THREE.Color(v);
      material.uniforms.uBaseColor.value.copy(c);
      waveformBarsRef.current.forEach(m => (m.material as THREE.MeshPhongMaterial).color.copy(c));
      gridCubesRef.current.forEach(m => (m.material as THREE.MeshPhongMaterial).color.copy(c));
    });
    f2.add(config.current, 'hueDrift').name('色彩自动演化');
    f2.add(config.current, 'randomizeColors').name('随机粒子色彩');
    f2.open();

    const f3 = gui.addFolder('画面效果 (Post-FX)');
    f3.add(config.current, 'enableTrails').name('拖尾效果').onChange(v => {
      if (afterimagePassRef.current) afterimagePassRef.current.enabled = v;
    });
    f3.add(config.current, 'trailLength', 0, 0.999).name('余晖时长').onChange(v => {
      if (afterimagePassRef.current) afterimagePassRef.current.uniforms['damp'].value = v;
    });

    const guiDom = gui.domElement;
    guiDom.style.position = 'absolute';
    guiDom.style.top = '10px';
    guiDom.style.right = '10px';
    containerRef.current.appendChild(guiDom);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = (time: number) => {
      requestAnimationFrame(animate);
      const analysis = audioService.getAnalysis();
      const rawIntensity = (analysis.bass * 2.8 + analysis.treble * 1.2) * config.current.pulseSensitivity;
      
      smoothedIntensityRef.current = THREE.MathUtils.lerp(
        smoothedIntensityRef.current, 
        rawIntensity, 
        config.current.pulseSmoothing
      );

      controls.update();

      if (pointsRef.current?.visible) {
        // 处理开场动画逻辑
        if (openingRef.current.active) {
            openingRef.current.progress += 0.006; // 约 3-4 秒完成
            if (openingRef.current.progress >= 1.0) {
                openingRef.current.progress = 1.0;
                openingRef.current.active = false;
            }
        }

        material.uniforms.uTime.value = time * 0.001;
        material.uniforms.uOpeningProgress.value = openingRef.current.progress;
        material.uniforms.uAudioIntensity.value = smoothedIntensityRef.current;
        material.uniforms.uExplosionStrength.value = config.current.explosionStrength;
        material.uniforms.uParticleSize.value = config.current.particleSize;
        material.uniforms.uSpatialScale.value = config.current.spatialScale;
        material.uniforms.uSwirlForce.value = config.current.swirlForce;
        material.uniforms.uDriftAmplitude.value = config.current.driftAmplitude;
        material.uniforms.uBrightness.value = config.current.brightness;
        
        material.uniforms.uColorShift.value += 0.04;
        if (config.current.hueDrift) {
           material.uniforms.uHueShift.value += 0.01 + smoothedIntensityRef.current * 0.06;
        }

        if (morphingRef.current.active) {
          morphingRef.current.progress += config.current.morphSpeed;
          if (morphingRef.current.progress >= 1.0) {
            morphingRef.current.progress = 1.0;
            morphingRef.current.active = false;
            if (positionAttrRef.current && targetAttrRef.current) {
              positionAttrRef.current.array.set(targetAttrRef.current.array);
              positionAttrRef.current.needsUpdate = true;
            }
          }
          material.uniforms.uMorphProgress.value = morphingRef.current.progress;
        }
      } else if (waveformGroupRef.current?.visible) {
        waveformBarsRef.current.forEach((mesh, i) => {
           const val = analysis.rawFreq[i % 128] / 255.0;
           mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, val * 18 + 0.1, 0.2);
           mesh.position.y = mesh.scale.y / 2;
           (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 2.5 + val * 10;
        });
      } else if (gridGroupRef.current?.visible) {
        gridCubesRef.current.forEach((mesh, i) => {
           const val = analysis.rawFreq[i % 128] / 255.0;
           mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, val * 25 + 0.1, 0.15);
           mesh.position.y = mesh.scale.y / 2;
           (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = val * 6.0;
        });
      }

      for (let i = 0; i < 64; i++) {
        const bar = document.getElementById(`v-bar-${i}`);
        if (bar) bar.style.height = `${(analysis.rawFreq[i] / 255) * 100}%`;
      }

      composer.render();
    };
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      gui.destroy();
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      composer.dispose();
    };
  }, []);

  useEffect(() => {
    if (pointsRef.current) pointsRef.current.visible = mode === VisualMode.Particles;
    if (waveformGroupRef.current) waveformGroupRef.current.visible = mode === VisualMode.Waveform3D;
    if (gridGroupRef.current) gridGroupRef.current.visible = mode === VisualMode.SpectrumGrid;
  }, [mode]);

  useEffect(() => {
    if (materialRef.current && targetAttrRef.current && positionAttrRef.current) {
      if (morphingRef.current.active) {
          positionAttrRef.current.array.set(targetAttrRef.current.array);
          positionAttrRef.current.needsUpdate = true;
      }
      
      const newTarget = generatePositions(currentShape);
      targetAttrRef.current.array.set(newTarget);
      targetAttrRef.current.needsUpdate = true;
      
      morphingRef.current.progress = 0;
      morphingRef.current.active = true;
      materialRef.current.uniforms.uMorphProgress.value = 0;
      
      config.current.randomizeColors();
    }
  }, [currentShape]);

  return <div ref={containerRef} className="w-full h-full relative" />;
};

export default Visualizer;
