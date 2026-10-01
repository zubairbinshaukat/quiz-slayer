/**
 * Every browser-storage key and IndexedDB name the app uses, in one place.
 * String values are persisted on users' devices: never change them.
 */

// ─── localStorage ────────────────────────────────────────────────────────────

/** Quiz-in-progress snapshot, suffixed with the subject slug. */
export const PROGRESS_KEY_PREFIX = 'quiz-progress-'
/** 'dark' | 'light' | 'system' (also read by the pre-paint script in index.html). */
export const THEME_KEY = 'quiz-theme'
/** 'true' | 'false' */
export const SOUND_KEY = 'sound-enabled'
/** Timed-exam mastery state, suffixed with the subject slug. */
export const EXAM_STATE_KEY_PREFIX = 'exam-state-'
/** Anonymous device identifier used by the leaderboard. */
export const DEVICE_ID_KEY = 'qs-device-id'
/** sessionStorage '1' once "Keep random name" was chosen this session (older builds stored it in localStorage). */
export const NAME_PROMPTED_KEY = 'qs-name-prompted'
/** Display name for the offline (local-only) leaderboard. */
export const PLAYER_NAME_KEY = 'qs-player-name'
/** 'auto' | 'on' | 'off' */
export const LITE_MODE_KEY = 'qs-lite-mode'
/** Epoch ms when the install card was dismissed. */
export const INSTALL_DISMISSED_KEY = 'qs-install-dismissed'
/** Removed: the leaderboard no longer renders a cached board offline. Deleted on startup. */
export const RETIRED_LEADERBOARD_CACHE_KEY = 'qs-leaderboard-cache'
/** 32-hex player secret: identifies this device's player on the server. Never shown. */
export const PLAYER_SECRET_KEY = 'qs-player-secret'
/** '1' while a device-id era player still needs players.claimLegacy. */
export const LEGACY_CLAIM_KEY = 'qs-legacy-claim'
/** '2' once identity has been initialised under the secret model. */
export const IDENTITY_VERSION_KEY = 'qs-identity-v'
/** '1' once the landing 'continue on this device' banner was dismissed. */
export const LINK_BANNER_DISMISSED_KEY = 'qs-link-banner-dismissed'
/** '1' once this install has been counted (iOS standalone launch / appinstalled). */
export const INSTALL_COUNTED_KEY = 'qs-install-counted'
/** Cosmetic local XP total (+10 per correct answer). Separate from leaderboard points. */
export const XP_KEY = 'qs-xp'
/** Owner stats session token (hidden /stats page). */
export const ADMIN_TOKEN_KEY = 'qs-admin-token'

// ─── sessionStorage ──────────────────────────────────────────────────────────

/** { slug, startTime } of the active quiz. */
export const SESSION_KEY = 'quiz-session'
/** Results snapshot read by the results page. */
export const ANALYTICS_KEY = 'quiz-analytics'
/** '1' after one automatic reload for a failed chunk load; cleared once the app renders. */
export const RELOADED_ONCE_KEY = 'qs-reloaded-once'
/** Set once this session's anonymous visit was counted. */
export const VISIT_TRACKED_KEY = 'qs-visit-tracked'

// ─── IndexedDB ───────────────────────────────────────────────────────────────

export const DB_NAME = 'quiz-practice-db'
/** v1 history · v2 custom subjects · v3 attempt outbox */
export const DB_VERSION = 3
export const DB_STORE = 'quiz_history'
export const CUSTOM_SUBJECTS_STORE = 'custom_subjects'
export const OUTBOX_STORE = 'outbox'
