import { useNavigate, useLocation } from 'react-router-dom'

function ExamIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function ExamFAB() {
  const location = useLocation()
  const navigate = useNavigate()

  const hidden =
    location.pathname === '/exam' ||
    location.pathname === '/exam/result' ||
    location.pathname.startsWith('/exam/')

  if (hidden) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 group animate-pop">
      {/* Pulse ring */}
      <div
        className="absolute inset-0 rounded-full animate-pulse-ring"
        style={{ background: 'rgb(var(--accent))' }}
      />

      {/* Button + Tooltip wrapper */}
      <div className="relative">
        {/* Tooltip */}
        <span
          className="absolute -top-11 px-3 py-1.5 rounded-xl
                     bg-surface-card border border-themed-border text-xs font-bold
                     text-content-primary whitespace-nowrap shadow-card
                     opacity-0 group-hover:opacity-100 pointer-events-none
                     transition-opacity duration-200"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          Mock Exams
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45
                           bg-surface-card border-r border-b border-themed-border" />
        </span>

        {/* Button */}
        <button
          onClick={() => navigate('/exam')}
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white
                     shadow-[0_8px_32px_rgba(0,0,0,0.25)] focus:outline-none
                     transition-transform duration-200 hover:scale-110 active:scale-90
                     focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-themed-accent"
          style={{ background: 'rgb(var(--accent))' }}
          aria-label="Open Mock Exams"
        >
          <ExamIcon />
        </button>
      </div>
    </div>
  )
}
