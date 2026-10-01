import { useEffect, useRef, useState } from 'react'
import { parseLinkPayload, type LinkKind } from '../../lib/linkUi'
import { Icon } from '../ui/Icon'

interface DetectedBarcode {
  rawValue: string
}
interface BarcodeDetectorLike {
  detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>
}
type BarcodeDetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorLike

const SCAN_INTERVAL_MS = 250

/**
 * Camera viewfinder that reads a link QR code with BarcodeDetector. The camera
 * is requested when this mounts (i.e. only after the user tapped "Scan QR")
 * and released on unmount.
 */
export function QrScanner({ kind, onCode }: { kind: LinkKind; onCode: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCodeRef = useRef(onCode)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    onCodeRef.current = onCode
  })

  useEffect(() => {
    let stream: MediaStream | null = null
    let timer = 0
    let stopped = false

    async function start() {
      try {
        const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector
        const detector = new Detector({ formats: ['qr_code'] })
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (stopped || !videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        const tick = async () => {
          if (stopped || !videoRef.current) return
          try {
            const found = await detector.detect(videoRef.current)
            for (const b of found) {
              const code = parseLinkPayload(b.rawValue, kind)
              if (code && code !== 'wrong_way') {
                stopped = true
                onCodeRef.current(code)
                return
              }
              setHint(code === 'wrong_way' ? 'That QR is meant to be scanned by your other device.' : 'That QR code isn’t a Quiz Slayer link code.')
            }
          } catch { /* frame not ready */ }
          if (!stopped) timer = window.setTimeout(() => void tick(), SCAN_INTERVAL_MS)
        }
        void tick()
      } catch (err) {
        if (stopped) return
        const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError')
        setError(denied ? 'Camera access was blocked. Enter the code instead.' : 'Couldn’t start the camera. Enter the code instead.')
      }
    }
    void start()

    return () => {
      stopped = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [kind])

  if (error) {
    return (
      <p role="alert" className="card flex items-start gap-2.5 p-3.5 text-sm text-muted">
        <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-danger" />
        {error}
      </p>
    )
  }

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-card border border-line bg-black">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" aria-label="Camera viewfinder" />
        <div className="pointer-events-none absolute inset-[18%] rounded-btn border-2 border-accent/80" aria-hidden="true" />
      </div>
      <p className="mt-2 text-center text-sm text-muted" role="status">
        {hint ?? 'Point the camera at the QR code on your other device.'}
      </p>
    </div>
  )
}
