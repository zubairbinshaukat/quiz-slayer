import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type SyntheticEvent } from 'react'
import { cn } from '../../lib/utils'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  /** Fires once when the last digit is entered (typing or paste). */
  onComplete?: (value: string) => void
  length?: number
  /** Accessible name of the field. */
  label: string
  disabled?: boolean
  invalid?: boolean
  /** Focus when the surrounding Sheet opens. */
  autoFocus?: boolean
  /** Show dots instead of digits (PINs). */
  mask?: boolean
  autoComplete?: string
  describedBy?: string
  className?: string
}

/**
 * Digit code field: ONE real <input> drawn as separate boxes. A single input
 * keeps the mobile keyboard open between digits and makes paste, autofill
 * (autocomplete="one-time-code") and backspace behave natively.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  label,
  disabled,
  invalid,
  autoFocus,
  mask,
  autoComplete = 'one-time-code',
  describedBy,
  className,
}: OtpInputProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Also covers mounting inside an already-open sheet (the sheet only autofocuses on open)
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  function accept(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, length)
    if (digits === value) return
    onChange(digits)
    if (digits.length === length) onComplete?.(digits)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    accept(e.target.value)
  }

  // maxLength would cut a formatted paste ("123 456") before the digits are extracted
  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text')
    if (!text) return
    e.preventDefault()
    accept(text)
  }

  // Keep the caret at the end so backspace always removes the last digit
  function pinCaret(e: SyntheticEvent<HTMLInputElement>) {
    const el = e.currentTarget
    const end = el.value.length
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end)
  }

  const active = Math.min(value.length, length - 1)

  return (
    <div className={cn('relative mx-auto w-full max-w-[360px]', className)}>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length }, (_, i) => {
          const char = value[i]
          const isActive = focused && i === active && !disabled
          return (
            <span
              key={i}
              className={cn(
                'flex aspect-[4/5] min-h-12 items-center justify-center rounded-btn border bg-surface-2 font-mono text-2xl font-bold transition-colors',
                invalid ? 'border-danger/60' : isActive ? 'border-accent' : char ? 'border-line-strong' : 'border-line',
                disabled && 'opacity-50',
              )}
            >
              {char ? (mask ? '•' : char) : isActive ? <span className="h-6 w-0.5 animate-pulse rounded-full bg-accent" /> : null}
            </span>
          )
        })}
      </div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete={autoComplete}
        maxLength={length}
        value={value}
        ref={inputRef}
        onChange={handleChange}
        onPaste={handlePaste}
        onSelect={pinCaret}
        onFocus={() => {
          setFocused(true)
          // Once the keyboard has slid up and the sheet has resized, keep the boxes in view
          window.setTimeout(() => inputRef.current?.scrollIntoView({ block: 'nearest' }), 350)
        }}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        data-autofocus={autoFocus ? true : undefined}
        spellCheck={false}
        enterKeyHint="done"
        className="absolute inset-0 h-full w-full cursor-text rounded-btn border-0 bg-transparent text-base text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
      />
    </div>
  )
}
