import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Check, Loader2 } from 'lucide-react'

const Booking = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    type: 'visit',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const visitTypes = [
    { value: 'visit', label: '首次体验', desc: '免费参观空间，了解我们的服务' },
    { value: 'coffee', label: '咖啡时光', desc: '在咖啡角享受悠闲午后' },
    { value: 'reading', label: '阅读空间', desc: '使用我们的阅读区域' },
    { value: 'workshop', label: '参加工作坊', desc: '参与创意或学习类活动' },
    { value: 'membership', label: '会员咨询', desc: '了解会员权益与价格' }
  ]

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formState.name.trim()) newErrors.name = '请输入姓名'
    if (!formState.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    if (!formState.phone.trim()) {
      newErrors.phone = '请输入手机号'
    } else if (!/^1[3-9]\d{9}$/.test(formState.phone)) {
      newErrors.phone = '请输入有效的手机号'
    }
    if (!formState.date) newErrors.date = '请选择日期'
    if (!formState.time) newErrors.time = '请选择时间'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <section 
      id="booking" 
      ref={sectionRef}
      className="relative py-32 bg-warm-gray overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-ochre/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-deep-green/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-ochre text-sm tracking-widest uppercase mb-4"
            >
              Book a Visit
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif-sc text-4xl sm:text-5xl font-bold text-charcoal mb-6"
            >
              预约你的
              <br />
              <span className="text-ochre">专属体验</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-charcoal/60 text-lg mb-12 leading-relaxed"
            >
              填写以下信息，我们将在24小时内与你确认预约详情。
              首次体验完全免费，期待在心屿空间见到你。
            </motion.p>

            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-ochre/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-ochre" />
                </div>
                <div>
                  <div className="text-sm text-charcoal/50 mb-1">电话咨询</div>
                  <div className="font-medium text-charcoal">0755-8888-8888</div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-deep-green/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-deep-green" />
                </div>
                <div>
                  <div className="text-sm text-charcoal/50 mb-1">邮件联系</div>
                  <div className="font-medium text-charcoal">hello@heartisle.space</div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-ochre/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-ochre" />
                </div>
                <div>
                  <div className="text-sm text-charcoal/50 mb-1">营业时间</div>
                  <div className="font-medium text-charcoal">周一至周日 9:00 - 21:00</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 rounded-3xl text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-serif-sc text-2xl font-semibold text-charcoal mb-4">
                    预约成功！
                  </h3>
                  <p className="text-charcoal/60 mb-8">
                    我们已收到你的预约申请，将在24小时内通过短信或邮件与你确认。
                    感谢你选择心屿空间！
                  </p>
                  <motion.button
                    onClick={() => {
                      setIsSubmitted(false)
                      setFormState({
                        name: '',
                        email: '',
                        phone: '',
                        date: '',
                        time: '',
                        type: 'visit',
                        message: ''
                      })
                    }}
                    className="px-8 py-3 bg-charcoal text-white rounded-full font-medium hover:bg-deep-green transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    再次预约
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="glass-card p-8 rounded-3xl"
                >
                  {/* Visit Type */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-charcoal mb-4">
                      选择体验类型
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visitTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                            formState.type === type.value
                              ? 'border-ochre bg-ochre/5'
                              : 'border-transparent bg-white/50 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formState.type === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="font-medium text-charcoal text-sm mb-1">{type.label}</div>
                          <div className="text-xs text-charcoal/50">{type.desc}</div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        姓名 *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                        <input
                          type="text"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border ${
                            errors.name ? 'border-red-400' : 'border-transparent'
                          } focus:border-ochre focus:outline-none transition-colors`}
                          placeholder="你的名字"
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        手机号 *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                        <input
                          type="tel"
                          name="phone"
                          value={formState.phone}
                          onChange={handleChange}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border ${
                            errors.phone ? 'border-red-400' : 'border-transparent'
                          } focus:border-ochre focus:outline-none transition-colors`}
                          placeholder="138xxxx8888"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      邮箱 *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                      <input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border ${
                          errors.email ? 'border-red-400' : 'border-transparent'
                        } focus:border-ochre focus:outline-none transition-colors`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  {/* Date & Time */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        预约日期 *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                        <input
                          type="date"
                          name="date"
                          value={formState.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border ${
                            errors.date ? 'border-red-400' : 'border-transparent'
                          } focus:border-ochre focus:outline-none transition-colors`}
                        />
                      </div>
                      {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        预约时间 *
                      </label>
                      <select
                        name="time"
                        value={formState.time}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/50 border ${
                          errors.time ? 'border-red-400' : 'border-transparent'
                        } focus:border-ochre focus:outline-none transition-colors appearance-none`}
                      >
                        <option value="">选择时间</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time}</p>}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      备注信息（选填）
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-charcoal/30" />
                      <textarea
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        rows={3}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-transparent focus:border-ochre focus:outline-none transition-colors resize-none"
                        placeholder="有什么特殊需求或问题吗？"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-deep-green text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-charcoal transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      '确认预约'
                    )}
                  </motion.button>

                  <p className="mt-4 text-center text-xs text-charcoal/40">
                    提交即表示你同意我们的服务条款与隐私政策
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Booking
