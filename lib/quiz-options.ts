export type QuizOption = { value: string; label: string; emoji: string }

export const ROLE_OPTIONS: QuizOption[] = [
  { value: 'engineering', label: 'Engineering / Development', emoji: '💻' },
  { value: 'design', label: 'Design / Creative', emoji: '🎨' },
  { value: 'product', label: 'Product Management', emoji: '📊' },
  { value: 'marketing', label: 'Marketing / Growth', emoji: '📣' },
  { value: 'sales', label: 'Sales / Business Development', emoji: '💰' },
  { value: 'operations', label: 'Operations / Support', emoji: '⚙️' },
  { value: 'finance', label: 'Finance / Accounting', emoji: '🧮' },
  { value: 'other', label: 'Something else', emoji: '✨' },
]

export const SALARY_OPTIONS: QuizOption[] = [
  { value: '30000', label: 'Under $50k', emoji: '💵' },
  { value: '60000', label: '$50k to $80k', emoji: '💵' },
  { value: '90000', label: '$80k to $120k', emoji: '💰' },
  { value: '130000', label: '$120k to $180k', emoji: '💰' },
  { value: '200000', label: '$180k+', emoji: '💎' },
]

// Free text the hero search box accepts, mapped onto the quiz's fixed role
// values. Keys are matched as substrings against a lowercased query, so
// "senior react dev" resolves to engineering.
const ROLE_KEYWORDS: Record<string, string[]> = {
  engineering: ['engineer', 'developer', 'dev', 'programmer', 'software', 'frontend', 'front end', 'backend', 'back end', 'fullstack', 'full stack', 'devops', 'data', 'qa', 'mobile', 'ios', 'android'],
  design: ['design', 'ux', 'ui', 'creative', 'brand', 'illustrator'],
  product: ['product manager', 'product owner', 'product'],
  marketing: ['marketing', 'growth', 'seo', 'content', 'social media', 'copywriter'],
  sales: ['sales', 'account executive', 'business development', 'partnerships'],
  operations: ['operations', 'ops', 'support', 'customer success', 'admin', 'project manager'],
  finance: ['finance', 'accounting', 'accountant', 'bookkeeper', 'controller', 'payroll'],
}

export function matchRoleValue(query: string): string | null {
  const q = query.trim().toLowerCase()
  if (!q) return null

  const exact = ROLE_OPTIONS.find((o) => o.value === q || o.label.toLowerCase() === q)
  if (exact) return exact.value

  for (const [value, keywords] of Object.entries(ROLE_KEYWORDS)) {
    if (keywords.some((k) => q.includes(k))) return value
  }
  return null
}

export function isKnownSalaryValue(value: string): boolean {
  return SALARY_OPTIONS.some((o) => o.value === value)
}
