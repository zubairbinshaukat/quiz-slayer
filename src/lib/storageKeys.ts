/**
 * Every browser-storage key and IndexedDB name the app uses, in one place.
 * String values are persisted on users' devices: never change them.
 */

// ─── localStorage ────────────────────────────────────────────────────────────

/** Quiz-in-progress snapshot, suffixed with the subject slug. */
export const PROGRESS_KEY_PREFIX = 'quiz-progress-'
/** 'dark' | 'light' (also read by the pre-paint script in index.html). */
export const THEME_KEY = 'quiz-theme'
/** 'true' | 'false' */
export const SOUND_KEY = 'sound-enabled'
/** Timed-exam mastery state, suffixed with the subject slug. */
export const EXAM_STATE_KEY_PREFIX = 'exam-state-'
/** Anonymous device identifier used by the leaderboard. */
export const DEVICE_ID_KEY = 'qs-device-id'
/** '1' once the leaderboard name prompt has been shown. */
export const NAME_PROMPTED_KEY = 'qs-name-prompted'
/** Display name for the offline (local-only) leaderboard. */
export const PLAYER_NAME_KEY = 'qs-player-name'
/** 'auto' | 'on' | 'off' */
export const LITE_MODE_KEY = 'qs-lite-mode'
/** Epoch ms when the install card was dismissed. */
export const INSTALL_DISMISSED_KEY = 'qs-install-dismissed'
/** Last known leaderboard payload, for offline rendering. */
export const LEADERBOARD_CACHE_KEY = 'qs-leaderboard-cache'

// ─── sessionStorage ──────────────────────────────────────────────────────────

/** { slug, startTime } of the active quiz. */
export const SESSION_KEY = 'quiz-session'
/** Results snapshot read by the results page. */
export const ANALYTICS_KEY = 'quiz-analytics'
/** Set once the splash has played this session. */
export const PRELOADED_KEY = 'qs-preloaded'

// ─── IndexedDB ───────────────────────────────────────────────────────────────

export const DB_NAME = 'quiz-practice-db'
/** v1 history · v2 custom subjects · v3 attempt outbox */
export const DB_VERSION = 3
export const DB_STORE = 'quiz_history'
export const CUSTOM_SUBJECTS_STORE = 'custom_subjects'
export const OUTBOX_STORE = 'outbox'
