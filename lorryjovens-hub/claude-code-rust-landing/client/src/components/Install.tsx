import { motion } from 'framer-motion'
import { useState } from 'react'

const Install = () => {
  const [copied, setCopied] = useState(false)

  const installCommands = [
    {
      platform: 'Windows',
      icon: '🪟',
      command: 'npm install -g claude-code-rust',
    },
    {
      platform: 'macOS',
      icon: '🍎',
      command: 'brew install claude-code-rust',
    },
    {
      platform: 'Linux',
      icon: '🐧',
      command: 'curl -sSf https://install.claude-code.rs | sh',
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="install" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">快速安装</span>
          </h2>
          <p className="text-xl text-gray-400">
            一行命令，即刻开始使用
          </p>
        </motion.div>

        {/* Install Commands */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {installCommands.map((cmd, index) => (
            <motion.div
              key={cmd.platform}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-6 hover-glow"
            >
              <div className="text-4xl mb-4">{cmd.icon}</div>
              <h3 className="text-lg font-semibold mb-4">{cmd.platform}</h3>
              <div className="bg-dark-800 rounded-lg p-4 font-mono text-sm relative group">
                <code className="text-rust-400">{cmd.command}</code>
                <button
                  onClick={() => copyToClipboard(cmd.command)}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                >
                  {copied ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">快速开始指南</h3>
          <div className="space-y-4">
            {[
              { step: 1, text: '安装 Claude Code Rust' },
              { step: 2, text: '运行 `claude-code init` 初始化项目' },
              { step: 3, text: '使用 `claude-code chat` 开始对话' },
              { step: 4, text: '享受极速 AI 编程体验！' },
            ].map((item) => (
              <div key={item.step} className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-rust-600 flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <span className="text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Install