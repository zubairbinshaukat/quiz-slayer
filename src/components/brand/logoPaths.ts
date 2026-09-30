/** Full sliced-S mark on a 24-unit grid, used above ~20px (and for the preloader stroke-draw). */
export const MARK = [
  'M20.5 2.5H8.5A6 6 0 0 0 8.5 14.5L12.5 10.5H8.5A2 2 0 0 1 8.5 6.5H16.5Z',
  'M3.5 21.5H15.5A6 6 0 0 0 15.5 9.5L11.5 13.5H15.5A2 2 0 0 1 15.5 17.5H7.5Z',
] as const

/** Small-size mark (≤20px): no slip, wider blade gap so the cut survives at 16px. */
export const MARK_SMALL = [
  'M20 2H9A6 6 0 0 0 8.07 13.93L12 10H9A2 2 0 0 1 9 6H16Z',
  'M4 22H15A6 6 0 0 0 15.93 10.07L12 14H15A2 2 0 0 1 15 18H8Z',
] as const
