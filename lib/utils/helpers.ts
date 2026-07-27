export function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return 'Salary not specified'
  if (min && !max) return `$${(min / 1000).toFixed(0)}k+`
  if (!min && max) return `Up to $${(max / 1000).toFixed(0)}k`
  if (min === max) return `$${(min! / 1000).toFixed(0)}k`
  return `$${(min! / 1000).toFixed(0)}k - $${(max! / 1000).toFixed(0)}k`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`

  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function truncateText(text: string, length: number = 150): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(email: string): string {
  const [name] = email.split('@')
  return name.substring(0, 2).toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export const experienceLevels = {
  1: 'Entry Level (0-1 years)',
  2: 'Junior (1-3 years)',
  3: 'Mid-Level (3-5 years)',
  4: 'Senior (5+ years)',
  5: 'Principal/Lead (10+ years)',
}

export const timezones = [
  'PST (UTC-8)',
  'MST (UTC-7)',
  'CST (UTC-6)',
  'EST (UTC-5)',
  'GMT (UTC+0)',
  'CET (UTC+1)',
  'IST (UTC+5:30)',
  'SGT (UTC+8)',
  'JST (UTC+9)',
  'AEST (UTC+10)',
  'Flexible / Multiple',
]

export const companySizes = [
  'Startup (1-50)',
  'Small (50-200)',
  'Medium (200-1000)',
  'Large (1000-10k)',
  'Enterprise (10k+)',
]

export const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'E-commerce',
  'Education',
  'Media & Entertainment',
  'SaaS',
  'Design',
  'Marketing',
  'Consulting',
  'Other',
]

export const jobTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
]

export const commonSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'AWS',
  'Docker',
  'Kubernetes',
  'SQL',
  'GraphQL',
  'Vue.js',
  'Angular',
  'Java',
  'Go',
  'Rust',
  'DevOps',
  'Cloud Architecture',
  'Machine Learning',
  'Data Science',
  'Project Management',
]

export function getColorForScore(score: number): string {
  if (score >= 80) return '#22c55e' // green
  if (score >= 60) return '#3b82f6' // blue
  if (score >= 40) return '#f59e0b' // amber
  return '#ef4444' // red
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Perfect Match'
  if (score >= 60) return 'Great Match'
  if (score >= 40) return 'Good Match'
  return 'Potential Match'
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
