import { useState, type CSSProperties } from 'react'

const COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ef4444', '#06b6d4', '#f97316', '#ec4899',
]

interface Particle {
  id: number
  x: number
  color: string
  size: number
  duration: number
  delay: number
  rotation: number
  isCircle: boolean
  isRect: boolean
  drift: number
  scaleX: number
}

function generateParticles(count = 70): Particle[] {
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

/** CSS-only confetti burst (uses the `confetti-fall` keyframes in index.css). */
export function ExamConfetti() {
  const [particles] = useState(() => generateParticles(70))

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden motion-reduce:hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={p.isCircle ? 'rounded-full' : p.isRect ? 'rounded-none' : 'rounded-sm'}
          style={{
            position: 'absolute',
            left: `${p.x}vw`,
            top: -16,
            width: p.size * p.scaleX,
            height: p.isRect ? p.size * 0.45 : p.isCircle ? p.size : p.size * 0.8,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s both`,
            '--confetti-drift': `${p.drift}px`,
            '--confetti-rotate': `${p.rotation}deg`,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
