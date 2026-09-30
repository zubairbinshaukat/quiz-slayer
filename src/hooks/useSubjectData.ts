import { useMemo, useState, useEffect, useCallback } from 'react'
import { getAllCustomSubjects } from '../lib/db'
import { isGuessSubject } from '../lib/guessWarning'
import { isRecord, type CustomSubjectRecord, type Question, type Subject } from '../types'

const modules = import.meta.glob<unknown>('../data/*.json', { eager: true })
const quizModules = import.meta.glob<unknown>('../data/quiz/*.json', { eager: true })

function isQuestion(value: unknown): value is Question {
  return (
    isRecord(value) &&
    (typeof value.id === 'number' || typeof value.id === 'string') &&
    typeof value.text === 'string' &&
    Array.isArray(value.options) &&
    value.options.every((o) => typeof o === 'string') &&
    typeof value.correctIndex === 'number'
  )
}

function questionList(value: unknown): Question[] {
  return Array.isArray(value) ? value.filter(isQuestion) : []
}

/** Unwrap a JSON module (`default` export) and normalise into a Subject. */
function processRaw(raw: unknown, isCustom = false, sourcePath = ''): Subject | null {
  const data = isRecord(raw) && 'default' in raw && isRecord(raw.default) ? raw.default : raw
  if (!isRecord(data) || typeof data.subject !== 'string' || typeof data.slug !== 'string') {
    return null
  }
  const questions = questionList(data.questions)
  return {
    subject: data.subject,
    slug: data.slug,
    description: typeof data.description === 'string' ? data.description : '',
    questionCount: questions.length,
    questions,
    guessQuestions: questionList(data.guess_questions),
    isGuess: isGuessSubject(data.slug, sourcePath),
    isCustom,
  }
}

function fromModules(mods: Record<string, unknown>): Subject[] {
  return Object.entries(mods)
    .map(([path, mod]) => processRaw(mod, false, path))
    .filter((s): s is Subject => s !== null)
    .sort((a, b) => a.subject.localeCompare(b.subject))
}

// Static bundled data never changes at runtime — compute once.
const FILE_SUBJECTS = fromModules(modules)
const QUIZZES = fromModules(quizModules)

export function useSubjectData() {
  const [customSubjects, setCustomSubjects] = useState<CustomSubjectRecord[]>([])

  const loadCustom = useCallback(async () => {
    const entries = await getAllCustomSubjects()
    setCustomSubjects(entries)
  }, [])

  // Initial load (state is only set asynchronously, after IndexedDB resolves)
  useEffect(() => {
    let cancelled = false
    void getAllCustomSubjects().then((entries) => {
      if (!cancelled) setCustomSubjects(entries)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const fileSubjects = FILE_SUBJECTS
  const quizzes = QUIZZES

  // Slugs present in built-in files (custom subjects with same slug are skipped)
  const builtInSlugs = useMemo(() => new Set(fileSubjects.map((s) => s.slug)), [fileSubjects])

  const subjects = useMemo(() => {
    const custom = customSubjects
      .filter((s) => !builtInSlugs.has(s.slug))
      .map((s) => processRaw(s, true))
      .filter((s): s is Subject => s !== null)
    return [...fileSubjects, ...custom].sort((a, b) => a.subject.localeCompare(b.subject))
  }, [fileSubjects, customSubjects, builtInSlugs])

  const getSubjectBySlug = useCallback(
    (slug: string | undefined): Subject | null => {
      if (!slug) return null
      return subjects.find((s) => s.slug === slug) ?? quizzes.find((q) => q.slug === slug) ?? null
    },
    [subjects, quizzes],
  )

  return { subjects, quizzes, getSubjectBySlug, builtInSlugs, reloadCustom: loadCustom }
}
