import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface NavOptions {
  replace?: boolean
  state?: unknown
}

/** navigate() with a cross-fade view transition by default. */
export function useNav() {
  const navigate = useNavigate()
  return useCallback(
    (to: string, opts: NavOptions = {}) => {
      void navigate(to, { viewTransition: true, ...opts })
    },
    [navigate],
  )
}
