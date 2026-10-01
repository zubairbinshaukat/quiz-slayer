import { useLiteMode } from '../../hooks/useLiteMode'
import { icon3dSrc, type Icon3DName } from '../../lib/icons3d'
import { cn } from '../../lib/utils'

interface Icon3DProps {
  name: Icon3DName
  /** Rendered size in px (square). */
  size?: number
  /** Empty alt = decorative (default). */
  alt?: string
  eager?: boolean
  /** Soft drop shadow under the icon (off in lite mode). */
  shadow?: boolean
  className?: string
}

/**
 * Lazy, fixed-size full-colour (premium) 3D icon: 128px file on 1x screens,
 * 256px on dense screens or when drawn larger than 96px. Lite mode always loads the small file.
 */
export function Icon3D({ name, size = 56, alt = '', eager = false, shadow = false, className }: Icon3DProps) {
  const { lite } = useLiteMode()
  const big = size > 96
  return (
    <img
      src={icon3dSrc(name, 'premium', lite ? 1 : 2)}
      srcSet={lite ? undefined : big ? undefined : `${icon3dSrc(name, 'premium', 1)} 1x, ${icon3dSrc(name, 'premium', 2)} 2x`}
      width={size}
      height={size}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={cn('select-none object-contain', shadow && 'icon-drop', className)}
      style={{ width: size, height: size }}
    />
  )
}
