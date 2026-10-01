import type { Ref } from 'react'
import { getGrade, RESULT_HEX, resultTone, SITE_URL } from '../../lib/constants'
import { icon3dSrc } from '../../lib/icons3d'
import { formatPoints } from '../../lib/ranking'
import { formatClock } from '../../lib/utils'
import { LogoWordmark } from '../brand/Logo'

export interface ShareCardData {
  subject: string
  score: number
  correct: number
  total: number
  points: number
  timeTaken: number
}

// Fixed brand colours: the image looks the same whatever theme the viewer uses
const C = { bg: '#0B0B0F', surface: '#141419', line: 'rgba(255,255,255,0.08)', fg: '#F4F4F5', muted: '#9A9AA3', accent: '#F5B73A' }
const ART = 1080
// Same display face as the on-page score (ScoreHero)
const DISPLAY_FONT = "'Bricolage Grotesque Variable', 'Geist Variable', system-ui, sans-serif"

/** The 1080×1080 artwork (inline styles only, so html-to-image renders it faithfully). */
function ShareCardArt({ data, ref }: { data: ShareCardData; ref?: Ref<HTMLDivElement> }) {
  const { subject, score, correct, total, points, timeTaken } = data
  const grade = getGrade(score)
  const tone = RESULT_HEX[resultTone(score)]
  return (
    <div
      ref={ref}
      style={{
        width: ART, height: ART, padding: 76, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
        color: C.fg, fontFamily: "'Geist Variable', system-ui, sans-serif", position: 'relative', overflow: 'hidden',
        background: `radial-gradient(900px 700px at 0% -10%, rgba(245,183,58,0.22), transparent 60%), radial-gradient(760px 620px at 100% 30%, ${tone}33, transparent 62%), ${C.bg}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LogoWordmark size={64} title="" glow style={{ color: C.fg }} />
        <img src={icon3dSrc(grade.icon, 'premium')} width={180} height={180} alt="" style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.55))' }} />
      </div>
      <p style={{ marginTop: 8, fontSize: 44, fontWeight: 600, color: C.muted, letterSpacing: '-0.01em' }}>{subject}</p>
      <p style={{ fontFamily: DISPLAY_FONT, fontSize: 260, fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.05em', color: tone, marginTop: 16, fontVariantNumeric: 'tabular-nums' }}>
        {score}<span style={{ fontSize: 140 }}>%</span>
      </p>
      <p style={{ marginTop: 20, fontSize: 48, fontWeight: 800, letterSpacing: '-0.02em' }}>{grade.label}</p>
      <div style={{ marginTop: 'auto', display: 'flex', gap: 24, fontVariantNumeric: 'tabular-nums' }}>
        {[
          ['Correct', `${correct}/${total}`],
          ['Points', formatPoints(points)],
          ['Time', formatClock(timeTaken)],
        ].map(([label, value]) => (
          <div key={label} style={{ flex: 1, background: C.surface, border: `2px solid ${C.line}`, borderRadius: 32, padding: '24px 30px' }}>
            <div style={{ fontSize: 26, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ fontSize: 60, fontWeight: 800, marginTop: 6 }}>{value}</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 26, fontSize: 30, color: C.muted, fontWeight: 500 }}>{SITE_URL.replace(/^https?:\/\//, '')}</p>
    </div>
  )
}

interface ShareCardPreviewProps {
  data: ShareCardData
  /** Rendered edge length in px (the art is scaled from 1080). */
  size?: number
  artRef?: Ref<HTMLDivElement>
}

/** Visible, scaled-down preview of exactly what Share exports. */
export function ShareCardPreview({ data, size = 300, artRef }: ShareCardPreviewProps) {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded-[18px] border border-line shadow-[var(--float)]"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Share image: ${data.score}% on ${data.subject}`}
    >
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${size / ART})` }}>
        <ShareCardArt data={data} ref={artRef} />
      </div>
    </div>
  )
}
