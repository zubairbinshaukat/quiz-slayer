import { useRef, useState } from 'react'
import { getGrade, SITE_URL } from '../../lib/constants'
import { icon3dSrc } from '../../lib/icons3d'
import { formatPoints } from '../../lib/ranking'
import { formatClock } from '../../lib/utils'
import { LogoWordmark } from '../brand/Logo'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

interface ShareCardProps {
  subject: string
  score: number
  correct: number
  total: number
  points: number
  timeTaken: number
}

// Fixed brand colours: the image looks the same whatever theme the viewer uses
const C = { bg: '#0B0B0F', surface: '#15161C', line: 'rgba(255,255,255,0.08)', fg: '#F4F4F5', muted: '#9A9AA3', accent: '#F5B73A' }

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Off-screen 1080×1080 result card → PNG → Web Share (files) or download. */
export function ShareCard({ subject, score, correct, total, points, timeTaken }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const grade = getGrade(score)

  async function handleShare() {
    if (!cardRef.current) return
    setBusy(true)
    setError(null)
    try {
      const { toBlob } = await import('html-to-image')
      const blob = await toBlob(cardRef.current, { width: 1080, height: 1080, pixelRatio: 1, backgroundColor: C.bg })
      if (!blob) throw new Error('Could not render image')
      const filename = `quiz-slayer-${score}.png`
      const file = new File([blob], filename, { type: 'image/png' })
      const text = `I scored ${score}% on ${subject} in Quiz Slayer.`
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Quiz Slayer', text })
      } else {
        downloadBlob(blob, filename)
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) setError('Sharing failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="secondary" className="flex-1" onClick={() => void handleShare()} disabled={busy} aria-busy={busy}>
        <Icon name="share" size={18} />
        {busy ? 'Preparing…' : 'Share'}
      </Button>
      {error && <p role="alert" className="basis-full text-center text-sm text-danger">{error}</p>}

      <div aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}>
        <div
          ref={cardRef}
          style={{
            width: 1080, height: 1080, background: C.bg, color: C.fg, padding: 88, boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', fontFamily: "'Geist Variable', system-ui, sans-serif",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <LogoWordmark size={60} title="" markClassName="text-accent" style={{ color: C.fg }} />
            <img src={icon3dSrc(grade.icon)} width={150} height={150} alt="" />
          </div>
          <p style={{ marginTop: 72, fontSize: 44, fontWeight: 600, color: C.muted, letterSpacing: '-0.01em' }}>{subject}</p>
          <p style={{ fontSize: 300, fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.05em', color: C.accent, marginTop: 16 }}>
            {score}<span style={{ fontSize: 140 }}>%</span>
          </p>
          <p style={{ marginTop: 28, fontSize: 48, fontWeight: 800, letterSpacing: '-0.02em' }}>{grade.label}</p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 24, fontVariantNumeric: 'tabular-nums' }}>
            {[
              ['Correct', `${correct}/${total}`],
              ['Points', formatPoints(points)],
              ['Time', formatClock(timeTaken)],
            ].map(([label, value]) => (
              <div key={label} style={{ flex: 1, background: C.surface, border: `2px solid ${C.line}`, borderRadius: 32, padding: '28px 32px' }}>
                <div style={{ fontSize: 26, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                <div style={{ fontSize: 60, fontWeight: 800, marginTop: 6 }}>{value}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 40, fontSize: 30, color: C.muted, fontWeight: 500 }}>{SITE_URL.replace(/^https?:\/\//, '')}</p>
        </div>
      </div>
    </>
  )
}
