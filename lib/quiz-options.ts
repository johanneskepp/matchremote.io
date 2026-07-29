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

