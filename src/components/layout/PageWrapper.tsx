import type { ReactNode } from 'react'

export function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="min-h-[calc(100vh-64px)] animate-fade-in">{children}</div>
}
