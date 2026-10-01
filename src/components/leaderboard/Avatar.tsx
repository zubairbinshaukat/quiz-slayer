import type { CSSProperties } from 'react'
import { avatarGradient, initials } from '../../lib/avatar'
import { avatarEmojiFor } from '../../lib/emoji3d'
import { cn } from '../../lib/utils'
import { Emoji3D } from '../ui/Emoji3D'

interface AvatarProps {
  name: string
  size?: number
  /** Optional ring colour (CSS colour) drawn 3px outside the avatar. */
  ring?: string
  className?: string
}

/**
 * 3D emoji on a two-stop gradient disc hashed from the name: generated "Adjective Animal NN" names
 * get their animal, chosen names a stable pick from a fun pool. Initials only if the image fails.
 */
export function Avatar({ name, size = 40, ring, className }: AvatarProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundImage: avatarGradient(name),
    boxShadow: ring ? `0 0 0 3px ${ring}, inset 0 1px 0 rgb(255 255 255 / 0.35)` : 'inset 0 1px 0 rgb(255 255 255 / 0.35)',
  }
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full', className)}
      style={style}
    >
      <Emoji3D
        emoji={avatarEmojiFor(name)}
        size={Math.round(size * 0.7)}
        fallback={
          <span className="font-extrabold tracking-tight text-[#141419]" style={{ fontSize: Math.round(size * 0.36) }}>
            {initials(name)}
          </span>
        }
      />
    </span>
  )
}
