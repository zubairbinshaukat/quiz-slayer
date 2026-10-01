import { useLiteMode } from '../../hooks/useLiteMode'
import { icon3dSrc, type Icon3DName, type Icon3DStyle } from '../../lib/icons3d'
import { cn } from '../../lib/utils'

interface Icon3DProps {
  name: Icon3DName
  /** Rendered size in px (square). */
  size?: number
  variant?: Icon3DStyle
  /** Empty alt = decorative (default). */
  alt?: string
  eager?: boolean
  className?: string
}

/**
 * Lazy, fixed-size 3D icon: 128px file on 1x screens, 256px on dense screens.
 * Lite mode always loads the small file.
 */
export function Icon3D({ name, size = 56, variant = 'clay', alt = '', eager = false, className }: Icon3DProps) {
  const { lite } = useLiteMode()
  return (
    <img
      src={icon3dSrc(name, variant, lite ? 1 : 2)}
      srcSet={lite ? undefined : `${icon3dSrc(name, variant, 1)} 1x, ${icon3dSrc(name, variant, 2)} 2x`}
      width={size}
      height={size}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={cn('select-none object-contain', className)}
      style={{ width: size, height: size }}
    />
  )
}
