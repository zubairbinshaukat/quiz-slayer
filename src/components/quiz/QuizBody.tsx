import type { ReactNode } from 'react'
import { KeyboardHints } from './KeyboardHints'
import { QuestionPalette } from './QuestionPalette'
import type { QuestionStatus } from './QuizProgress'

interface QuizBodyProps {
  statuses: QuestionStatus[]
  current: number
  onJump: (index: number) => void
  onHelp: () => void
  /** The question card */
  children: ReactNode
}

/** 720px question column + (desktop) 280px rail with the palette grid and keyboard hints. */
export function QuizBody({ statuses, current, onJump, onHelp, children }: QuizBodyProps) {
  const many = statuses.length > 1
  return (
    <main
      id="main"
      className="mx-auto w-full max-w-[1088px] px-4 pt-5 pb-[calc(112px+env(safe-area-inset-bottom))] md:pt-8 md:pb-16 lg:grid lg:grid-cols-[minmax(0,720px)_280px] lg:items-start lg:gap-10 lg:px-6"
    >
      <div className="mx-auto w-full max-w-[720px] min-w-0">
        {children}
        {many && <QuestionPalette statuses={statuses} current={current} onJump={onJump} className="lg:hidden" />}
      </div>

      <aside className="sticky top-32 hidden space-y-4 lg:block" aria-label="Quiz tools">
        {many && <QuestionPalette layout="grid" statuses={statuses} current={current} onJump={onJump} />}
        <KeyboardHints onHelp={onHelp} />
      </aside>
    </main>
  )
}
