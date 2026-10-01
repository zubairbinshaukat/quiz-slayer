import { lazy, Suspense, useRef, useState } from 'react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Icon3D } from '../components/ui/Icon3D'
import { useNav } from '../hooks/useNav'
import { ROUTES } from '../lib/constants'
import { convexEnabled } from '../lib/convex'
import { usePageMeta } from '../lib/seo'

const AdminPinSheet = lazy(() => import('../components/admin/AdminPinSheet').then((m) => ({ default: m.AdminPinSheet })))

const SECRET_TAPS = 7
const SECRET_WINDOW_MS = 4000

/** Unknown routes (and /stats without an owner session). */
export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', path: '/404' })
  const nav = useNav()
  const [pinOpen, setPinOpen] = useState(false)
  const taps = useRef<number[]>([])

  // Owner entry, deliberately unlabelled: 7 quick taps on the 3D arrow open the stats PIN prompt
  function onArrowTap() {
    if (!convexEnabled) return
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < SECRET_WINDOW_MS), now]
    if (taps.current.length >= SECRET_TAPS) {
      taps.current = []
      setPinOpen(true)
    }
  }

  return (
    <Page width="narrow">
      <div className="flex flex-col items-center pt-10 text-center">
        <div onClick={onArrowTap} className="touch-manipulation select-none transition-transform duration-150 active:scale-95">
          <Icon3D name="target" size={88} eager />
        </div>
        <p className="mt-5 font-mono text-sm font-semibold text-muted">404</p>
        <h1 className="mt-1 text-[28px] sm:text-3xl">Page not found</h1>
        <p className="mt-2 max-w-[34ch] text-sm text-muted">This page doesn’t exist or has moved.</p>
        <Button className="mt-6" onClick={() => nav(ROUTES.HOME)}>
          <Icon name="home" size={18} />
          Back to home
        </Button>
      </div>
      {pinOpen && (
        <Suspense fallback={null}>
          <AdminPinSheet onClose={() => setPinOpen(false)} />
        </Suspense>
      )}
    </Page>
  )
}
