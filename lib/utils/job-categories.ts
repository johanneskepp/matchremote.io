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
    // 'grafikdesign' is listed separately because German writes it as one word,
    // and keywords only match at a word start (see jobMatchesCategory), so
    // 'design' alone cannot see "Grafikdesigner:in".
    keywords: ['designer', 'design', 'ux', 'ui', 'creative', 'graphic', 'grafikdesign', 'illustrator', 'brand designer'],
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
    // 'presales' is spelled both ways in the live data. "Pre-Sales" is already
    // caught by 'sales' since the hyphen is a word start, "Presales" is not.
    keywords: ['sales', 'presales', 'account executive', 'account manager', 'business development', 'sdr', 'bdr', 'partnerships'],
  },
  {
    slug: 'operations',
    label: 'Operations & Support',
    emoji: '⚙️',
    description: 'Remote operations, customer support, and admin roles.',
    keywords: [
      'operations', 'customer support', 'customer success', 'support specialist', 'admin', 'systemadministrator',
      'office manager', 'people ops',
      // A bare 'hr' was measured and removed. Even matched at a word start it
      // reached 144 titles of which 118 were hourly rates ("Fully Remote | Upto
      // $120/hr"), so 82% of what it categorized as an HR job was a pay rate.
      // These exact phrases cover every real HR role in the catalogue instead.
      'human resources', 'recursos humanos', 'hris', 'hrbp', 'hr generalist', 'hr business partner',
      'hr manager', 'hr consultant', 'hr expert', 'hr operations', 'hr systems', 'hr payroll',
      'hr technology', 'hr services', 'hr lead', 'hr lifecycle',
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
      // German compound, same reason as 'grafikdesign' in the design category.
      'finanzbuch',
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
      'nurse', 'nursing', 'physician', 'therapist', 'therapy', 'psychiatr', 'telepsych', 'clinical', 'clinician',
      'telehealth', 'mental health', 'medical', 'pharmacist', 'pharmacy', 'dietitian', 'social worker',
      'counselor', 'patient care', 'healthcare', 'health coach', 'radiolog',
    ],
  },
  {
    slug: 'data',
    label: 'Data & Analytics',
    emoji: '📈',
    description: 'Remote data analysis, data science, and business intelligence roles.',
    keywords: [
      // 212 live jobs, 95 of which had no category at all before this. Every
      // keyword here is an exact role phrase. A bare 'data' was measured and
      // rejected: it matched 250 jobs including "Technical Program Manager,
      // Data Centers" and "Data Center Services", which are not data roles. A
      // bare 'analyst' was rejected the same way, 187 matches pulling in
      // "Claims Analyst", "Deal Desk Analyst" and "HRIS Analyst". Both are the
      // substring trap that once made every "Ukraine" job claim it was in the UK.
      'data analyst', 'data analytics', 'data scientist', 'data science', 'analytics',
      'business analyst', 'business intelligence', 'machine learning', 'ml engineer',
      'data engineer', 'analytics engineer', 'reporting analyst', 'statistician', 'biostatistic',
    ],
  },
  {
    slug: 'project-management',
    label: 'Project & Program Management',
    emoji: '🗂️',
    description: 'Remote project management, program management, and delivery roles.',
    keywords: [
      // 110 live jobs, 88 previously uncategorized. Kept to exact role phrases
      // for the same reason as the data category above. A bare 'program' was
      // measured and rejected outright: 61 matches, badly contaminated by
      // "Gameplay Programmer", "Systems Programmer", "Programmatic Media" and
      // "Programmiertutor", since every one of those contains "program". A bare
      // 'project' was rejected too, pulling in "Project Lyra Swedish Culture
      // Expert". 'technical program' was dropped as fully redundant, all 14 of
      // its matches are already caught by 'program manager'.
      'project manager', 'project management', 'program manager', 'program management',
      'scrum master', 'delivery manager', 'project coordinator', 'project lead',
    ],
  },
  {
    slug: 'legal',
    label: 'Legal & Compliance',
    emoji: '⚖️',
    description: 'Remote legal, compliance, and regulatory roles.',
    keywords: [
      // 134 live jobs, 106 of which had no category at all before this. A bare
      // 'counsel' was measured and rejected: matched at a word start it also
      // takes "Counsellor", "Intake Counsellor" and "Student Loan Counseling",
      // which are therapy and advice roles, not legal ones. The exact counsel
      // phrases below are used instead, which leaves "Counsel II" uncategorized.
      // Under claiming beats naming the wrong discipline, the same trade the
      // country table makes with "Georgia".
      'legal', 'paralegal', 'lawyer', 'attorney', 'litigation', 'advogad',
      'compliance', 'regulatory', 'contract manager',
      'general counsel', 'corporate counsel', 'commercial counsel', 'associate counsel', 'privacy counsel',
    ],
  },
]

export function getCategoryBySlug(slug: string): JobCategory | undefined {
  return JOB_CATEGORIES.find((c) => c.slug === slug)
}

// A keyword has to start where a word starts, but it may run on into the rest
// of that word, so 'design' still matches "designer" and "designers" while
// "Louisiana" no longer counts as a UI role. Plain substring matching put 176
// jobs on the design page that were nothing of the kind: 'ui' inside
// "Recruiter", "Builder", "Acquisition" and "Louisiana", 'ux' inside "Linux"
// and "Benelux". The boundary is Unicode aware on purpose, an ASCII one would
// still read "Führungskraft" as an HR role, since "ü" is not in a to z.
const boundaryPatterns = new Map<string, RegExp>()
function keywordPattern(keyword: string): RegExp {
  let pattern = boundaryPatterns.get(keyword)
  if (!pattern) {
    pattern = new RegExp('(?<![\\p{L}\\p{N}])' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'u')
    boundaryPatterns.set(keyword, pattern)
  }
  return pattern
}

export function jobMatchesCategory(job: Job, category: JobCategory): boolean {
  // Title only, deliberately. RemoteOK's `tags` field is not a reliable
  // per-job categorization (e.g. a "Graduate Analyst" post came tagged with
  // "vfx", "illustrator", "architecture"), so matching against tags/industries
  // produced false positives like Clinical Pharmacist under "Engineering".
  const haystack = job.title.toLowerCase()
  return category.keywords.some((kw) => keywordPattern(kw).test(haystack))
}
