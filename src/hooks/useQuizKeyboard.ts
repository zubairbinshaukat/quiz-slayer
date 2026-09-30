import { useEffect, useRef } from 'react'

export interface QuizKeyHandlers {
  optionCount: number
  answered: boolean
  onSelect: (index: number) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  onToggleMore: () => void
  onHelp: () => void
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

/**
 * Quiz shortcuts: 1–5 / A–E pick (unanswered only), Enter next, Ctrl/⌘+Enter submit,
 * Backspace / ← prev, → next, E know-more, ? help. Ignored while typing or a dialog is open.
 */
export function useQuizKeyboard(handlers: QuizKeyHandlers, enabled: boolean): void {
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })

  useEffect(() => {
    if (!enabled) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.altKey || isTypingTarget(e.target)) return
      if (document.querySelector('[aria-modal="true"]')) return
      const h = ref.current
      const key = e.key
      const mod = e.ctrlKey || e.metaKey

      if (key === 'Enter') {
        if (mod) {
          e.preventDefault()
          h.onSubmit()
          return
        }
        // Let focused buttons/links (other than options) activate natively
        const target = e.target as HTMLElement | null
        if (target?.closest('button:not([data-quiz-option]), a')) return
        e.preventDefault()
        h.onNext()
        return
      }
      if (mod) return

      if (key === 'Backspace' || key === 'ArrowLeft') {
        e.preventDefault()
        h.onPrev()
        return
      }
      if (key === 'ArrowRight') {
        e.preventDefault()
        h.onNext()
        return
      }
      if (key === '?') {
        e.preventDefault()
        h.onHelp()
        return
      }

      let index = -1
      if (/^[1-9]$/.test(key)) index = Number(key) - 1
      else if (/^[a-e]$/i.test(key)) index = key.toLowerCase().charCodeAt(0) - 97

      // E doubles as "Know more" once answered (or when there is no option E)
      if (key.toLowerCase() === 'e' && (h.answered || h.optionCount < 5)) {
        e.preventDefault()
        h.onToggleMore()
        return
      }
      if (index >= 0 && index < h.optionCount && index < 5 && !h.answered) {
        e.preventDefault()
        h.onSelect(index)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
