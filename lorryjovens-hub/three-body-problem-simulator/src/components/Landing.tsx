import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "motion/react";
import { Play, Sparkles, Zap, Eye, Cpu, Grid3x3, ChevronDown, ArrowRight } from "lucide-react";

/**
 * Animated particle background for cosmic effects
 */
const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Create particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
      size: number;
      twinkle: number;
    }
    
    const particles: Particle[] = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.7,
        size: Math.random() * 1.5,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
    
    let animationId: number;
    const animate = () => {
      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0a0e27");
      gradient.addColorStop(0.5, "#1a1a3e");
      gradient.addColorStop(1, "#0a0e27");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.twinkle += 0.04;
        
        // Wrap around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle with twinkle
        const alpha = particle.opacity * (0.5 + 0.5 * Math.sin(particle.twinkle));
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

/**
 * Feature card with icon and description
 */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}> = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gradient-to-br from-slate-900/40 to-slate-800/20 p-6 backdrop-blur-sm hover:border-cyan-500/60 transition-all duration-300"
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="mb-4 inline-block text-cyan-400 group-hover:text-cyan-300 transition-colors">
        {icon}
      </div>
      
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
    </motion.div>
  );
};

/**
 * Preset scene showcase card
 */
const PresetCard: React.FC<{
  name: string;
  description: string;
  colors: string[];
  index: number;
}> = ({ name, description, colors, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative rounded-xl overflow-hidden"
    >
      {/* Animated background with rotating gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      
      {/* Colored circles representing bodies */}
      <div className="relative h-40 flex items-center justify-center gap-3 overflow-hidden">
        {colors.map((color, i) => (
          <motion.div
            key={i}
            animate={{
              y: Math.sin((Date.now() + i * 100) / 500) * 10,
            }}
            className="rounded-full border-2 border-white/30"
            style={{
              width: `${30 + i * 10}px`,
              height: `${30 + i * 10}px`,
              background: color,
              filter: `drop-shadow(0 0 15px ${color})`,
            }}
          />
        ))}
      </div>
      
      {/* Text overlay */}
      <div className="relative border-t border-cyan-500/20 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-4">
        <h4 className="font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">{name}</h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
};

/**
 * Main landing page component
 */
export const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const presets = useMemo(
    () => [
      {
        name: "Figure-8 轨道",
        description: "经典的稳定八字形轨道配置",
        colors: ["#ff4e00", "#00d2ff", "#00ff66"],
      },
      {
        name: "双星系统",
        description: "两颗质量巨大的恒星围绕第三体运行",
        colors: ["#facc15", "#f87171", "#c084fc"],
      },
      {
        name: "自定义配置",
        description: "创建并模拟你自己的天体系统",
        colors: ["#06b6d4", "#a78bfa", "#ec4899"],
      },
    ],
    []
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <CosmicBackground />

      {/* Navigation */}
      <nav className="relative z-40 border-b border-cyan-500/10 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">3-Body</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            开始探索
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Glow effect */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 z-0 blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            {/* Subtitle badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-300 font-medium">交互式 3D 物理模拟</span>
            </motion.div>

            {/* Main title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300">
                三体问题
              </span>
              <br />
              <span className="text-white">可视化模拟器</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              使用尖端的物理引擎和 WebGL 3D 渲染技术，实时模拟三个天体在万有引力作用下的复杂运动。
              体验混沌理论的魅力，探索宇宙的深奥奥秘。
            </p>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 mb-12"
            >
              <Play className="w-5 h-5" />
              立即开始模拟
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-cyan-400/50" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                核心特性
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              结合高性能计算和前沿网络技术，带来沉浸式的科学体验
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              index={0}
              icon={<Zap className="w-6 h-6" />}
              title="RK4 精确引擎"
              description="采用四阶龙格-库塔法精确积分，确保物理模拟的高保真度和数值稳定性"
            />
            <FeatureCard
              index={1}
              icon={<Eye className="w-6 h-6" />}
              title="沉浸式 3D 可视化"
              description="基于 Three.js 的实时高保真 3D 渲染，配合 Bloom 后处理特效营造星际氛围"
            />
            <FeatureCard
              index={2}
              icon={<Cpu className="w-6 h-6" />}
              title="百万粒子系统"
              description="通过 Web Worker 处理海量粒子计算，完全不阻塞主线程，体验极致性能"
            />
            <FeatureCard
              index={3}
              icon={<Grid3x3 className="w-6 h-6" />}
              title="多相机模式"
              description="自由、跟踪、电影级动态镜头三种模式，多角度探索天体运动"
            />
            <FeatureCard
              index={4}
              icon={<Sparkles className="w-6 h-6" />}
              title="预设场景库"
              description="包含经典的八字轨道、双星系统等预设，一键加载开始探索"
            />
            <FeatureCard
              index={5}
              icon={<Play className="w-6 h-6" />}
              title="实时交互控制"
              description="即时调整物理参数、相机设置、粒子效果，实时看到效果反馈"
            />
          </div>
        </div>
      </section>

      {/* Presets Section */}
      <section className="relative z-10 py-24 px-6 border-t border-cyan-500/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                预设场景
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              探索精心设计的天体系统，或创建属于自己的配置
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {presets.map((preset, index) => (
              <PresetCard
                key={index}
                index={index}
                name={preset.name}
                description={preset.description}
                colors={preset.colors}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                技术栈
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              使用现代 Web 技术打造高性能应用
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "React 19", desc: "现代UI框架" },
              { name: "TypeScript", desc: "类型安全开发" },
              { name: "Three.js", desc: "3D渲染引擎" },
              { name: "Vite", desc: "高速构建工具" },
              { name: "React Three Fiber", desc: "React 3D库" },
              { name: "Web Workers", desc: "后台计算" },
              { name: "Tailwind CSS", desc: "样式框架" },
              { name: "Motion", desc: "动画库" },
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
                className="group p-4 rounded-lg border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
              >
                <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {tech.name}
                </div>
                <div className="text-sm text-slate-400 mt-1">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="relative z-10 py-24 px-6 border-t border-cyan-500/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur-md p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                性能指标
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { label: "最大粒子数", value: "1M+" },
                { label: "模拟精度", value: "RK4" },
                { label: "帧率", value: "60 FPS" },
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-slate-400">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              准备好探索宇宙的奥秘了吗？
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              启动模拟器，见证混沌中的秩序，体验物理的美妙
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              开始模拟
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/10 bg-slate-950/60 backdrop-blur-md py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold mb-4">关于</div>
              <p className="text-sm text-slate-400">
                高性能的三体问题交互式可视化模拟器
              </p>
            </div>
            <div>
              <div className="font-bold mb-4">技术</div>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>React</li>
                <li>Three.js</li>
                <li>Web Workers</li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-4">相关链接</div>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>GitHub</li>
                <li>文档</li>
                <li>问题反馈</li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-4">许可证</div>
              <p className="text-sm text-slate-400">Apache 2.0</p>
            </div>
          </div>
          
          <div className="border-t border-cyan-500/10 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 Three-Body Problem Simulator. 探索宇宙的复杂性。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
