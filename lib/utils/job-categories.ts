import type { Job } from '@/lib/db/types'

// Mirrors the "role" question options in app/quiz/page.tsx so category pages
// stay aligned with what the quiz itself calls these roles.
export interface JobCategory {
  slug: string
  label: string
  emoji: string
  description: string
  keywords: string[]
}

export const JOB_CATEGORIES: JobCategory[] = [
  {
    slug: 'engineering',
    label: 'Engineering',
    emoji: '💻',
    description: 'Remote software engineering and development roles.',
    keywords: ['engineer', 'developer', 'programming', 'software', 'backend', 'frontend', 'full stack', 'full-stack', 'devops', 'qa engineer', 'sre', 'data engineer', 'mobile developer', 'ios developer', 'ios engineer', 'android'],
  },
  {
    slug: 'design',
    label: 'Design',
    emoji: '🎨',
    description: 'Remote product design, UX, and creative roles.',
    keywords: ['designer', 'design', 'ux', 'ui', 'creative', 'graphic', 'illustrator', 'brand designer'],
  },
  {
    slug: 'product',
    label: 'Product Management',
    emoji: '📊',
    description: 'Remote product management and product ownership roles.',
    keywords: ['product manager', 'product owner', 'product lead', 'head of product'],
  },
  {
    slug: 'marketing',
    label: 'Marketing & Growth',
    emoji: '📣',
    description: 'Remote marketing, growth, content, and SEO roles.',
    keywords: ['marketing', 'growth', 'seo', 'content', 'social media', 'brand manager', 'demand generation', 'copywriter'],
  },
  {
    slug: 'sales',
    label: 'Sales & Business Development',
    emoji: '💰',
    description: 'Remote sales, account management, and business development roles.',
    keywords: ['sales', 'account executive', 'account manager', 'business development', 'sdr', 'bdr', 'partnerships'],
  },
  {
    slug: 'operations',
    label: 'Operations & Support',
    emoji: '⚙️',
    description: 'Remote operations, customer support, and admin roles.',
    keywords: [
      'operations', 'customer support', 'customer success', 'support specialist', 'admin', 'office manager', 'people ops', 'hr',
      'support analyst', 'support agent', 'support representative', 'help desk', 'onboarding', 'client success',
      'patient care', 'patient experience', 'community representative', 'executive assistant', 'administrative assistant',
      'supply chain', 'logistics', 'atencion al cliente', 'atención al cliente', 'suporte',
    ],
  },
  {
    slug: 'finance',
    label: 'Finance & Accounting',
    emoji: '💵',
    description: 'Remote finance, accounting, and bookkeeping roles.',
    keywords: [
      'accountant', 'accounting', 'bookkeeping', 'bookkeeper', 'finance', 'financial', 'buchhalter', 'buchhaltung',
      'account payable', 'accounts payable', 'controller', 'auditor',
    ],
  },
]

export function getCategoryBySlug(slug: string): JobCategory | undefined {
  return JOB_CATEGORIES.find((c) => c.slug === slug)
}

export function jobMatchesCategory(job: Job, category: JobCategory): boolean {
  // Title only, deliberately. RemoteOK's `tags` field is not a reliable
  // per-job categorization (e.g. a "Graduate Analyst" post came tagged with
  // "vfx", "illustrator", "architecture"), so matching against tags/industries
  // produced false positives like Clinical Pharmacist under "Engineering".
  const haystack = job.title.toLowerCase()
  return category.keywords.some((kw) => haystack.includes(kw))
}
