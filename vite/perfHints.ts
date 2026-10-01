import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import type { HtmlTagDescriptor, IndexHtmlTransformContext, Plugin } from 'vite'

/**
 * `<img src="/x.webp" data-inline="160">` → the public/ image resized to 160px tall and embedded as a
 * WebP data URI, so it paints with the HTML. Keep these few and small: they cost HTML bytes on every load.
 */
async function inlineImages(html: string, publicDir: string): Promise<string> {
  const re = /src="\/([^"]+\.(?:webp|png))"(\s+)data-inline="(\d+)"/g
  let out = html
  for (const [match, file, space, height] of html.matchAll(re)) {
    const buf = await sharp(readFileSync(join(publicDir, file))).resize({ height: Number(height) }).webp({ quality: 82 }).toBuffer()
    out = out.replace(match, `src="data:image/webp;base64,${buf.toString('base64')}"${space}data-inline`)
  }
  return out
}

type Bundle = NonNullable<IndexHtmlTransformContext['bundle']>
type Chunk = Extract<Bundle[string], { type: 'chunk' }>

export interface PerfHintsOptions {
  /**
   * URL path → page module in src/pages (mirrors src/router.tsx). A key ending in `*` matches by prefix.
   * The page's chunk and its imports start downloading next to the entry instead of after it runs.
   */
  routes: Record<string, string>
  /** Emitted woff2 files to preload (the faces above the fold). */
  fonts: RegExp[]
  /** Origins to warm up (DNS + TLS) before the app connects. */
  preconnect?: string[]
}

/**
 * First-load pipeline for the production build:
 * - inlines the entry CSS and the splash logo (the HTML alone paints the splash: FCP = LCP),
 * - loads JS and fonts right after that first paint, all in parallel, with route-aware modulepreload
 *   (the opened route's chunk loads next to the entry instead of after it runs),
 * - preconnects to the backend.
 */
export function perfHints({ routes, fonts, preconnect = [] }: PerfHintsOptions): Plugin {
  let publicDir = ''
  return {
    name: 'quiz-slayer:perf-hints',
    apply: 'build',
    configResolved(config) {
      publicDir = config.publicDir
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        const chunks = Object.values(bundle).filter((c): c is Chunk => c.type === 'chunk')

        // Static import graph from a chunk, as file names
        const graph = (fileName: string, seen = new Set<string>()) => {
          if (seen.has(fileName)) return seen
          seen.add(fileName)
          const chunk = bundle[fileName]
          if (chunk?.type === 'chunk') for (const dep of chunk.imports) graph(dep, seen)
          return seen
        }
        const entry = chunks.find((c) => c.isEntry)
        const loaded = entry ? graph(entry.fileName) : new Set<string>()

        const map: Record<string, string[]> = {}
        for (const [path, page] of Object.entries(routes)) {
          const chunk = chunks.find((c) => c.facadeModuleId?.replace(/\\/g, '/').endsWith(`/src/pages/${page}.tsx`))
          if (!chunk) {
            this.warn(`perf-hints: no chunk for page "${page}"`)
            continue
          }
          map[path] = [...graph(chunk.fileName)].filter((f) => !loaded.has(f)).map((f) => `/${f}`)
        }

        const fontFiles = Object.keys(bundle)
          .filter((f) => f.endsWith('.woff2') && fonts.some((re) => re.test(f)))
          .map((f) => `/${f}`)

        // Inline the entry stylesheet and drop the file (nothing else references it)
        let out = (await inlineImages(html, publicDir)).replace(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/g, (tag, fileName: string) => {
          const asset = bundle[fileName]
          if (asset?.type !== 'asset') return tag
          delete bundle[fileName]
          return `<style>${String(asset.source).replace(/<\/style/gi, '<\\/style')}</style>`
        })

        const entryTag = /<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>/
        const src = entryTag.exec(out)?.[1]
        if (!src) return { html: out, tags: [] }

        // Paint first, then load. Vite's entry script and modulepreloads come out of <head>; one script at the
        // end of <body> requests everything the instant the splash is on screen (the browser's own
        // first-contentful-paint entry: presented, not just rendered): the entry, its vendor chunks, the
        // opened route's chunks and the fonts, all in parallel. On a real device that is one frame after the
        // HTML arrives, and nothing (CSS, fonts, JS) can hold back the logo. index.html calls window.__boot
        // once its logo is in; 600ms cap for background tabs or a missing paint entry.
        const vendor: string[] = []
        out = out.replace(entryTag, '').replace(/\s*<link rel="modulepreload" crossorigin href="([^"]+)">/g, (_, href: string) => {
          vendor.push(href)
          return ''
        })
        const boot = `(function(e,v,r,f){var d=0;function add(rel,h,font){var l=document.createElement('link');l.rel=rel;l.href=h;l.crossOrigin='';if(font){l.as='font';l.type='font/woff2'}document.head.appendChild(l)}function boot(){if(d++)return;var p=location.pathname.replace(/\\/+$/,'')||'/',k;f.forEach(function(h){add('preload',h,1)});v.forEach(function(h){add('modulepreload',h)});for(k in r)if(k===p||(k.slice(-1)==='*'&&p.indexOf(k.slice(0,-1))===0)){r[k].forEach(function(h){add('modulepreload',h)});break}var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src=e;document.head.appendChild(s)}function afterPaint(){try{if(performance.getEntriesByName('first-contentful-paint').length)return boot();new PerformanceObserver(function(l,o){if(l.getEntriesByName('first-contentful-paint').length){o.disconnect();boot()}}).observe({type:'paint'})}catch(x){requestAnimationFrame(function(){setTimeout(boot,0)})}}var sp=document.getElementById('splash');if(!sp||!document.documentElement.classList.contains('splash'))return boot();if(sp.classList.contains('in'))afterPaint();else window.__boot=afterPaint;setTimeout(boot,600)})(${JSON.stringify(src)},${JSON.stringify(vendor)},${JSON.stringify(map)},${JSON.stringify(fontFiles)})`

        const tags: HtmlTagDescriptor[] = [
          ...preconnect.map((href) => ({ tag: 'link', attrs: { rel: 'preconnect', href }, injectTo: 'head' as const })),
          { tag: 'script', children: boot, injectTo: 'body' },
        ]
        return { html: out, tags }
      },
    },
  }
}
