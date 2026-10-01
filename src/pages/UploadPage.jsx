import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteCustomSubject, saveCustomSubject } from '../lib/db'
import { useSubjectData } from '../hooks/useSubjectData'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/Button'

// ─── JSON syntax guide ──────────────────────────────────────────────────────
const EXAMPLE_JSON = `{
  "subject": "Machine Learning",
  "slug": "machine-learning",
  "description": "Supervised, unsupervised learning, and neural networks.",
  "questions": [
    {
      "id": 1,
      "text": "What is supervised learning?",
      "options": [
        "Learning without labeled data",
        "Learning from labeled input-output pairs",
        "Reinforcement from an environment",
        "Clustering similar data points"
      ],
      "correctIndex": 1,
      "shortExplanation": "Supervised learning trains on labeled input-output pairs.",
      "explanation": "Supervised learning uses labeled training data where each input has a known output, allowing the model to learn the mapping function."
    }
  ],
  "guess_questions": [
    {
      "id": 1,
      "text": "Which algorithm is commonly used for classification?",
      "options": ["K-Means", "Decision Tree", "PCA", "DBSCAN"],
      "correctIndex": 1,
      "shortExplanation": "Decision Trees are widely used for classification tasks.",
      "explanation": "Decision Trees split data based on feature thresholds to classify inputs, making them one of the most widely used classification algorithms."
    }
  ]
}`

const AI_PROMPT = `Convert the following content into a quiz JSON file. Follow this EXACT format and rules:

{
  "subject": "Subject Name Here",
  "slug": "subject-name-here",
  "description": "A brief one-line description",
  "questions": [
    {
      "id": 1,
      "text": "Question text ending with ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "shortExplanation": "One short sentence explaining the correct answer",
      "explanation": "2-4 sentences explaining why the correct answer is right"
    }
  ]
}

RULES:
- slug: lowercase letters, numbers, hyphens ONLY (e.g. "machine-learning", "data-structures")
- Each question needs EXACTLY 4 options
- Each question needs 4 or 5 options
- correctIndex is 0-indexed: 0 = first option, 1 = second, 2 = third, 3 = fourth
- Each question must have a "shortExplanation" field (1 concise sentence)
- Each question must have an "explanation" field (2-4 sentences explaining why the correct answer is right)
- Generate at least 15 questions that test deep understanding, not just memorization
- Questions should be clear, unambiguous, and exam-style
- You may add a "guess_questions" array with 20+ additional practice questions in the same format

[PASTE YOUR DOCUMENT / LECTURE NOTES / TEXTBOOK CONTENT HERE]`

// ─── Validator ─────────────────────────────────────────────────────────────
function validateSubject(data) {
  const errors = []

  if (!data.subject || typeof data.subject !== 'string' || !data.subject.trim()) {
    errors.push('"subject" must be a non-empty string')
  }
  if (!data.slug || typeof data.slug !== 'string' || !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('"slug" must contain only lowercase letters, numbers, and hyphens (e.g. "my-subject")')
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('"questions" must be a non-empty array')
  } else {
    data.questions.forEach((q, i) => {
      const n = i + 1
      if (!q.text || typeof q.text !== 'string') errors.push(`Question ${n}: "text" must be a string`)
      const optionCount = q.options?.length ?? 0
      if (!Array.isArray(q.options) || (optionCount !== 4 && optionCount !== 5)) {
        errors.push(`Question ${n}: "options" must have 4 or 5 items`)
      }
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= (q.options?.length ?? 0)) {
        errors.push(`Question ${n}: "correctIndex" must be 0–${(q.options?.length ?? 1) - 1}`)
      }
      if (!q.shortExplanation || typeof q.shortExplanation !== 'string') {
        errors.push(`Question ${n}: "shortExplanation" must be a non-empty string`)
      }
      if (!q.explanation || typeof q.explanation !== 'string') {
        errors.push(`Question ${n}: "explanation" must be a non-empty string`)
      }
    })
  }

  if (data.guess_questions) {
    if (!Array.isArray(data.guess_questions)) {
      errors.push('"guess_questions" must be an array if provided')
    } else {
      data.guess_questions.forEach((q, i) => {
        const n = i + 1
        if (!q.text || typeof q.text !== 'string') errors.push(`guess_questions[${n}]: "text" must be a string`)
        const optionCount = q.options?.length ?? 0
        if (!Array.isArray(q.options) || (optionCount !== 4 && optionCount !== 5)) {
          errors.push(`guess_questions[${n}]: "options" must have 4 or 5 items`)
        }
        if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= (q.options?.length ?? 0)) {
          errors.push(`guess_questions[${n}]: invalid "correctIndex"`)
        }
        if (!q.shortExplanation || typeof q.shortExplanation !== 'string') {
          errors.push(`guess_questions[${n}]: "shortExplanation" must be a non-empty string`)
        }
        if (!q.explanation || typeof q.explanation !== 'string') {
          errors.push(`guess_questions[${n}]: "explanation" must be a non-empty string`)
        }
      })
    }
  }

  return errors
}

