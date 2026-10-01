/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    // Subject card color accents — safelisted because they're built from dynamic strings
    'from-indigo-100', 'to-violet-100', 'border-indigo-200', 'text-indigo-600', 'bg-indigo-500', 'bg-indigo-100',
    'from-emerald-100', 'to-teal-100', 'border-emerald-200', 'text-emerald-600', 'bg-emerald-500', 'bg-emerald-100',
    'from-rose-100', 'to-pink-100', 'border-rose-200', 'text-rose-600', 'bg-rose-500', 'bg-rose-100',
    'from-amber-100', 'to-orange-100', 'border-amber-200', 'text-amber-600', 'bg-amber-500', 'bg-amber-100',
    'from-violet-100', 'to-purple-100', 'border-violet-200', 'text-violet-600', 'bg-violet-500', 'bg-violet-100',
    'from-sky-100', 'to-cyan-100', 'border-sky-200', 'text-sky-600', 'bg-sky-500', 'bg-sky-100',
    'dark:from-indigo-950', 'dark:to-violet-950', 'dark:border-indigo-800', 'dark:text-indigo-400', 'dark:bg-indigo-900',
    'dark:from-emerald-950', 'dark:to-teal-950', 'dark:border-emerald-800', 'dark:text-emerald-400', 'dark:bg-emerald-900',
    'dark:from-rose-950', 'dark:to-pink-950', 'dark:border-rose-800', 'dark:text-rose-400', 'dark:bg-rose-900',
    'dark:from-amber-950', 'dark:to-orange-950', 'dark:border-amber-800', 'dark:text-amber-400', 'dark:bg-amber-900',
    'dark:from-violet-950', 'dark:to-purple-950', 'dark:border-violet-800', 'dark:text-violet-400', 'dark:bg-violet-900',
    'dark:from-sky-950', 'dark:to-cyan-950', 'dark:border-sky-800', 'dark:text-sky-400', 'dark:bg-sky-900',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          primary: 'rgb(var(--bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)',
        },
        content: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
        themed: {
          border: 'rgb(var(--border) / <alpha-value>)',
          accent: 'rgb(var(--accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgb(0 0 0 / 0.04), 0 6px 16px -4px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 8px rgb(0 0 0 / 0.05), 0 20px 48px -8px rgb(0 0 0 / 0.16)',
        modal: '0 24px 64px -8px rgb(0 0 0 / 0.28)',
        glow: '0 0 0 3px rgb(var(--accent) / 0.2)',
      },
      animation: {
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
      },
      keyframes: {
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
