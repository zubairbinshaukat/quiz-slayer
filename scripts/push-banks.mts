/**
 * Uploads answer keys (question id, correctIndex, option count; never question
 * text) for every built-in subject in src/data/*.json and src/data/quiz/*.json
 * to Convex, so the server can grade attempts.
 *
 *   npm run banks:push
 *
 * Reads from the environment, falling back to .env.local:
 *   CONVEX_URL or VITE_CONVEX_URL   deployment URL (https://<name>.convex.cloud)
 *   BANKS_ADMIN_KEY                 must equal the deployment's BANKS_ADMIN_KEY env var
 *
 * Production: set CONVEX_URL to the prod URL and BANKS_ADMIN_KEY to the prod key
 * in the shell before running. Re-run whenever a built-in subject changes.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api.js'

const root = resolve(import.meta.dirname, '..')

function readDotEnv(file: string): Record<string, string> {
  if (!existsSync(file)) return {}
  const out: Record<string, string> = {}
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*(?:#.*)?$/.exec(line)
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return out
}

const dotenv = readDotEnv(join(root, '.env.local'))
const env = (key: string): string | undefined => process.env[key] || dotenv[key] || undefined

const url = env('CONVEX_URL') ?? env('VITE_CONVEX_URL')
const adminKey = env('BANKS_ADMIN_KEY')
if (!url) throw new Error('Set CONVEX_URL or VITE_CONVEX_URL (e.g. in .env.local)')
if (!adminKey) throw new Error('Set BANKS_ADMIN_KEY (in .env.local and in the Convex dashboard)')

interface RawQuestion {
  id: number | string
  options: unknown[]
  correctIndex: number
}

function isQuestion(q: unknown): q is RawQuestion {
  if (typeof q !== 'object' || q === null) return false
  const r = q as Record<string, unknown>
  return (typeof r.id === 'number' || typeof r.id === 'string') && Array.isArray(r.options) && typeof r.correctIndex === 'number'
}

function bankFromFile(file: string) {
  const data = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
  if (typeof data.slug !== 'string' || typeof data.subject !== 'string') throw new Error(`${file}: missing slug/subject`)
  const questions: { id: string; correctIndex: number; optionsCount: number }[] = []
  const seen = new Set<string>()
  // `questions` first; guess questions only where their id doesn't collide (ids are graded by string)
  for (const list of [data.questions, data.guess_questions]) {
    if (!Array.isArray(list)) continue
    for (const q of list) {
      if (!isQuestion(q)) continue
      const id = String(q.id)
      if (seen.has(id)) continue
      seen.add(id)
      questions.push({ id, correctIndex: q.correctIndex, optionsCount: q.options.length })
    }
  }
  return { slug: data.slug, subject: data.subject, questions }
}

const dirs = [join(root, 'src', 'data'), join(root, 'src', 'data', 'quiz')]
const files = dirs
  .filter((d) => existsSync(d))
  .flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => join(d, f)))

if (files.length === 0) throw new Error('No subject files found in src/data')

const client = new ConvexHttpClient(url)
console.log(`Pushing ${files.length} bank(s) to ${url}`)
for (const file of files) {
  const bank = bankFromFile(file)
  const result = await client.mutation(api.banks.push, { adminKey, ...bank })
  console.log(`  ${result.status.padEnd(9)} ${bank.slug} v${result.version} (${bank.questions.length} questions)`)
}
