import { isRecord, type Question, type SubjectData } from '../types'

export interface ValidationResult {
  errors: string[]
  /** Present only when there are no errors */
  data: SubjectData | null
}

/** Loose preview info shown even when validation fails. */
export interface ParsedPreview {
  subject: string
  slug: string
  questionCount: number
  guessCount: number
  valid: SubjectData | null
}

function nonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/** Validates one question; `label(n)` renders the error prefix. Returns errors. */
function validateQuestion(
  q: unknown,
  n: number,
  label: (n: number) => string,
  correctIndexMsg: (optionCount: number) => string,
): string[] {
  const errors: string[] = []
  const rec = isRecord(q) ? q : {}
  const options = Array.isArray(rec.options) ? rec.options : null
  const optionCount = options?.length ?? 0

  if (!nonEmptyString(rec.text)) errors.push(`${label(n)}: "text" must be a string`)
  if (!options || (optionCount !== 4 && optionCount !== 5)) {
    errors.push(`${label(n)}: "options" must have 4 or 5 items`)
  }
  if (typeof rec.correctIndex !== 'number' || rec.correctIndex < 0 || rec.correctIndex >= optionCount) {
    errors.push(`${label(n)}: ${correctIndexMsg(optionCount)}`)
  }
  if (!nonEmptyString(rec.shortExplanation)) {
    errors.push(`${label(n)}: "shortExplanation" must be a non-empty string`)
  }
  if (!nonEmptyString(rec.explanation)) {
    errors.push(`${label(n)}: "explanation" must be a non-empty string`)
  }
  return errors
}

export function validateSubject(raw: unknown): ValidationResult {
  const errors: string[] = []
  const data = isRecord(raw) ? raw : {}

  if (!nonEmptyString(data.subject)) {
    errors.push('"subject" must be a non-empty string')
  }
  if (typeof data.slug !== 'string' || !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('"slug" must contain only lowercase letters, numbers, and hyphens (e.g. "my-subject")')
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('"questions" must be a non-empty array')
  } else {
    data.questions.forEach((q, i) => {
      errors.push(...validateQuestion(q, i + 1, (n) => `Question ${n}`, (count) => `"correctIndex" must be 0–${Math.max(count, 1) - 1}`))
    })
  }

  if (data.guess_questions) {
    if (!Array.isArray(data.guess_questions)) {
      errors.push('"guess_questions" must be an array if provided')
    } else {
      data.guess_questions.forEach((q, i) => {
        errors.push(...validateQuestion(q, i + 1, (n) => `guess_questions[${n}]`, () => 'invalid "correctIndex"'))
      })
    }
  }

  if (errors.length > 0) return { errors, data: null }

  // Validated above — safe to treat as the typed shape
  return {
    errors,
    data: {
      subject: data.subject as string,
      slug: data.slug as string,
      description: typeof data.description === 'string' ? data.description : '',
      questions: data.questions as Question[],
      guess_questions: Array.isArray(data.guess_questions) ? (data.guess_questions as Question[]) : [],
    },
  }
}

/** Parses file text into a preview + validation errors (throws on invalid JSON). */
export function parseSubjectFile(text: string): { preview: ParsedPreview; errors: string[] } {
  const raw: unknown = JSON.parse(text)
  const { errors, data } = validateSubject(raw)
  const rec = isRecord(raw) ? raw : {}
  return {
    errors,
    preview: {
      subject: typeof rec.subject === 'string' ? rec.subject : '',
      slug: typeof rec.slug === 'string' ? rec.slug : '',
      questionCount: Array.isArray(rec.questions) ? rec.questions.length : 0,
      guessCount: Array.isArray(rec.guess_questions) ? rec.guess_questions.length : 0,
      valid: data,
    },
  }
}
