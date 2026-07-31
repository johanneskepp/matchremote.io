import type { Job } from '@/lib/db/types'

// Salaried listings first, everything else after. A no-salary card in the
// first row reads as an incomplete listing, this only reorders, it never
// hides a job outright. JS's sort is stable, so relative order within each
// group (salaried vs not) is preserved from whatever the caller passed in.
export function sortJobsBySalaryFirst<T extends Pick<Job, 'salary_min'>>(jobs: T[]): T[] {
  return [...jobs].sort((a, b) => {
    const aHasSalary = a.salary_min != null
    const bHasSalary = b.salary_min != null
    if (aHasSalary === bHasSalary) return 0
    return aHasSalary ? -1 : 1
  })
}
