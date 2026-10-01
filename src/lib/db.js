import { openDB } from 'idb'
import { DB_NAME, DB_VERSION, DB_STORE, CUSTOM_SUBJECTS_STORE } from './constants'

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(DB_STORE)) {
          const store = db.createObjectStore(DB_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('by_slug', 'slug')
          store.createIndex('by_date', 'dateTaken')
        }
        if (!db.objectStoreNames.contains(CUSTOM_SUBJECTS_STORE)) {
          db.createObjectStore(CUSTOM_SUBJECTS_STORE, { keyPath: 'slug' })
        }
      },
    })
  }
  return dbPromise
}

// ─── Quiz History ──────────────────────────────────────────────────────────

export async function saveQuizResult(result) {
  try {
    const db = await getDB()
    await db.add(DB_STORE, { ...result, dateTaken: new Date().toISOString() })
  } catch (err) {
    console.warn('IndexedDB: failed to save quiz result', err)
  }
}

export async function getAllHistory() {
  try {
    const db = await getDB()
    const all = await db.getAll(DB_STORE)
    return all.sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken))
  } catch (err) {
    console.warn('IndexedDB: failed to read history', err)
    return []
  }
}

export async function getHistoryBySlug(slug) {
  try {
    const db = await getDB()
    const index = db.transaction(DB_STORE).store.index('by_slug')
    const entries = await index.getAll(slug)
    return entries.sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken))
  } catch (err) {
    console.warn('IndexedDB: failed to read history by slug', err)
    return []
  }
}

export async function deleteHistoryEntry(id) {
  try {
    const db = await getDB()
    await db.delete(DB_STORE, id)
  } catch (err) {
    console.warn('IndexedDB: failed to delete history entry', err)
  }
}

export async function clearAllHistory() {
  try {
    const db = await getDB()
    await db.clear(DB_STORE)
  } catch (err) {
    console.warn('IndexedDB: failed to clear history', err)
  }
}

// ─── Custom Subjects ───────────────────────────────────────────────────────

export async function saveCustomSubject(subjectData) {
  const db = await getDB()
  await db.put(CUSTOM_SUBJECTS_STORE, {
    ...subjectData,
    isCustom: true,
    addedAt: new Date().toISOString(),
  })
}

export async function getAllCustomSubjects() {
  try {
    const db = await getDB()
    return await db.getAll(CUSTOM_SUBJECTS_STORE)
  } catch (err) {
    console.warn('IndexedDB: failed to load custom subjects', err)
    return []
  }
}

export async function deleteCustomSubject(slug) {
  try {
    const db = await getDB()
    await db.delete(CUSTOM_SUBJECTS_STORE, slug)
  } catch (err) {
    console.warn('IndexedDB: failed to delete custom subject', err)
  }
}

export async function getCustomSubjectSlugs() {
  try {
    const db = await getDB()
    const all = await db.getAllKeys(CUSTOM_SUBJECTS_STORE)
    return new Set(all)
  } catch {
    return new Set()
  }
}
