import React, { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

const SpaceShow = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const spaces = [
    {
      id: 1,
      title: '静谧阅读区',
      description: '阳光洒落的角落，最适合沉浸在一本好书中',
      emoji: '📚',
      color: 'bg-amber-50',
      tags: ['阅读', '安静', '自然光']
    },
    {
      id: 2,
      title: '创意工作坊',
      description: '宽敞明亮的空间，激发无限创意灵感',
      emoji: '🎨',
      color: 'bg-rose-50',
      tags: ['手工', '绘画', '创作']
    },
    {
      id: 3,
      title: '咖啡休闲角',
      description: '香醇咖啡相伴，与朋友畅聊人生',
      emoji: '☕',
      color: 'bg-orange-50',
      tags: ['社交', '咖啡', '放松']
    },
    {
      id: 4,
      title: '冥想花园',
      description: '绿植环绕的私密空间，让心灵回归平静',
      emoji: '🌿',
      color: 'bg-green-50',
      tags: ['冥想', '自然', '疗愈']
    },
    {
      id: 5,
      title: '音乐欣赏室',
      description: '高品质音响设备，享受音乐的美妙',
      emoji: '🎵',
      color: 'bg-violet-50',
      tags: ['音乐', '黑胶', '沉浸']
    },
    {
      id: 6,
      title: '多功能沙龙区',
      description: '灵活变换的空间，适合各类主题活动',
      emoji: '💫',
      color: 'bg-blue-50',
      tags: ['活动', '分享', '交流']
    }
  ]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % spaces.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + spaces.length) % spaces.length)
  }

  return (
    <section 
      id="space" 
      ref={sectionRef}
      className="relative py-32 bg-warm-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #B8956B 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-ochre text-sm tracking-widest uppercase mb-4"
          >
            Space Gallery
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif-sc text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal mb-6"
          >
            空间<span className="text-ochre">展示</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-charcoal/60 text-lg"
          >
            每一处细节都经过精心设计，为你打造舒适的学习与社交环境
          </motion.p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space, index) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`group relative ${index === 0 || index === 3 ? 'md:row-span-2' : ''}`}
            >
              <motion.div
                className={`relative h-full min-h-[300px] ${space.color} rounded-3xl overflow-hidden cursor-pointer`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  setSelectedImage(space)
                  setCurrentIndex(index)
                }}
              >
                {/* Placeholder Visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl opacity-50 group-hover:scale-110 transition-transform duration-500">
                    {space.emoji}
                  </span>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {space.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-serif-sc text-2xl font-semibold text-white mb-2">
                    {space.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {space.description}
                  </p>
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 glass-card rounded-2xl p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '300㎡', label: '空间面积' },
              { value: '6', label: '功能区域' },
              { value: '50+', label: '座位数' },
              { value: '24h', label: '空调供应' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-serif-sc text-3xl font-bold text-charcoal mb-1">{stat.value}</div>
                <div className="text-sm text-charcoal/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 backdrop-blur-xl p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>

            {/* Navigation */}
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight size={24} />
            </button>

            {/* Content */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`${spaces[currentIndex].color} rounded-3xl p-20 mb-6`}>
                <span className="text-[120px]">{spaces[currentIndex].emoji}</span>
              </div>
              <h3 className="font-serif-sc text-3xl font-semibold text-white mb-3">
                {spaces[currentIndex].title}
              </h3>
              <p className="text-white/70 text-lg max-w-xl mx-auto">
                {spaces[currentIndex].description}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {spaces[currentIndex].tags.map((tag) => (
                  <span key={tag} className="px-4 py-1 bg-white/10 text-white text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {spaces.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'bg-white w-6' : 'bg-white/30'
                  }`}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default SpaceShow
