import { useState, type ReactNode } from 'react'
import { emojiSrc, type EmojiDef } from '../../lib/emoji3d'
import { cn } from '../../lib/utils'

interface Emoji3DProps {
  emoji: EmojiDef
  /** Rendered size in px (square). */
  size: number
  eager?: boolean
  /** Shown if the image fails to load (defaults to the text emoji). */
  fallback?: ReactNode
  className?: string
}

/** Fluent 3D emoji from public/emoji3d (lazy); text emoji when the asset isn't fetched. Decorative. */
export function Emoji3D({ emoji, size, eager = false, fallback, className }: Emoji3DProps) {
  const [failed, setFailed] = useState(false)
  const src = emojiSrc(emoji)

  if (!src || failed) {
    if (failed && fallback !== undefined) return <>{fallback}</>
    return (
      <span
        aria-hidden="true"
        className={cn('inline-flex select-none items-center justify-center leading-none', className)}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.82) }}
      >
        {emoji.char}
      </span>
    )
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('select-none object-contain', className)}
      style={{ width: size, height: size }}
    />
  )
}
