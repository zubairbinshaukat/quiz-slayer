import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function AddSubjectCard() {
  const navigate = useNavigate()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 380, damping: 22 } }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={() => navigate('/upload')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/upload')}
      aria-label="Add your own subject"
      className="group relative flex flex-col rounded-2xl border-2 border-dashed border-themed-border
        hover:border-themed-accent cursor-pointer overflow-hidden transition-all duration-300
        bg-surface-card hover:bg-themed-accent/5 shadow-card hover:shadow-card-hover min-h-[168px] sm:min-h-[184px]"
    >
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/5" />

      <div className="p-4 sm:p-5 flex flex-col flex-1 items-center justify-center text-center min-h-[148px] sm:min-h-[160px]">
        {/* Plus icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4
          bg-themed-accent/10 group-hover:bg-themed-accent/20
          border-2 border-dashed border-themed-accent/40 group-hover:border-themed-accent
          transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-themed-accent transition-transform duration-300 group-hover:scale-110"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </div>

        <h3 className="text-sm sm:text-base font-extrabold text-themed-accent mb-1">Add Subject</h3>
        <p className="text-[11px] sm:text-xs text-content-secondary leading-relaxed">
          Upload your own JSON file<br />or convert notes with AI
        </p>
      </div>
    </motion.div>
  )
}
