import { useCallback, useRef, useState } from 'react'

const BG = '#0B0B0F'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Renders the 1080×1080 share card node to PNG → Web Share (files) or download. */
export function useShareImage({ filename, text }: { filename: string; text: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const share = useCallback(async () => {
    if (!ref.current) return
    setBusy(true)
    setError(null)
    try {
      const { toBlob } = await import('html-to-image')
      // The preview is scaled down by its parent; the node itself is laid out at 1080×1080
      const blob = await toBlob(ref.current, { width: 1080, height: 1080, pixelRatio: 1, backgroundColor: BG })
      if (!blob) throw new Error('Could not render image')
      const file = new File([blob], filename, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Quiz Slayer', text })
      } else {
        downloadBlob(blob, filename)
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) setError('Sharing failed. Try again.')
    } finally {
      setBusy(false)
    }
  }, [filename, text])

  return { ref, busy, error, share }
}
