import type { SVGProps } from 'react'
import { MARK, MARK_SMALL } from './logoPaths'

/**
 * Quiz Slayer brand mark: "the Sliced S".
 * A geometric S cut once on the 45° blade line; the upper half has slipped down the cut.
 * Geometry lives on a 24-unit grid and matches public/logo.svg + branding/logo.svg.
 * Everything renders in `currentColor`, so tint with a text colour class.
 */

/** "Quiz Slayer" set in Geist 800, -0.035em tracking, outlined (no font dependency). */
const WORDMARK_TEXT =
  'M38.80 1.60C43.70 1.60 48.30 0.70 52.40-0.80L57.80 5.90L70.60 5.90L61-5.90C69.10-12.50 73.70-23.10 73.70-35.40C73.70-56.60 60-72.60 38.80-72.60C17.50-72.60 3.80-56.60 3.80-35.40C3.80-14.20 17.60 1.60 38.80 1.60ZM21.70-35.40C21.70-47.40 26.70-58.30 38.80-58.30C50.80-58.30 55.80-47.40 55.80-35.40C55.80-28.80 54.10-22.80 50.50-18.80L45.60-25L32.80-25L42.40-13.20C41.30-12.80 40.10-12.70 38.80-12.70C26.80-12.70 21.70-23.40 21.70-35.40ZM129.80 0L129.80-53L112.50-53L112.50-24.80C112.50-16.70 109.80-12.20 104.30-12.20C98.70-12.20 97.30-16.70 97.30-24.80L97.30-53L80.10-53L80.10-18.90C80.10-6.30 87.10 1.20 98.30 1.20C105.10 1.20 110.80-1.30 113.80-8.10L114.10 0ZM137.80-53L137.80 0L155.00 0L155.00-53ZM137.50-59.40L155.30-59.40L155.30-71L137.50-71ZM212.40-40.50L212.40-53L164.90-53L164.90-40.50L191.50-40.50L163.20-12.80L163.20 0L213.10 0L213.10-12.50L183.60-12.50ZM256-24.40L238.60-23.60C239.60-8.40 252 1.20 269.90 1.20C286 1.20 297.90-6.70 297.90-20.30C297.90-31.80 287.80-38.80 271.10-42.20C264-43.80 257.90-45.70 257.70-50.80C257.30-55.50 261.50-58.50 267.60-58.50C274.40-58.50 278.90-54.30 279.60-47.30L296.90-48.10C295.20-62.80 284.20-72.60 268.10-72.60C251.10-72.60 239.90-64.30 239.90-51.10C239.90-39.70 249.60-33.20 266.20-29.30C276.30-26.90 280.10-24.50 280.20-19.90C280.30-15.40 276.30-13 270.30-13C262.10-13 257.30-17.50 256-24.40ZM305.30-71L305.30-16.20C305.30-5.70 311.70 0 321.50 0L330.40 0L330.40-12.50L326.90-12.50C324.10-12.50 322.50-14.10 322.50-17L322.50-71ZM334.20-36.30L351.40-35.60C352.30-41 355.10-43.70 359.70-43.70C365.20-43.70 367.70-40.30 367.70-33L353.50-30.10C340.40-27.50 333.30-23.50 333.30-14C333.30-4.60 341.50 1.20 352.30 1.20C362.40 1.20 368.40-2.30 371.20-8C373.00 2.20 385.20 0.30 388.00 0.20L390.40 0L390.40-11.30L388.60-11.30C386.80-11.30 385.20-11.90 385.20-15.80L385.20-30.90C385.20-46.40 376.80-54.20 359.80-54.20C345.00-54.20 336.20-48 334.20-36.30ZM351.00-14.70C351.00-19.40 354.80-20.60 360.50-21.60L368.00-23L368.00-22.50C368.00-13.80 364.00-9.40 358.20-9.40C353.50-9.40 351.00-11.60 351.00-14.70ZM387.70-53L406.70-3.30L411.30-3.30L410.20-0.60C409.20 1.90 407.50 2.80 404.10 2.80L397.20 2.80L397.20 15L407.60 15C415.80 15 420.70 11.80 423.30 4.50L443.90-53L427.90-53L416.10-17.90L403.70-53ZM443.30-26.50C443.30-9.80 454.50 1.20 471.50 1.20C484.30 1.20 494.40-5.30 497.70-15.60L480.40-16.80C479.00-13.30 475.40-11 471.50-11C465.50-11 461.70-15.30 461.30-22.10L498.40-22.10L498.40-24.60C498.70-43.30 487.20-54.20 471.50-54.20C454.50-54.20 443.30-43.20 443.30-26.50ZM461.40-31.80C462.00-38.10 465.80-42 471.50-42C476.40-42 480.40-38.90 481.10-31.80ZM503.60-53L503.60 0L520.80 0L520.80-28.70C520.80-36.70 524.30-40.50 533.20-40.50L538.10-40.50L538.10-53L533.30-53C526.70-53 522.60-49.30 520.50-42.20L520.20-53Z'

type SvgBaseProps = Omit<SVGProps<SVGSVGElement>, 'children' | 'width' | 'height' | 'viewBox'>

function a11y(title: string | undefined) {
  return title
    ? ({ role: 'img', 'aria-label': title } as const)
    : ({ 'aria-hidden': true, focusable: 'false' } as const)
}

export interface LogoProps extends SvgBaseProps {
  /** Rendered width and height. Numbers are px. Default 32. */
  size?: number | string
  className?: string
  /** Accessible name. Pass an empty string when the logo is decorative. */
  title?: string
  /** 'auto' picks the small-size cut for numeric sizes ≤ 20. */
  variant?: 'auto' | 'full' | 'small'
}

export function Logo({ size = 32, className, title = 'Quiz Slayer', variant = 'auto', ...rest }: LogoProps) {
  const small = variant === 'small' || (variant === 'auto' && typeof size === 'number' && size <= 20)
  const [upper, lower] = small ? MARK_SMALL : MARK
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...a11y(title)}
      {...rest}
    >
      <path d={upper} />
      <path d={lower} />
    </svg>
  )
}

export interface LogoWordmarkProps extends SvgBaseProps {
  /** Rendered height. Width follows the 274:48 aspect ratio. Default 32. */
  size?: number | string
  className?: string
  /** Extra classes for the mark only, e.g. `text-[#F5B73A]` to tint it separately from the text. */
  markClassName?: string
  title?: string
}

export function LogoWordmark({ size = 32, className, markClassName, title = 'Quiz Slayer', ...rest }: LogoWordmarkProps) {
  const width = typeof size === 'number' ? (size * 274) / 48 : undefined
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 274 48"
      width={width}
      height={size}
      fill="currentColor"
      className={className}
      {...a11y(title)}
      {...rest}
    >
      <g transform="scale(2)" className={markClassName}>
        <path d={MARK[0]} />
        <path d={MARK[1]} />
      </g>
      <path transform="translate(53.5 38.2) scale(0.4)" d={WORDMARK_TEXT} />
    </svg>
  )
}
