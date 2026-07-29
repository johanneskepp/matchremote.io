// How many matches a visitor sees in full without paying. These two are
// completely open: company, title, salary, description, apply link.
export const FREE_MATCH_LIMIT = 2

export const PRICE_PER_WEEK_USD = 7

// Match score thresholds the dashboard filter and the email alert setting
// both use, so the two never drift apart.
export const SCORE_THRESHOLDS = [60, 75, 90] as const

export const DEFAULT_ALERT_THRESHOLD = 60
