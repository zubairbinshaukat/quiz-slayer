import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

interface CopyBlockProps {
  title: string
  description?: ReactNode
  filename: string
  code: string
  copyLabel: string
  children?: ReactNode
}

/** Titled card with a scrollable code sample and a copy-to-clipboard button. */
export function CopyBlock({ title, description, filename, code, copyLabel, children }: CopyBlockProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  function copy() {
    void navigator.clipboard.writeText(code).then(() => setCopied(true))
  }

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="pt-2 text-lg">{title}</h2>
        <Button variant="secondary" size="sm" className="min-h-11" onClick={copy} aria-live="polite">
          <Icon name={copied ? 'check' : 'copy'} size={16} />
          {copied ? 'Copied' : copyLabel}
        </Button>
      </div>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      <div className="mt-4 overflow-hidden rounded-btn border border-line">
        <div className="border-b border-line bg-surface-2 px-3 py-2 font-mono text-xs text-muted">{filename}</div>
        <pre className="max-h-72 overflow-auto bg-bg p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-fg" data-lenis-prevent>
          <code>{code}</code>
        </pre>
      </div>
      {children}
    </section>
  )
}
