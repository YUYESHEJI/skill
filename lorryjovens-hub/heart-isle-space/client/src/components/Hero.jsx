import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text reveal animation
      const chars = textRef.current.querySelectorAll('.char')
      gsap.fromTo(chars, 
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2,
          stagger: 0.05,
          ease: 'power4.out',
          delay: 0.5
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const title = '心屿空间'
  const subtitle = 'Heart Isle Space'

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-white"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Organic Shapes */}
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-ochre/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-deep-green/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-stone/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-[20%] right-[15%] w-4 h-4 bg-ochre/40 rounded-full"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[40%] left-[10%] w-3 h-3 bg-deep-green/30 rounded-full"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-[30%] right-[20%] w-2 h-2 bg-ochre/50 rounded-full"
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 text-center px-6"
        style={{ y, opacity, scale }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-stone/50 mb-8"
        >
          <Sparkles size={14} className="text-ochre" />
          <span className="text-xs tracking-widest text-charcoal/70 uppercase">深圳首个成年人共学空间</span>
        </motion.div>

        {/* Main Title */}
        <div ref={textRef} className="overflow-hidden mb-4">
          <h1 className="font-serif-sc text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-charcoal tracking-tight">
            {title.split('').map((char, i) => (
              <span key={i} className="char inline-block">{char}</span>
            ))}
          </h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-lg sm:text-xl md:text-2xl text-charcoal/50 tracking-[0.3em] uppercase mb-8"
        >
          {subtitle}
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="max-w-xl mx-auto text-charcoal/60 text-base sm:text-lg leading-relaxed mb-12"
        >
          在城市的喧嚣中，寻找一片心灵的栖息地。
          <br />
          与志同道合的人一起，探索、学习、成长。
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#booking"
            className="magnetic-btn px-8 py-4 bg-deep-green text-white rounded-full font-medium text-sm tracking-wide hover:bg-charcoal transition-colors duration-300 shadow-lg shadow-deep-green/20"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            预约体验
          </motion.a>
          <motion.a
            href="#about"
            className="magnetic-btn px-8 py-4 bg-transparent text-charcoal border border-charcoal/20 rounded-full font-medium text-sm tracking-wide hover:bg-charcoal hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            了解更多
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '500+', label: '共学伙伴' },
            { value: '50+', label: '主题活动' },
            { value: '98%', label: '满意度' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-serif-sc text-2xl sm:text-3xl font-bold text-charcoal mb-1">{stat.value}</div>
              <div className="text-xs text-charcoal/50 tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.a
          href="#about"
          className="flex flex-col items-center gap-2 text-charcoal/40 hover:text-charcoal transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ArrowDown size={16} />
        </motion.a>
      </motion.div>

      {/* Decorative Lines */}
      <svg className="absolute bottom-0 left-0 w-full h-32 opacity-20" preserveAspectRatio="none">
        <motion.path
          d="M0,64 Q250,0 500,64 T1000,64 L1000,128 L0,128 Z"
          fill="none"
          stroke="#B8956B"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
      </svg>
    </section>
  )
}

export default Hero
