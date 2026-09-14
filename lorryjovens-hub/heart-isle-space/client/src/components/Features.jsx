import React, { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { 
  Coffee, 
  BookMarked, 
  Palette, 
  Music, 
  Flower2, 
  Lightbulb,
  ArrowRight
} from 'lucide-react'

const Features = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const features = [
    {
      icon: Coffee,
      title: '静谧咖啡角',
      description: '精选单品咖啡，在香醇中开启美好的一天',
      image: '☕',
      color: 'from-amber-100 to-orange-50'
    },
    {
      icon: BookMarked,
      title: '阅读空间',
      description: ' curated 书单，与好书不期而遇',
      image: '📖',
      color: 'from-blue-100 to-indigo-50'
    },
    {
      icon: Palette,
      title: '创意工坊',
      description: '绘画、手工、设计，释放你的创造力',
      image: '🎨',
      color: 'from-pink-100 to-rose-50'
    },
    {
      icon: Music,
      title: '音乐疗愈',
      description: '黑胶唱片、现场演奏，用音乐治愈心灵',
      image: '🎵',
      color: 'from-purple-100 to-violet-50'
    },
    {
      icon: Flower2,
      title: '植物花园',
      description: '室内绿植环绕，感受自然的呼吸',
      image: '🌿',
      color: 'from-green-100 to-emerald-50'
    },
    {
      icon: Lightbulb,
      title: '思想沙龙',
      description: '主题讨论、读书会，碰撞思想的火花',
      image: '💡',
      color: 'from-yellow-100 to-amber-50'
    }
  ]

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className="relative py-32 bg-warm-gray overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ochre/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-deep-green/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-ochre text-sm tracking-widest uppercase mb-4"
          >
            Our Features
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif-sc text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal mb-6"
          >
            探索我们的<span className="text-ochre">特色空间</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-charcoal/60 text-lg"
          >
            每一个空间都经过精心设计，为你提供独特的体验
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group"
            >
              <div className="relative h-full glass-card rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-ochre/10 hover:-translate-y-2">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-3xl">{feature.image}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif-sc text-2xl font-semibold text-charcoal mb-3 flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>

                  {/* Description */}
                  <p className="text-charcoal/60 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Line */}
                  <div className="mt-6 h-px bg-gradient-to-r from-ochre to-transparent w-0 group-hover:w-full transition-all duration-500" />
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-4 right-4 w-20 h-20 opacity-10">
                  <feature.icon className="w-full h-full text-ochre" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <p className="text-charcoal/60 mb-6">还有更多惊喜等你发现</p>
          <motion.a
            href="#space"
            className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal text-white rounded-full font-medium hover:bg-deep-green transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            探索全部空间
            <ArrowRight size={18} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
