import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import SpaceShow from './components/SpaceShow'
import Journey from './components/Journey'
import Booking from './components/Booking'
import Footer from './components/Footer'
import Navigation from './components/Navigation'
import Cursor from './components/Cursor'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const mainRef = useRef(null)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Initialize scroll animations
      const ctx = gsap.context(() => {
        // Smooth scroll behavior for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault()
            const target = document.querySelector(this.getAttribute('href'))
            if (target) {
              gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: target, offsetY: 80 },
                ease: 'power3.inOut'
              })
            }
          })
        })
      }, mainRef)

      return () => ctx.revert()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-warm-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-stone rounded-full animate-breathe" />
            <div className="absolute inset-2 border-2 border-ochre/30 rounded-full animate-breathe" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-4 border-2 border-deep-green/20 rounded-full animate-breathe" style={{ animationDelay: '1s' }} />
            <span className="absolute inset-0 flex items-center justify-center text-3xl">🌿</span>
          </div>
          <p className="font-serif-sc text-charcoal/60 text-sm tracking-widest animate-pulse">
            心屿空间
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={mainRef} className="relative">
      {/* Grain Texture Overlay */}
      <div className="grain-overlay" />
      
      {/* Custom Cursor */}
      <Cursor />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main>
        <Hero />
        <About />
        <Features />
        <SpaceShow />
        <Journey />
        <Booking />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
