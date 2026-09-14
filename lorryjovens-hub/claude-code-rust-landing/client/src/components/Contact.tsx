import { motion } from 'framer-motion'
import { useState } from 'react'

const Contact = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section id="contact" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">开始使用</span>
            </h2>
            <p className="text-xl text-gray-400">
              加入我们的社区，获取最新更新和技术支持
            </p>
          </div>

          {/* Email Signup */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mb-12"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入您的邮箱"
                className="flex-1 px-6 py-4 rounded-full bg-dark-800 border border-white/20 focus:border-rust-500 focus:outline-none transition-colors"
                required
              />
              <motion.button
                type="submit"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {submitted ? '已订阅 ✓' : '订阅更新'}
              </motion.button>
            </div>
          </motion.form>

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            {[
              { name: 'GitHub', icon: '📦', url: 'https://github.com' },
              { name: 'Discord', icon: '💬', url: 'https://discord.com' },
              { name: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
              { name: 'Docs', icon: '📚', url: '#' },
            ].map((social) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-4 hover-glow flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl mb-1">{social.icon}</span>
                <span className="text-sm text-gray-400">{social.name}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact