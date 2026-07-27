import { slugify } from '@/lib/utils/helpers'

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function buildJobSlug(job: { id: string; title: string; company: string }): string {
  return `${slugify(`${job.title}-${job.company}`)}-${job.id}`
}

export function extractJobIdFromSlug(slug: string): string | null {
  const match = slug.match(UUID_RE)
  return match ? match[0] : null
}
