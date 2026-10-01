import { flushSync } from 'react-dom'
import { isLiteActive } from './liteMode'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Whether route / question view transitions should run (off in lite mode). */
export function viewTransitionsEnabled(): boolean {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function' && !isLiteActive()
}

/**
 * Runs a synchronous React state update inside a directional view transition
 * (question card slides left/right). Falls back to an instant update.
 */
export function withQuestionTransition(dir: 'next' | 'prev', update: () => void): void {
  if (!viewTransitionsEnabled() || prefersReducedMotion()) {
    update()
    return
  }
  const root = document.documentElement
  root.dataset.qDir = dir
  const transition = document.startViewTransition(() => {
    flushSync(update)
  })
  // `ready` rejects when the transition is skipped (e.g. the tab is hidden); the update still applies
  transition.ready.catch(() => {})
  void transition.finished.finally(() => {
    delete root.dataset.qDir
  })
}
