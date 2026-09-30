import { useEffect } from 'react'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from './constants'

interface PageMeta {
  /** Page name; rendered as "{title} · Quiz Slayer". Omit for the default title. */
  title?: string
  description?: string
  /** Path for the canonical URL, e.g. "/history". */
  path: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/** Sets document title, description, canonical and OG tags for the current page. */
export function usePageMeta({ title, description = DEFAULT_DESCRIPTION, path }: PageMeta): void {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE
    const url = `${SITE_URL}${path === '/' ? '/' : path}`
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertCanonical(url)
  }, [title, description, path])
}
