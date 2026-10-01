import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const variants = {
  primary:
    'bg-themed-accent hover:bg-themed-accent-hover text-white shadow-md hover:shadow-lg active:shadow-sm',
  secondary:
    'bg-surface-card hover:bg-surface-secondary text-content-primary border border-themed-border shadow-sm',
  ghost:
    'bg-transparent hover:bg-surface-secondary text-content-secondary hover:text-content-primary',
  danger:
    'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-lg',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-colors duration-200 focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-themed-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
