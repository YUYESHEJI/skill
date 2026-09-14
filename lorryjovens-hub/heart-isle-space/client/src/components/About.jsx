import React, { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart, Users, BookOpen, Leaf } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const About = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const values = [
    {
      icon: Heart,
      title: '温暖疗愈',
      description: '在舒适的环境中，让心灵得到真正的放松与疗愈'
    },
    {
      icon: Leaf,
      title: '自然质感',
      description: '融合自然元素，营造回归本真的空间体验'
    },
    {
      icon: Users,
      title: '成人共学',
      description: '与志同道合的伙伴一起，在交流中成长进步'
    },
    {
      icon: BookOpen,
      title: '终身学习',
      description: '打破年龄界限，保持对知识的渴望与好奇'
    }
  ]

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="relative py-32 bg-warm-white overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-stone/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-ochre text-sm tracking-widest uppercase mb-4"
            >
              About Us
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif-sc text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal mb-8 leading-tight"
            >
              在城市中
              <br />
              <span className="text-ochre">寻找心灵的栖息地</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 text-charcoal/70 text-lg leading-relaxed"
            >
              <p>
                心屿空间诞生于对现代都市人精神需求的深刻洞察。在快节奏的生活中，
                我们渴望有一个地方，能够暂时放下压力，与志同道合的人一起探索、学习、成长。
              </p>
              <p>
                这里不仅是一个物理空间，更是一个精神共同体。我们相信，
                成年人同样需要学习的环境，需要被理解、被支持、被启发。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex items-center gap-8"
            >
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-12 h-12 rounded-full border-2 border-warm-white bg-gradient-to-br from-ochre/20 to-deep-green/20 flex items-center justify-center text-sm"
                  >
                    {['🎨', '📚', '🌱', '💭'][i-1]}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-serif-sc text-2xl font-bold text-charcoal">500+</div>
                <div className="text-sm text-charcoal/50">共学伙伴已加入</div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Values Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="group tilt-card"
              >
                <div className="glass-card p-8 rounded-2xl h-full transition-all duration-500 hover:shadow-xl hover:shadow-ochre/10 hover:-translate-y-2">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ochre/10 to-deep-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <value.icon className="w-7 h-7 text-ochre" />
                  </div>
                  <h3 className="font-serif-sc text-xl font-semibold text-charcoal mb-3">
                    {value.title}
                  </h3>
                  <p className="text-charcoal/60 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-32 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <svg className="w-12 h-12 mx-auto mb-6 text-ochre/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <blockquote className="font-serif-sc text-2xl sm:text-3xl text-charcoal/80 leading-relaxed mb-6">
              学习不是填满一桶水，而是点燃一把火。
              <br />
              在心屿空间，我们点燃彼此心中的那团火。
            </blockquote>
            <cite className="text-charcoal/50 not-italic">— 心屿空间创始人</cite>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
