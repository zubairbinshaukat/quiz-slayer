import { motion } from 'framer-motion'
import BlurText from '../reactbits/BlurText'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

/* ─── Floating accent shapes (decorative) ────────────────────────── */
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.18, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl"
        style={{ background: 'rgb(var(--accent) / 0.1)' }}
      />
      {/* Floating ring — left */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-12 left-[8%] sm:left-[15%] w-16 h-16 sm:w-20 sm:h-20 rounded-full border opacity-[0.07] dark:opacity-[0.05]"
        style={{ borderColor: 'rgb(var(--accent))' }}
      />
      {/* Floating ring — right */}
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-8 right-[8%] sm:right-[14%] w-10 h-10 sm:w-14 sm:h-14 rounded-full border opacity-[0.06] dark:opacity-[0.04]"
        style={{ borderColor: 'rgb(var(--accent))' }}
      />
      {/* Small dot cluster — left */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-28 left-[12%] sm:left-[20%] flex gap-1.5"
      >
        {[5, 3, 4].map((size, i) => (
          <div
            key={i}
            className="rounded-full opacity-[0.12] dark:opacity-[0.08]"
            style={{
              width: size,
              height: size,
              background: 'rgb(var(--accent))',
            }}
          />
        ))}
      </motion.div>
      {/* Small dot cluster — right */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-16 right-[10%] sm:right-[18%] flex gap-1.5"
      >
        {[3, 5, 3].map((size, i) => (
          <div
            key={i}
            className="rounded-full opacity-[0.1] dark:opacity-[0.06]"
            style={{
              width: size,
              height: size,
              background: 'rgb(var(--accent))',
            }}
          />
        ))}
      </motion.div>
      {/* Diagonal accent line */}
      <motion.div
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-px -rotate-12"
        style={{ background: `linear-gradient(90deg, transparent, rgb(var(--accent)), transparent)` }}
      />
    </div>
  )
}

/* ─── Stat pill ──────────────────────────────────────────────────── */
function StatBadge({ icon, label }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{
        background: 'rgb(var(--bg-card))',
        color: 'rgb(var(--text-secondary))',
        border: '1px solid rgb(var(--border))',
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

/* ─── Hero Section ───────────────────────────────────────────────── */
export function HeroSection({ subjectCount }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative text-center py-16 sm:py-24 md:py-28 px-4"
    >
      <FloatingShapes />

      {/* Subject count badge */}
      <motion.div
        variants={item}
        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8"
        style={{
          background: 'rgb(var(--accent) / 0.08)',
          color: 'rgb(var(--accent))',
          border: '1px solid rgb(var(--accent) / 0.15)',
        }}
      >
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
        </motion.span>
        <span>{subjectCount} Subject{subjectCount !== 1 ? 's' : ''} Available</span>
        {/* Ping dot */}
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: 'rgb(var(--accent))' }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ background: 'rgb(var(--accent))' }}
          />
        </span>
      </motion.div>

      {/* Heading */}
      <motion.div variants={item} className="relative mb-6">
        <BlurText
          text="Study Smarter, Not Harder"
          delay={80}
          animateBy="words"
          direction="top"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight justify-center"
          stepDuration={0.4}
        />
      </motion.div>

      {/* Description */}
      <motion.p
        variants={item}
        className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        style={{ color: 'rgb(var(--text-secondary))' }}
      >
        Test your knowledge across university subjects. Track your progress, review mistakes,
        and slay your exams — one quiz at a time.
      </motion.p>

      {/* Stats row */}
      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10"
      >
        <StatBadge
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
          label="Track Progress"
        />
        <StatBadge
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
            </svg>
          }
          label="Slay Exams"
        />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        variants={item}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-3" style={{ color: 'rgb(var(--text-secondary))' }}>
          <span className="w-8 sm:w-12 h-px" style={{ background: 'rgb(var(--border))' }} />
          <span className="text-xs sm:text-sm font-semibold tracking-wide">Pick a subject below</span>
          <span className="w-8 sm:w-12 h-px" style={{ background: 'rgb(var(--border))' }} />
        </div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg
            className="w-5 h-5 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: 'rgb(var(--text-secondary))' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}