import { useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { Icon3D } from '../ui/Icon3D'

interface DropZoneProps {
  hasFile: boolean
  onFile: (file: File | undefined) => void
}

/** Tap-to-browse / drag-and-drop target for a subject .json file. */
export function DropZone({ hasFile, onFile }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={hasFile ? 'Replace JSON file' : 'Choose a JSON file to upload'}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        onFile(e.dataTransfer.files[0])
      }}
      className={cn(
        'press flex min-h-44 flex-col items-center justify-center gap-3 rounded-card border border-dashed p-6 text-center',
        dragOver ? 'border-accent bg-accent/8' : 'border-line-strong hover:border-accent/60 hover:bg-surface-2',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <Icon3D name="file-text" size={56} />
      <div>
        <p className="font-semibold">{hasFile ? 'Replace file' : 'Drop your JSON file here'}</p>
        <p className="mt-0.5 text-sm text-muted">or tap to browse · .json only</p>
      </div>
    </div>
  )
}
