import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Icon3D } from '../components/ui/Icon3D'
import { useNav } from '../hooks/useNav'
import { ROUTES } from '../lib/constants'
import { usePageMeta } from '../lib/seo'

/** Unknown routes (and /stats without an owner session). */
export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', path: '/404' })
  const nav = useNav()
  return (
    <Page>
      <div className="flex flex-col items-center pt-10 text-center">
        <Icon3D name="target" size={88} eager />
        <p className="mt-5 font-mono text-sm font-semibold text-muted">404</p>
        <h1 className="mt-1 text-[28px] sm:text-3xl">Page not found</h1>
        <p className="mt-2 max-w-[34ch] text-sm text-muted">This page doesn’t exist or has moved.</p>
        <Button className="mt-6" onClick={() => nav(ROUTES.HOME)}>
          <Icon name="home" size={18} />
          Back to home
        </Button>
      </div>
    </Page>
  )
}
