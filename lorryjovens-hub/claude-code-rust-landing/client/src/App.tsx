import { useEffect } from 'react'
import { motion } from 'framer-motion'
import ParticlesBackground from './components/ParticlesBackground'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Performance from './components/Performance'
import Features from './components/Features'
import Architecture from './components/Architecture'
import Install from './components/Install'
import Comparison from './components/Comparison'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { useVisitStore } from './store/useStore'

function App() {
  const { trackVisit } = useVisitStore()

  useEffect(() => {
    trackVisit(window.location.pathname)
  }, [])

  return (
    <div className="relative min-h-screen bg-dark-900 overflow-x-hidden">
      {/* Background Effects */}
      <ParticlesBackground />
      
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute w-96 h-96 bg-rust-600 rounded-full blur-[120px] opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-orange-500 rounded-full blur-[120px] opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: '50%', right: '10%' }}
        />
        <motion.div 
          className="absolute w-80 h-80 bg-rust-800 rounded-full blur-[100px] opacity-20"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, 50, -50, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ bottom: '10%', left: '30%' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navigation />
        
        <main>
          <Hero />
          <Performance />
          <Features />
          <Architecture />
          <Install />
          <Comparison />
          <Contact />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default App