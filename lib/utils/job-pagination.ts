// Shared between app/remote-jobs/all/[[...page]] and app/sitemap.ts so the
// two can never disagree on how many pages the "all jobs" listing has.
export const ALL_JOBS_PAGE_SIZE = 60

// Same job, for category pages: shared between components/CategoryJobsListing,
// app/remote-jobs/[category], app/remote-jobs/[category]/p/[n] and
// app/sitemap.ts. Category pages used to render every matching job in one
// document, which reached 1156 jobs and 2.2 MB on /remote-jobs/engineering
// and showed up as a real LCP regression in npm run check:vitals.
export const CATEGORY_PAGE_SIZE = 60
