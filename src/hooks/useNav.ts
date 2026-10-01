import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { viewTransitionsEnabled } from '../lib/viewTransition'

interface NavOptions {
  replace?: boolean
  state?: unknown
}

/** navigate() with a cross-fade view transition by default (skipped in lite mode). */
export function useNav() {
  const navigate = useNavigate()
  return useCallback(
    (to: string, opts: NavOptions = {}) => {
      void navigate(to, { viewTransition: viewTransitionsEnabled(), ...opts })
    },
    [navigate],
  )
}
