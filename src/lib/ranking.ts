export const MIN_ANSWERED_FOR_BOARD = 20

/** Negative-marking points: correct - wrong / (optionsCount - 1), 2 dp. */
export function computePoints(correct: number, wrong: number, optionsCount: number): number {
  const penaltyDivisor = Math.max(optionsCount - 1, 1)
  return Math.round((correct - wrong / penaltyDivisor) * 100) / 100
}

/** Accuracy as a 0-100 number with 1 decimal place. */
export function accuracy(correct: number, answered: number): number {
  if (answered <= 0) return 0
  return Math.round((correct / answered) * 1000) / 10
}

export function formatPoints(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, '')
}