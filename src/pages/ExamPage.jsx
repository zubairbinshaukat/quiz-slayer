import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ExamSubjectCard } from "../components/exam/ExamSubjectCard";
import { useSubjectData } from "../hooks/useSubjectData";
import { useQuiz } from "../hooks/useQuiz";
import {
  EXAM_SUBJECTS,
  EXAM_MODE_SESSION_KEY,
  selectExamQuestions,
  getExamState,
  getTotalPoolSize,
} from "../lib/examState";
import Squares from "../components/reactbits/Squares";
import BlurText from "../components/reactbits/BlurText";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
};

function ClipboardCheckIcon() {
  return (
    <svg
      className="w-10 h-10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function InfoPills() {
  const pills = [
    {
      label: "Adaptive Retesting",
      icon: (
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      ),
    },
    {
      label: "Tracks Progress",
      icon: (
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "30 MCQs per Exam",
      icon: (
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-5">
      {pills.map((p) => (
        <span
          key={p.label}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-secondary text-content-secondary border border-themed-border"
        >
          {p.icon}
          {p.label}
        </span>
      ))}
    </div>
  );
}

export function ExamPage() {
  const { subjects, quizzes } = useSubjectData();
  const { startQuiz } = useQuiz();
  const navigate = useNavigate();

  function getSubjectData(slug) {
    return subjects.find((s) => s.slug === slug) ?? null;
  }

  function getQuizDataMap(config) {
    return config.quizSlugs.reduce((acc, slug) => {
      acc[slug] = quizzes.find((q) => q.slug === slug) ?? null;
      return acc;
    }, {});
  }

  function handleStartExam(config) {
    const subjectData = getSubjectData(config.slug);
    if (!subjectData) return;
    const quizDataMap = getQuizDataMap(config);
    const examState = getExamState(config.slug);
    const questions = selectExamQuestions(
      config,
      subjectData,
      quizDataMap,
      examState,
    );
    if (questions.length === 0) return;
    startQuiz({ subject: config.label, slug: config.slug }, questions);
    sessionStorage.setItem(
      EXAM_MODE_SESSION_KEY,
      JSON.stringify({ subjectSlug: config.slug }),
    );
    navigate(`/quiz/${config.slug}`);
  }

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-16">
      {/* Background grid */}
      <div className="fixed inset-0 -z-10 opacity-[0.04] dark:opacity-[0.07] pointer-events-none">
        <Squares
          speed={0.2}
          squareSize={48}
          direction="diagonal"
          borderColor="#888"
          hoverFillColor="#666"
        />
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center pt-10 pb-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
            delay: 0.05,
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-themed-accent/10 border border-themed-accent/20 text-themed-accent mb-5"
        >
          <ClipboardCheckIcon />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-black text-content-primary tracking-tight flex items-center justify-center">
          <BlurText
            text="Mock Exams"
            animateBy="words"
            delay={70}
            className="inline"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-content-secondary max-w-md mx-auto mt-2 leading-relaxed"
        >
          Simulate your upcoming exams with 30 adaptive MCQs. Cards unlock on
          exam day — wrong answers repeat until mastered.
        </motion.p>

        <InfoPills />
      </motion.div>

      {/* Subject cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {EXAM_SUBJECTS.map((config) => {
          const subjectData = getSubjectData(config.slug);
          const quizDataMap = getQuizDataMap(config);
          const examState = getExamState(config.slug);
          const totalPoolSize = subjectData
            ? getTotalPoolSize(config, subjectData, quizDataMap)
            : 0;

          return (
            <ExamSubjectCard
              key={config.slug}
              config={config}
              examState={examState}
              totalPoolSize={totalPoolSize}
              onStart={handleStartExam}
            />
          );
        })}
      </motion.div>

      {/* How it works note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-10 flex justify-center"
      >
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-surface-secondary border border-themed-border text-xs text-content-secondary max-w-md">
          <svg
            className="w-4 h-4 shrink-0 mt-0.5 text-themed-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="leading-relaxed">
            <span className="font-bold text-content-primary">
              How it works —{" "}
            </span>
            Each session picks 30 questions. Correct answers are permanently
            mastered and removed from future attempts. Wrong answers are saved
            and will always reappear until you get them right.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
