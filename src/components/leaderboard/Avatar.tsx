import { avatarColor, initials } from '../../lib/avatar'
import { cn } from '../../lib/utils'

/** Generated avatar: initials on a colour hashed from the name. */
export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold text-[#111114]', className)}
      style={{ width: size, height: size, background: avatarColor(name), fontSize: Math.round(size * 0.38) }}
    >
      {initials(name)}
    </span>
  )
}
