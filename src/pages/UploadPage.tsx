import { useState } from 'react'
import { Page, PageHeader } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Icon3D } from '../components/ui/Icon3D'
import { CopyBlock } from '../components/upload/CopyBlock'
import { CustomSubjectList } from '../components/upload/CustomSubjectList'
import { DropZone } from '../components/upload/DropZone'
import { useNav } from '../hooks/useNav'
import { useSubjectData } from '../hooks/useSubjectData'
import { ROUTES } from '../lib/constants'
import { deleteCustomSubject, saveCustomSubject } from '../lib/db'
import { usePageMeta } from '../lib/seo'
import { parseSubjectFile, type ParsedPreview } from '../lib/subjectValidation'
import { AI_PROMPT, EXAMPLE_JSON, FIELD_GUIDE } from '../lib/uploadTemplates'

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function UploadPage() {
  usePageMeta({ title: 'Add a subject', description: 'Upload your own MCQ JSON or convert notes with AI.', path: ROUTES.UPLOAD })
  const nav = useNav()
  const { builtInSlugs, reloadCustom, subjects } = useSubjectData()
  const [parsed, setParsed] = useState<ParsedPreview | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [removeError, setRemoveError] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.name.endsWith('.json')) {
      setParseError('Please select a .json file')
      setParsed(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      try {
        const { preview, errors: found } = parseSubjectFile(text)
        setParsed(preview)
        setErrors(found)
        setParseError(null)
        setStatus('idle')
      } catch {
        setParseError('Invalid JSON — check the file syntax')
        setParsed(null)
        setErrors([])
      }
    }
    reader.readAsText(file)
  }

  async function handleLoad() {
    const valid = parsed?.valid
    if (!valid || errors.length > 0) return
    if (builtInSlugs.has(valid.slug)) {
      setErrors([`A built-in subject already uses the slug "${valid.slug}". Choose a different slug.`])
      return
    }
    setStatus('loading')
    try {
      await saveCustomSubject(valid)
      await reloadCustom()
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrors([`Failed to save: ${errorMessage(err)}`])
    }
  }

  async function handleRemove(slug: string) {
    setRemoveError(null)
    try {
      await deleteCustomSubject(slug)
      await reloadCustom()
    } catch (err) {
      setRemoveError(`Failed to remove subject: ${errorMessage(err)}`)
    }
  }

  const isReady = parsed !== null && errors.length === 0

  return (
    <Page width="narrow">
      <PageHeader title="Add a subject" subtitle="Upload a JSON file to add your own subject to the library." />

      <div className="space-y-4">
        <section className="card p-4 sm:p-5" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="mb-4 text-lg">Upload JSON</h2>
          <DropZone hasFile={parsed !== null} onFile={handleFile} />

          {parseError && (
            <p role="alert" className="mt-3 flex items-center gap-2 rounded-btn bg-danger/10 px-3 py-2.5 text-sm font-semibold text-danger">
              <Icon name="alert" size={16} /> {parseError}
            </p>
          )}

          {parsed && errors.length > 0 && (
            <div role="alert" className="mt-3 rounded-btn border border-danger/25 bg-danger/8 p-3.5">
              <p className="flex items-center gap-2 text-sm font-bold text-danger">
                <Icon name="alert" size={16} />
                {errors.length} issue{errors.length > 1 ? 's' : ''} found
              </p>
              <ul className="mt-2 max-h-60 space-y-1 overflow-y-auto text-sm text-danger" data-lenis-prevent>
                {errors.map((e, i) => <li key={i} className="flex gap-2"><span aria-hidden="true">·</span>{e}</li>)}
              </ul>
            </div>
          )}

          {parsed && errors.length === 0 && status !== 'success' && (
            <div className="mt-3 rounded-btn border border-success/25 bg-success/8 p-3.5 text-sm">
              <p className="flex items-center gap-2 font-bold text-success"><Icon name="check" size={16} strokeWidth={3} /> Valid — ready to load</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-muted">
                <div>Subject: <span className="font-semibold text-fg">{parsed.subject}</span></div>
                <div>Slug: <code className="font-mono text-accent-fg">{parsed.slug}</code></div>
                <div>Questions: <span className="font-semibold text-fg">{parsed.questionCount}</span></div>
                {parsed.guessCount > 0 && <div>AI practice: <span className="font-semibold text-fg">{parsed.guessCount}</span></div>}
              </dl>
            </div>
          )}

          {status === 'success' ? (
            <div className="mt-4 flex animate-pop flex-col items-center rounded-card border border-success/30 bg-success/8 p-5 text-center" role="status">
              <Icon3D name="gift" size={72} eager />
              <p className="mt-2 font-bold text-success">Subject added</p>
              <p className="mt-0.5 text-sm text-muted">“{parsed?.subject}” is now in your library.</p>
              <Button className="mt-4 w-full" onClick={() => nav(ROUTES.HOME)}>See it on Home</Button>
            </div>
          ) : (
            <Button size="lg" className="mt-4 w-full" onClick={() => void handleLoad()} disabled={!isReady || status === 'loading'}>
              {status === 'loading' ? 'Saving…' : 'Load subject into library'}
            </Button>
          )}
        </section>

        <CustomSubjectList subjects={subjects.filter((s) => s.isCustom)} onRemove={handleRemove} error={removeError} />

        <CopyBlock title="Required format" filename="subject.json" code={EXAMPLE_JSON} copyLabel="Copy">
          <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FIELD_GUIDE.map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-2 text-sm">
                <dt><code className="rounded-md bg-accent/12 px-1.5 py-0.5 font-mono text-xs text-accent-fg">{label}</code></dt>
                <dd className="text-muted">{desc}</dd>
              </div>
            ))}
          </dl>
        </CopyBlock>

        <CopyBlock
          title="Convert any document with AI"
          description="Paste this prompt into ChatGPT, Claude or Gemini with your lecture notes, slides or textbook chapter. It returns a ready-to-upload JSON file."
          filename="ai-prompt.txt"
          code={AI_PROMPT}
          copyLabel="Copy prompt"
        />
      </div>
    </Page>
  )
}
