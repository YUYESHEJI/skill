import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const Cursor = () => {
  const dotRef = useRef(null)
  const outlineRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // Check if touch device
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  useEffect(() => {
    if (isTouchDevice) return

    const dot = dotRef.current
    const outline = outlineRef.current

    const onMouseMove = (e) => {
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      })

      gsap.to(outline, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const onMouseEnter = () => {
      gsap.to([dot, outline], { opacity: 1, duration: 0.3 })
    }

    const onMouseLeave = () => {
      gsap.to([dot, outline], { opacity: 0, duration: 0.3 })
    }

    // Add hover detection for interactive elements
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, .magnetic-btn, .tilt-card'
      )

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovering(true))
        el.addEventListener('mouseleave', () => setIsHovering(false))
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('mouseleave', onMouseLeave)

    // Initial setup
    gsap.set([dot, outline], { opacity: 0 })
    
    // Add hover listeners after a short delay to ensure DOM is ready
    setTimeout(addHoverListeners, 100)

    // Re-add listeners when DOM changes
    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('mouseleave', onMouseLeave)
      observer.disconnect()
    }
  }, [isTouchDevice])

  if (isTouchDevice) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block" />
      <div 
        ref={outlineRef} 
        className={`cursor-outline hidden md:block ${isHovering ? 'hover' : ''}`}
      />
    </>
  )
}

export default Cursor
