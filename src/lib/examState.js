// ─── Exam Subject Config ─────────────────────────────────────────────────────

export const EXAM_SUBJECTS = [
  {
    slug: 'compiler-construction',
    label: 'Compiler Construction',
    shortLabel: 'CC',
    iconKey: 'code',
    color: 'violet',
    unlockUtc: '2026-03-14T04:00:00Z', // 09:00 AM PKT 14 March
    quizSlugs: [],
    poolType: 'main',
    examName: 'Compiler Construction Exam',
    description: '30 MCQs drawn from the full question bank',
  },
  {
    slug: 'information-security-cryptography',
    label: 'Information Security & Cryptography',
    shortLabel: 'ISC',
    iconKey: 'brain',
    color: 'rose',
    unlockUtc: '2026-03-15T04:00:00Z', // 09:00 AM PKT 15 March
    quizSlugs: [],
    poolType: 'main',
    examName: 'ISC Exam',
    description: '30 MCQs drawn from the full question bank',
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

export const EXAM_STATE_KEY_PREFIX = 'exam-state-'
export const EXAM_MODE_SESSION_KEY = 'exam-mode'
export const EXAM_PASS_THRESHOLD = 50 // percent

// ─── Default State ────────────────────────────────────────────────────────────

function defaultExamState() {
  return {
    correctIds: [],
    incorrectIds: [],
    quizCorrectIds: [],
    quizIncorrectIds: [],
    attempts: [],
  }
}

// ─── State Read / Write ───────────────────────────────────────────────────────

export function getExamState(subjectSlug) {
  try {
    const raw = localStorage.getItem(EXAM_STATE_KEY_PREFIX + subjectSlug)
    return raw ? JSON.parse(raw) : defaultExamState()
  } catch {
    return defaultExamState()
  }
}

/**
 * Saves exam result into persistent state.
 * @param {string} subjectSlug
 * @param {{ correctIds: number[], incorrectIds: number[], quizCorrectIds: number[], quizIncorrectIds: number[], attempt: object }} updates
 */
export function saveExamState(subjectSlug, updates) {
  try {
    const existing = getExamState(subjectSlug)

    // correctIds is cumulative (Set union — never remove a mastered question)
    const correctIdSet = new Set([...existing.correctIds, ...updates.correctIds])

    // quizCorrectIds is also cumulative
    const quizCorrectIdSet = new Set([...existing.quizCorrectIds, ...(updates.quizCorrectIds ?? [])])

    // incorrectIds is overwritten each attempt (these are what repeats next time)
    const incorrectIds = updates.incorrectIds ?? []

    // quizIncorrectIds overwritten too
    const quizIncorrectIds = updates.quizIncorrectIds ?? []

    const newState = {
      correctIds: [...correctIdSet],
      incorrectIds,
      quizCorrectIds: [...quizCorrectIdSet],
      quizIncorrectIds,
      attempts: updates.attempt
        ? [...existing.attempts, updates.attempt]
        : existing.attempts,
    }

    localStorage.setItem(EXAM_STATE_KEY_PREFIX + subjectSlug, JSON.stringify(newState))
  } catch {
    // localStorage full — silently fail, same pattern as QuizContext
  }
}

export function clearExamState(subjectSlug) {
  try {
    localStorage.removeItem(EXAM_STATE_KEY_PREFIX + subjectSlug)
  } catch { /* ignore */ }
}

// ─── Unlock Status ────────────────────────────────────────────────────────────

/**
 * @param {string} unlockUtcString - ISO UTC date string
 * @returns {{ isUnlocked: boolean, secondsRemaining: number }}
 */
export function getUnlockStatus(unlockUtcString) {
  const unlockTime = new Date(unlockUtcString).getTime()
  const now = Date.now()
  if (now >= unlockTime) return { isUnlocked: true, secondsRemaining: 0 }
  return { isUnlocked: false, secondsRemaining: Math.ceil((unlockTime - now) / 1000) }
}

/**
 * Smart time-left label:
 *  ≥ 2 days  → "2 days left"
 *  1 day     → "1 day left"
 *  ≥ 2 hours → "5 hours left"
 *  1 hour    → "1 hour left"
 *  < 1 hour  → live HH:MM:SS (no T- prefix)
 */
export function formatTimeLeft(totalSeconds) {
  if (totalSeconds <= 0) return null
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (days >= 2) return `${days} days left`
  if (days === 1) return '1 day left'
  if (hours >= 2) return `${hours} hours left`
  if (hours === 1) return '1 hour left'
  // Under 1 hour — live countdown without T- prefix
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/** @deprecated Use formatTimeLeft instead */
export function formatCountdown(totalSeconds) {
  return formatTimeLeft(totalSeconds)
}

// ─── Shuffle (local copy to keep this file self-contained) ────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Question Selection ───────────────────────────────────────────────────────

/**
 * Selects the exam question pool based on subject config, subject data, quiz data map, and prior exam state.
 *
 * @param {object} config - One of EXAM_SUBJECTS entries
 * @param {object} subjectData - Subject from useSubjectData (has .questions, .guessQuestions)
 * @param {object} quizDataMap - Map of { [quizSlug]: quizData } for quiz files (PDC only)
 * @param {object} examState - Current exam state from getExamState()
 * @returns {object[]} - Array of selected question objects (max 30)
 */
export function selectExamQuestions(config, subjectData, quizDataMap, examState) {
  const isInitial = examState.attempts.length === 0

  // ── Freelancing: questions + guessQuestions ──────────────────────────────
  if (config.poolType === 'combined') {
    const fullPool = [
      ...(subjectData.questions ?? []),
      ...(subjectData.guessQuestions ?? []),
    ]
    if (isInitial) {
      return shuffle(fullPool).slice(0, 30)
    }
    const remaining = fullPool.filter((q) => !examState.correctIds.includes(q.id))
    if (remaining.length === 0) return [] // all mastered
    return shuffle(remaining).slice(0, Math.min(30, remaining.length))
  }

  // ── PDC: quiz files + main subject ──────────────────────────────────────
  if (config.poolType === 'main+quiz') {
    const quiz1Data = quizDataMap[config.quizSlugs[0]]
    const quiz2Data = quizDataMap[config.quizSlugs[1]]
    const quiz1Questions = quiz1Data?.questions ?? []
    const quiz2Questions = quiz2Data?.questions ?? []
    const allQuizQuestions = [...quiz1Questions, ...quiz2Questions]
    const mainQuestions = subjectData.questions ?? []

    if (isInitial) {
      const from1 = shuffle(quiz1Questions).slice(0, 5)
      const from2 = shuffle(quiz2Questions).slice(0, 5)
      const fromMain = shuffle(mainQuestions).slice(0, 20)
      return [...from1, ...from2, ...fromMain]
    }

    // Retest
    const remainingQuiz = allQuizQuestions.filter(
      (q) => !examState.quizCorrectIds.includes(q.id)
    )

    if (remainingQuiz.length === 0) {
      // All quiz questions mastered — take entirely from main
      const remaining = mainQuestions.filter((q) => !examState.correctIds.includes(q.id))
      if (remaining.length === 0) return []
      return shuffle(remaining).slice(0, Math.min(30, remaining.length))
    }

    const fromQuiz = shuffle(remainingQuiz).slice(0, Math.min(10, remainingQuiz.length))
    const remainingMain = mainQuestions.filter((q) => !examState.correctIds.includes(q.id))
    const fillCount = Math.max(0, 30 - fromQuiz.length)
    const fromMain = shuffle(remainingMain).slice(0, Math.min(fillCount, remainingMain.length))
    return [...fromQuiz, ...fromMain]
  }

  // ── CC / ISC (and fallback): main questions only ─────────────────────────
  const mainQuestions = subjectData.questions ?? []
  if (isInitial) {
    return shuffle(mainQuestions).slice(0, Math.min(30, mainQuestions.length))
  }
  const remaining = mainQuestions.filter((q) => !examState.correctIds.includes(q.id))
  if (remaining.length === 0) return []
  return shuffle(remaining).slice(0, Math.min(30, remaining.length))
}

/**
 * Returns the total pool size for a subject (used for progress bar).
 * @param {object} config
 * @param {object} subjectData
 * @param {object} quizDataMap
 */
export function getTotalPoolSize(config, subjectData, quizDataMap) {
  if (config.poolType === 'combined') {
    return (subjectData.questions?.length ?? 0) + (subjectData.guessQuestions?.length ?? 0)
  }
  if (config.poolType === 'main+quiz') {
    const q1 = quizDataMap[config.quizSlugs[0]]?.questions?.length ?? 0
    const q2 = quizDataMap[config.quizSlugs[1]]?.questions?.length ?? 0
    return q1 + q2 + (subjectData.questions?.length ?? 0)
  }
  return subjectData.questions?.length ?? 0
}

/**
 * Get the best score from attempt history.
 * @param {object[]} attempts
 * @returns {number|null}
 */
export function getBestScore(attempts) {
  if (!attempts.length) return null
  return Math.max(...attempts.map((a) => a.score))
}
