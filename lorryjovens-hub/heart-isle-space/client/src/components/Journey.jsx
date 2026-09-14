import React, { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Search, Calendar, Users, Sparkles } from 'lucide-react'

const Journey = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })

  const lineHeight = useTransform(scrollYProgress, [0, 0.5], ['0%', '100%'])

  const steps = [
    {
      icon: Search,
      step: '01',
      title: '发现兴趣',
      description: '浏览我们的活动日历，找到感兴趣的主题。从读书会到手工坊，从音乐分享到思想沙龙，总有一款适合你。',
      color: 'bg-ochre'
    },
    {
      icon: Calendar,
      step: '02',
      title: '预约体验',
      description: '选择合适的时间，在线预约你的第一次体验。新会员可享受免费试访机会，零风险探索心屿空间。',
      color: 'bg-deep-green'
    },
    {
      icon: Users,
      step: '03',
      title: '加入共学',
      description: '来到空间，结识志同道合的伙伴。在轻松愉悦的氛围中，开启你的学习之旅，拓展人脉圈。',
      color: 'bg-ochre'
    },
    {
      icon: Sparkles,
      step: '04',
      title: '持续成长',
      description: '成为会员，享受专属权益。参与更多深度活动，甚至发起自己的主题分享，在给予中获得成长。',
      color: 'bg-deep-green'
    }
  ]

  return (
    <section 
      id="journey" 
      ref={sectionRef}
      className="relative py-32 bg-warm-white overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-ochre text-sm tracking-widest uppercase mb-4"
          >
            Your Journey
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif-sc text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal mb-6"
          >
            开启你的<span className="text-ochre">共学之旅</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-charcoal/60 text-lg"
          >
            四个简单步骤，开启一段全新的成长旅程
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-stone lg:-translate-x-1/2">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-ochre to-deep-green"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-24">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className={`relative flex items-center gap-8 lg:gap-16 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Icon Node */}
                <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className={`ml-24 lg:ml-0 lg:w-1/2 ${
                  index % 2 === 0 ? 'lg:pr-24 lg:text-right' : 'lg:pl-24'
                }`}>
                  <div className={`glass-card p-8 rounded-2xl inline-block text-left max-w-lg ${
                    index % 2 === 0 ? 'lg:ml-auto' : ''
                  }`}>
                    <span className="text-6xl font-serif-sc font-bold text-stone/50 block mb-4">
                      {item.step}
                    </span>
                    <h3 className="font-serif-sc text-2xl font-semibold text-charcoal mb-4">
                      {item.title}
                    </h3>
                    <p className="text-charcoal/60 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Empty space for other side */}
                <div className="hidden lg:block lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-32 text-center"
        >
          <div className="glass-card inline-block p-12 rounded-3xl max-w-2xl">
            <h3 className="font-serif-sc text-2xl font-semibold text-charcoal mb-4">
              准备好开始了吗？
            </h3>
            <p className="text-charcoal/60 mb-8">
              新会员首次体验完全免费，没有任何附加条件
            </p>
            <motion.a
              href="#booking"
              className="inline-flex items-center gap-2 px-8 py-4 bg-deep-green text-white rounded-full font-medium hover:bg-charcoal transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              立即预约免费体验
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Journey
