import { motion } from 'framer-motion'

const Architecture = () => {
  const layers = [
    {
      name: '用户界面层',
      description: 'React + TypeScript 前端',
      tech: ['React', 'TypeScript', 'Tailwind CSS'],
      color: 'bg-blue-500/20 border-blue-500/50',
    },
    {
      name: 'API 层',
      description: 'RESTful API 接口',
      tech: ['Express', 'Node.js'],
      color: 'bg-green-500/20 border-green-500/50',
    },
    {
      name: '核心引擎层',
      description: 'Rust 编写的核心逻辑',
      tech: ['Rust', 'napi-rs', 'Native Modules'],
      color: 'bg-rust-500/20 border-rust-500/50',
    },
    {
      name: '数据存储层',
      description: '高性能数据存储',
      tech: ['SQLite', 'Redis', 'File System'],
      color: 'bg-purple-500/20 border-purple-500/50',
    },
  ]

  return (
    <section id="architecture" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">技术架构</span>
          </h2>
          <p className="text-xl text-gray-400">
            现代化的分层架构设计，Rust 核心驱动
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <div className="space-y-4">
            {layers.map((layer, index) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-6 border ${layer.color} hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{layer.name}</h3>
                    <p className="text-gray-400 mt-1">{layer.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {layer.tech.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full bg-white/10 text-sm font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Flow Arrow */}
          <div className="flex justify-center mt-8">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-rust-400"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Rust Core Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass-strong rounded-2xl p-8 text-center"
        >
          <div className="text-6xl mb-4">🦀</div>
          <h3 className="text-2xl font-bold mb-4 text-gradient-rust">Rust 核心引擎</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            通过 napi-rs 将 Rust 编译为 Node.js 原生模块，
            在保持 JavaScript 生态兼容性的同时，获得 Rust 的极致性能。
            所有核心计算逻辑都在 Rust 中实现，确保最高效率。
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Architecture