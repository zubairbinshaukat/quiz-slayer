import { flushSync } from 'react-dom'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Runs a synchronous React state update inside a directional view transition
 * (question card slides left/right). Falls back to an instant update.
 */
export function withQuestionTransition(dir: 'next' | 'prev', update: () => void): void {
  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
    update()
    return
  }
  const root = document.documentElement
  root.dataset.qDir = dir
  const transition = document.startViewTransition(() => {
    flushSync(update)
  })
  void transition.finished.finally(() => {
    delete root.dataset.qDir
  })
}
