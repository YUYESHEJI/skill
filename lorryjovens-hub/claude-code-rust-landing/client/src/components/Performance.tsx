import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const Performance = () => {
  const [animatedValues, setAnimatedValues] = useState({
    rust: 0,
    node: 0,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({ rust: 95, node: 45 })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const metrics = [
    {
      name: '启动速度',
      rust: '100ms',
      node: '1.5s',
      improvement: '15x',
      icon: '⚡',
    },
    {
      name: '内存占用',
      rust: '50MB',
      node: '200MB',
      improvement: '4x',
      icon: '💾',
    },
    {
      name: '文件处理',
      rust: '10,000/s',
      node: '1,000/s',
      improvement: '10x',
      icon: '📁',
    },
    {
      name: '响应延迟',
      rust: '10ms',
      node: '100ms',
      improvement: '10x',
      icon: '🎯',
    },
  ]

  return (
    <section id="performance" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">极致性能</span>
          </h2>
          <p className="text-xl text-gray-400">
            Rust 重写带来的性能飞跃，让每一次操作都如闪电般快速
          </p>
        </motion.div>

        {/* Performance Bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Rust Performance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-rust-400">Rust 版本</span>
                <span className="text-2xl font-bold text-rust-400">{animatedValues.rust}%</span>
              </div>
              <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rust-500 to-rust-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedValues.rust}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">极致优化的原生性能</p>
            </div>

            {/* Node.js Comparison */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-400">Node.js 版本</span>
                <span className="text-2xl font-bold text-gray-400">{animatedValues.node}%</span>
              </div>
              <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedValues.node}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">传统 JavaScript 实现</p>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-6 hover-glow"
            >
              <div className="text-4xl mb-4">{metric.icon}</div>
              <h3 className="text-lg font-semibold mb-4">{metric.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rust</span>
                  <span className="text-rust-400 font-mono">{metric.rust}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Node.js</span>
                  <span className="text-gray-400 font-mono">{metric.node}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-green-400 font-bold">{metric.improvement} 提升</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Performance