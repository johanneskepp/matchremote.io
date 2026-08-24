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
      // "customer service" is by far the most common phrasing in the live
      // catalogue and was the single biggest gap here: 72 real support roles
      // sat uncategorized because only "support" and "success" were listed.
      'customer service', 'customer care', 'customer experience', 'client services', 'call center', 'contact center',
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
  {
    slug: 'healthcare',
    label: 'Healthcare & Telehealth',
    emoji: '🩺',
    description: 'Remote clinical, telehealth, and licensed healthcare roles.',
    keywords: [
      // The largest genuine cluster in the uncategorized set (202 live jobs,
      // 172 of them in the Americas), driven by US telehealth and teleradiology
      // employers. Short licence acronyms (LCSW, LMFT, LPC, LMHC) are
      // deliberately left out: they matched zero jobs these keywords did not
      // already catch, and substring matching on three letter tokens is the
      // same trap that once made every "Ukraine" job claim it was in the UK.
      'nurse', 'nursing', 'physician', 'therapist', 'therapy', 'psychiatr', 'clinical', 'clinician',
      'telehealth', 'mental health', 'medical', 'pharmacist', 'pharmacy', 'dietitian', 'social worker',
      'counselor', 'patient care', 'healthcare', 'health coach', 'radiolog',
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
