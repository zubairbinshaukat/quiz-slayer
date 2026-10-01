import { motion } from 'framer-motion'
import { useMemo } from 'react'

const COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ef4444', '#06b6d4', '#f97316', '#ec4899',
]

function generateParticles(count = 70) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 7,
    duration: 2.2 + Math.random() * 2,
    delay: Math.random() * 1.8,
    rotation: 360 + Math.random() * 540,
    isCircle: Math.random() > 0.55,
    isRect: Math.random() > 0.7,
    drift: (Math.random() - 0.5) * 180,
    scaleX: 0.5 + Math.random() * 0.8,
  }))
}

export function ExamConfetti() {
  const particles = useMemo(() => generateParticles(70), [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={p.isCircle ? 'rounded-full' : p.isRect ? 'rounded-none' : 'rounded-sm'}
          style={{
            position: 'absolute',
            left: `${p.x}vw`,
            top: -16,
            width: p.size,
            height: p.isRect ? p.size * 0.45 : p.isCircle ? p.size : p.size * 0.8,
            backgroundColor: p.color,
            scaleX: p.scaleX,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: '115vh',
            x: p.drift,
            rotate: p.rotation,
            opacity: [1, 1, 1, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
            opacity: { times: [0, 0.5, 0.7, 0.9, 1], duration: p.duration, delay: p.delay },
          }}
        />
      ))}
    </div>
  )
}
