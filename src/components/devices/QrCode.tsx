import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

const QUIET = 2 // quiet-zone modules around the symbol

interface Matrix {
  text: string
  size: number
  path: string
}

/** QR code as inline SVG. The encoder (`qrcode`) is loaded on demand. Always dark-on-white for scanners. */
export function QrCode({ text, size = 200, className }: { text: string; size?: number; className?: string }) {
  const [matrix, setMatrix] = useState<Matrix | null>(null)

  useEffect(() => {
    let cancelled = false
    void import('qrcode').then((mod) => {
      if (cancelled) return
      const create = mod.create ?? mod.default.create
      const { modules } = create(text, { errorCorrectionLevel: 'M' })
      let path = ''
      for (let r = 0; r < modules.size; r++) {
        for (let c = 0; c < modules.size; c++) {
          if (modules.get(r, c)) path += `M${c + QUIET} ${r + QUIET}h1v1h-1z`
        }
      }
      setMatrix({ text, size: modules.size + QUIET * 2, path })
    })
    return () => {
      cancelled = true
    }
  }, [text])

  const ready = matrix?.text === text
  return (
    <div
      className={cn('overflow-hidden rounded-card bg-white p-2', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="QR code for linking this device"
    >
      {ready ? (
        <svg viewBox={`0 0 ${matrix.size} ${matrix.size}`} width="100%" height="100%" shapeRendering="crispEdges" aria-hidden="true">
          <path d={matrix.path} fill="#111114" />
        </svg>
      ) : (
        <div className="h-full w-full animate-pulse rounded-btn bg-black/5" />
      )}
    </div>
  )
}
