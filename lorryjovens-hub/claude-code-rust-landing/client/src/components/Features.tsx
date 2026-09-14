import { motion } from 'framer-motion'

const Features = () => {
  const features = [
    {
      icon: '🔒',
      title: '内存安全',
      description: 'Rust 的所有权系统确保内存安全，无需垃圾回收器',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: '⚡',
      title: '零成本抽象',
      description: '高级抽象不会带来性能损失，保持原生级别的执行效率',
      color: 'from-rust-500 to-rust-600',
    },
    {
      icon: '🔄',
      title: '并发安全',
      description: '编译时检查并发问题， fearless concurrency 无惧并发',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: '📦',
      title: '跨平台支持',
      description: '支持 Windows、macOS、Linux，一次编写到处运行',
      color: 'from-purple-500 to-violet-600',
    },
    {
      icon: '🛠️',
      title: '工具链完善',
      description: 'Cargo 包管理、rustfmt 格式化、clippy 代码检查',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: '🌐',
      title: 'WebAssembly',
      description: '无缝编译到 WASM，在浏览器中也能享受原生性能',
      color: 'from-pink-500 to-rose-600',
    },
  ]

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">核心特性</span>
          </h2>
          <p className="text-xl text-gray-400">
            Rust 语言的核心优势，让 Claude Code 更强大
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-6 hover-glow group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features