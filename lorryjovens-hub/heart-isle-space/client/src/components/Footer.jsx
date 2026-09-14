import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Instagram, MessageCircle } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    explore: [
      { label: '关于我们', href: '#about' },
      { label: '特色服务', href: '#features' },
      { label: '空间展示', href: '#space' },
      { label: '共学旅程', href: '#journey' },
    ],
    services: [
      { label: '预约体验', href: '#booking' },
      { label: '会员服务', href: '#booking' },
      { label: '企业服务', href: '#booking' },
      { label: '活动合作', href: '#booking' },
    ],
    support: [
      { label: '常见问题', href: '#' },
      { label: '联系我们', href: '#booking' },
      { label: '隐私政策', href: '#' },
      { label: '服务条款', href: '#' },
    ]
  }

  return (
    <footer className="relative bg-charcoal text-white overflow-hidden">
      {/* Top Wave */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ochre/30 to-transparent" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ochre to-deep-green flex items-center justify-center text-xl">
                🌿
              </div>
              <div>
                <span className="font-serif-sc text-xl font-semibold">心屿空间</span>
                <span className="block text-[10px] text-white/40 tracking-widest uppercase">Heart Isle Space</span>
              </div>
            </div>
            
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              深圳首个成年人共学空间，为都市人打造温暖疗愈的学习与社交环境。
              在这里，与志同道合的人一起探索、学习、成长。
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 text-white/60 hover:text-ochre transition-colors text-sm">
                <MapPin size={16} />
                <span>深圳市南山区科技园南区</span>
              </a>
              <a href="tel:0755-8888-8888" className="flex items-center gap-3 text-white/60 hover:text-ochre transition-colors text-sm">
                <Phone size={16} />
                <span>0755-8888-8888</span>
              </a>
              <a href="mailto:hello@heartisle.space" className="flex items-center gap-3 text-white/60 hover:text-ochre transition-colors text-sm">
                <Mail size={16} />
                <span>hello@heartisle.space</span>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-medium text-white mb-6">探索</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-white/60 hover:text-ochre transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-6">服务</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-white/60 hover:text-ochre transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-6">支持</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-white/60 hover:text-ochre transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h4 className="font-serif-sc text-xl font-semibold mb-2">订阅我们的动态</h4>
              <p className="text-white/60 text-sm">获取最新活动信息与会员专属优惠</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-64 px-4 py-3 rounded-full bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-ochre transition-colors"
              />
              <motion.button
                className="px-6 py-3 bg-ochre text-white rounded-full font-medium text-sm hover:bg-ochre/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                订阅
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} 心屿空间 Heart Isle Space. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <motion.a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-ochre hover:text-white transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle size={18} />
            </motion.a>
            <motion.a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-ochre hover:text-white transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Instagram size={18} />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-ochre/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-48 h-48 bg-deep-green/5 rounded-full blur-3xl" />
    </footer>
  )
}

export default Footer
