// Infers a 1-10 "async friendliness" score from a job's description, since
// none of our ingest sources (RemoteOK, Remotive, Arbeitnow) provide one and
// lib/utils/matching.ts's asyncAlignment scoring silently defaulted every job
// to a flat 10/20, never differentiating between jobs at all. Heuristic, not
// exact, but far better than a constant.
const ASYNC_SIGNALS = [
  'async', 'asynchronous', 'no meetings', 'meeting-free', 'core hours',
  'flexible hours', 'work whenever', 'own your schedule', 'deep work',
  'documentation first', 'written communication',
]

const SYNC_SIGNALS = [
  'daily standup', 'daily stand-up', 'daily scrum', 'real-time collaboration',
  'real time collaboration', 'requires overlap', 'overlap hours', 'core hours overlap',
  'must overlap', 'heavy meetings', 'in constant communication', 'always online',
]

const NEUTRAL_BASELINE = 5

export function inferAsyncScore(description: string): number {
  if (!description) return NEUTRAL_BASELINE
  const text = description.toLowerCase()

  const asyncHits = ASYNC_SIGNALS.filter((kw) => text.includes(kw)).length
  const syncHits = SYNC_SIGNALS.filter((kw) => text.includes(kw)).length

  if (asyncHits === 0 && syncHits === 0) return NEUTRAL_BASELINE

  const score = NEUTRAL_BASELINE + asyncHits * 2 - syncHits * 2
  return Math.min(10, Math.max(1, score))
}
