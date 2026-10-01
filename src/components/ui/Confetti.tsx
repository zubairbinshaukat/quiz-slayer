import { useState, type CSSProperties } from 'react'

const COLORS = ['#F5B73A', '#FFC857', '#3DDC97', '#6EA8FF', '#FF7A7A', '#F4F4F5']

interface Particle {
  id: number
  x: number
  color: string
  w: number
  h: number
  duration: number
  delay: number
  rotation: number
  round: boolean
  drift: number
  /** Burst mode: where the piece is thrown to before it falls (px from the origin) */
  bx: number
  by: number
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const size = 6 + Math.random() * 7
    const round = Math.random() > 0.6
    // Upward fan: 20° to 160°
    const angle = ((20 + Math.random() * 140) * Math.PI) / 180
    const reach = 70 + Math.random() * 170
    return {
      id: i,
      x: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      w: size * (0.5 + Math.random() * 0.6),
      h: round ? size * 0.6 : size,
      duration: 2.2 + Math.random() * 2,
      delay: Math.random() * 1.2,
      rotation: 360 + Math.random() * 540,
      round,
      drift: (Math.random() - 0.5) * 180,
      bx: Math.cos(angle) * reach,
      by: -Math.sin(angle) * reach,
    }
  })
}

interface ConfettiProps {
  count?: number
  /** Viewport point to burst from; without it the pieces rain from the top edge. */
  origin?: { x: number; y: number }
}

/** CSS-only confetti (`confetti-fall` / `confetti-burst` keyframes in index.css). Hidden for reduced motion. */
export function Confetti({ count = 64, origin }: ConfettiProps) {
  const [particles] = useState(() => generateParticles(count))
  return (
    <div className="confetti pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={p.round ? 'absolute rounded-full' : 'absolute rounded-[2px]'}
          style={{
            left: origin ? origin.x : `${p.x}vw`,
            top: origin ? origin.y : -16,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            animation: origin
              ? `confetti-burst ${p.duration * 0.7}s linear ${p.delay * 0.15}s both`
              : `confetti-fall ${p.duration}s linear ${p.delay}s both`,
            '--confetti-drift': `${p.drift}px`,
            '--confetti-rotate': `${p.rotation}deg`,
            '--confetti-x': `${p.bx}px`,
            '--confetti-y': `${p.by}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