// ─── Component ─────────────────────────────────────────────────────────────
export function UploadPage() {
  const navigate = useNavigate()
  const { builtInSlugs, reloadCustom, subjects } = useSubjectData()
  const fileRef = useRef(null)

  const [fileContent, setFileContent] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [dragOver, setDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedExample, setCopiedExample] = useState(false)
  const [removingSlug, setRemovingSlug] = useState(null)
  const [confirmRemoveSlug, setConfirmRemoveSlug] = useState(null)
  const [removeError, setRemoveError] = useState(null)

  const customSubjects = subjects.filter((s) => s.isCustom)

  function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.json')) {
      setParseError('Please select a .json file')
      setParsed(null)
      setFileContent(null)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      setFileContent(text)
      try {
        const data = JSON.parse(text)
        const errors = validateSubject(data)
        setParsed(data)
        setValidationErrors(errors)
        setParseError(null)
        setStatus('idle')
      } catch {
        setParseError('Invalid JSON — check the file syntax')
        setParsed(null)
        setValidationErrors([])
      }
    }
    reader.readAsText(file)
  }

  async function handleLoad() {
    if (!parsed || validationErrors.length > 0) return

    // Check slug conflict with built-in subjects
    if (builtInSlugs.has(parsed.slug)) {
      setValidationErrors([`A built-in subject already uses the slug "${parsed.slug}". Choose a different slug.`])
      return
    }

    setStatus('loading')
    try {
      await saveCustomSubject({
        subject: parsed.subject,
        slug: parsed.slug,
        description: parsed.description ?? '',
        questions: parsed.questions,
        guess_questions: parsed.guess_questions ?? [],
      })
      await reloadCustom()
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setValidationErrors([`Failed to save: ${err.message}`])
    }
  }

  function copyText(text, setter) {
    navigator.clipboard.writeText(text).then(() => {
      setter(true)
      setTimeout(() => setter(false), 2000)
    })
  }

  async function handleRemoveSubject(slug) {
    setRemovingSlug(slug)
    setRemoveError(null)

    try {
      await deleteCustomSubject(slug)
      await reloadCustom()
      setConfirmRemoveSlug(null)
    } catch (err) {
      setRemoveError(`Failed to remove subject: ${err.message}`)
    } finally {
      setRemovingSlug(null)
    }
  }

  const isReady = parsed && validationErrors.length === 0

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-themed-accent transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
        <h1 className="text-2xl font-black text-content-primary">Add Your Own Subject</h1>
        <p className="text-sm text-content-secondary mt-1">Upload a JSON file to add a custom subject to your quiz library.</p>
      </motion.div>

      <div className="space-y-5">

        {/* ── JSON Format Guide ───────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-content-primary text-base flex items-center gap-2">
              <svg className="w-4 h-4 text-themed-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Required JSON Format
            </h2>
            <button
              onClick={() => copyText(EXAMPLE_JSON, setCopiedExample)}
              className="flex items-center gap-1.5 text-xs font-semibold text-themed-accent hover:text-themed-accent-hover transition-colors px-2.5 py-1.5 rounded-lg bg-themed-accent/8 hover:bg-themed-accent/15"
            >
              {copiedExample ? (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied!</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>Copy</>
              )}
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-themed-border">
            <div className="bg-surface-secondary px-4 py-2 border-b border-themed-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs text-content-secondary font-mono">subject.json</span>
            </div>
            <pre className="text-xs font-mono p-4 overflow-x-auto leading-relaxed text-content-primary bg-surface-card">
              <code>{EXAMPLE_JSON}</code>
            </pre>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'subject', desc: 'Display name of the subject' },
              { label: 'slug', desc: 'URL-safe ID: lowercase + hyphens' },
              { label: 'questions', desc: 'Array of professor questions' },
              { label: 'guess_questions', desc: 'Optional AI practice questions' },
              { label: 'correctIndex', desc: '0-indexed position of correct option' },
              { label: 'options', desc: 'Array of 4 or 5 answer choices' },
              { label: 'shortExplanation', desc: '1-sentence summary of the correct answer' },
              { label: 'explanation', desc: '2-4 sentence detailed explanation' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-2">
                <code className="text-xs font-mono bg-themed-accent/10 text-themed-accent px-1.5 py-0.5 rounded flex-shrink-0">{label}</code>
                <span className="text-xs text-content-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upload ──────────────────────────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-black text-content-primary text-base mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-themed-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload JSON File
          </h2>

          {/* Drop zone */}
          <div
            className={cn(
              'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
              dragOver
                ? 'border-themed-accent bg-themed-accent/8 scale-[1.01]'
                : 'border-themed-border hover:border-themed-accent/60 hover:bg-surface-secondary'
            )}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          >
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <div className="flex flex-col items-center gap-3">
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center transition-colors', dragOver ? 'bg-themed-accent/20' : 'bg-surface-secondary')}>
                <svg className={cn('w-6 h-6 transition-colors', dragOver ? 'text-themed-accent' : 'text-content-secondary')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-content-primary">
                  {fileContent ? 'Replace file' : 'Drop your JSON file here'}
                </p>
                <p className="text-xs text-content-secondary mt-0.5">or click to browse · .json files only</p>
              </div>
            </div>
          </div>

          {/* Parse error */}
          <AnimatePresence>
            {parseError && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300 font-semibold"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {parseError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Parsed preview */}
          <AnimatePresence>
            {parsed && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                {/* Validation errors */}
                {validationErrors.length > 0 ? (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                    <p className="text-sm font-black text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {validationErrors.length} issue{validationErrors.length > 1 ? 's' : ''} found
                    </p>
                    <ul className="space-y-1">
                      {validationErrors.map((e, i) => (
                        <li key={i} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                          <span className="mt-0.5 flex-shrink-0">·</span>{e}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Valid — ready to load
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-content-secondary">Subject: <span className="font-bold text-content-primary">{parsed.subject}</span></div>
                      <div className="text-content-secondary">Slug: <code className="font-mono text-themed-accent">{parsed.slug}</code></div>
                      <div className="text-content-secondary">Questions: <span className="font-bold text-content-primary">{parsed.questions?.length ?? 0}</span></div>
                      {(parsed.guess_questions?.length ?? 0) > 0 && (
                        <div className="text-content-secondary">AI Practice: <span className="font-bold text-content-primary">{parsed.guess_questions.length}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center"
              >
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-black text-emerald-700 dark:text-emerald-300 text-base">Subject added!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">"{parsed?.subject}" is now in your quiz library.</p>
                <Button className="mt-4 w-full" onClick={() => navigate('/')}>
                  View on Home →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load button */}
          {status !== 'success' && (
            <Button
              className="w-full mt-4"
              onClick={handleLoad}
              disabled={!isReady || status === 'loading'}
            >
              {status === 'loading' ? 'Saving…' : 'Load Subject into Library'}
            </Button>
          )}
        </div>

        {/* ── Manage Custom Subjects ──────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-black text-content-primary text-base mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7L5 7M10 11v6m4-6v6M9 7l1-2h4l1 2m-8 0l1 12a2 2 0 002 2h4a2 2 0 002-2l1-12" />
            </svg>
            Remove Added Subjects
          </h2>

          {removeError && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              {removeError}
            </div>
          )}

          {customSubjects.length === 0 ? (
            <p className="text-sm text-content-secondary">No custom subjects added yet.</p>
          ) : (
            <div className="space-y-3">
              {customSubjects.map((s) => (
                <div
                  key={s.slug}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border border-themed-border bg-surface-card"
                >
                  <div>
                    <p className="text-sm font-bold text-content-primary">{s.subject}</p>
                    <p className="text-xs text-content-secondary">
                      {s.questionCount} question{s.questionCount !== 1 ? 's' : ''}
                      {(s.guessQuestions?.length ?? 0) > 0 ? ` · ${s.guessQuestions.length} AI practice` : ''}
                    </p>
                    <p className="text-[11px] text-content-secondary mt-0.5">slug: {s.slug}</p>
                  </div>

                  {confirmRemoveSlug === s.slug ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-content-secondary">Confirm?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveSubject(s.slug)}
                        disabled={removingSlug === s.slug}
                      >
                        {removingSlug === s.slug ? 'Removing…' : 'Yes, Remove'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmRemoveSlug(null)}
                        disabled={removingSlug === s.slug}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmRemoveSlug(s.slug)}
                      disabled={!!removingSlug}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── AI Prompt ──────────────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-content-primary text-base flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Convert Any Document with AI
            </h2>
            <button
              onClick={() => copyText(AI_PROMPT, setCopied)}
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20"
            >
              {copied ? (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied!</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>Copy Prompt</>
              )}
            </button>
          </div>

          <p className="text-sm text-content-secondary mb-4 leading-relaxed">
            Copy this prompt and paste it into <span className="font-bold text-content-primary">ChatGPT, Claude, or Gemini</span> along with your lecture notes, slides, or textbook content. The AI will generate a ready-to-upload JSON file.
          </p>

          <div className="relative rounded-xl overflow-hidden border border-violet-200 dark:border-violet-800">
            <div className="bg-violet-50 dark:bg-violet-950/40 px-4 py-2 border-b border-violet-200 dark:border-violet-800 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">AI Conversion Prompt</span>
            </div>
            <pre className="text-xs font-mono p-4 overflow-x-auto leading-relaxed text-content-secondary bg-surface-card whitespace-pre-wrap">
              <code>{AI_PROMPT}</code>
            </pre>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '📄', label: 'Lecture Notes', desc: 'PDF or text notes' },
              { icon: '📊', label: 'Slide Decks', desc: 'Copy-paste slide content' },
              { icon: '📚', label: 'Textbooks', desc: 'Chapter summaries' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary border border-themed-border">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-xs font-bold text-content-primary">{label}</p>
                  <p className="text-xs text-content-secondary">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
