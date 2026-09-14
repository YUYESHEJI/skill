import { motion } from 'framer-motion'

const Comparison = () => {
  const comparisons = [
    { feature: '启动速度', rust: '100ms', node: '1.5s', winner: 'rust' },
    { feature: '内存占用', rust: '50MB', node: '200MB', winner: 'rust' },
    { feature: '文件处理速度', rust: '10,000/s', node: '1,000/s', winner: 'rust' },
    { feature: '并发处理', rust: '无锁并发', node: '单线程', winner: 'rust' },
    { feature: '类型安全', rust: '编译时检查', node: '运行时检查', winner: 'rust' },
    { feature: '错误处理', rust: 'Result类型', node: 'try-catch', winner: 'rust' },
    { feature: '生态兼容', rust: 'Node.js兼容', node: '原生', winner: 'tie' },
    { feature: '开发效率', rust: '稍慢', node: '快速', winner: 'node' },
  ]

  return (
    <section id="comparison" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">性能对比</span>
          </h2>
          <p className="text-xl text-gray-400">
            Rust 版本 vs Node.js 版本，数据说话
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-dark-800/50">
                <th className="px-6 py-4 text-left text-gray-400">特性</th>
                <th className="px-6 py-4 text-center text-rust-400">Rust 版本</th>
                <th className="px-6 py-4 text-center text-gray-400">Node.js 版本</th>
                <th className="px-6 py-4 text-center text-gray-400">优势</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{row.feature}</td>
                  <td className={`px-6 py-4 text-center font-mono ${row.winner === 'rust' ? 'text-rust-400' : 'text-gray-300'}`}>
                    {row.rust}
                  </td>
                  <td className={`px-6 py-4 text-center font-mono ${row.winner === 'node' ? 'text-blue-400' : 'text-gray-300'}`}>
                    {row.node}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.winner === 'rust' && <span className="text-green-400">🦀 Rust</span>}
                    {row.winner === 'node' && <span className="text-blue-400">📦 Node</span>}
                    {row.winner === 'tie' && <span className="text-gray-400">⚖️ 平局</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full glass">
            <span className="text-2xl mr-3">🏆</span>
            <span className="text-lg">
              Rust 版本在 <span className="text-rust-400 font-bold">6/8</span> 项对比中胜出
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Comparison