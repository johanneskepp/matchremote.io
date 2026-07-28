import { querySearchAnalytics, listSitemaps } from "../lib/seo/search-console";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const startDate = isoDaysAgo(28);
  const endDate = isoDaysAgo(1); // GSC data lags ~1-2 days

  const [byQuery, byPage, sitemaps] = await Promise.all([
    querySearchAnalytics({ startDate, endDate, dimensions: ["query"], rowLimit: 50 }),
    querySearchAnalytics({ startDate, endDate, dimensions: ["page"], rowLimit: 50 }),
    listSitemaps(),
  ]);

  const totals = byPage.reduce(
    (acc, row) => {
      acc.clicks += row.clicks;
      acc.impressions += row.impressions;
      return acc;
    },
    { clicks: 0, impressions: 0 }
  );

  const report = {
    period: { startDate, endDate },
    totals,
    topQueries: byQuery
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 30)
      .map((r) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: Math.round(r.ctr * 1000) / 10,
        position: Math.round(r.position * 10) / 10,
      })),
    topPages: byPage
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 30)
      .map((r) => ({
        page: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: Math.round(r.ctr * 1000) / 10,
        position: Math.round(r.position * 10) / 10,
      })),
    // pages with meaningful impressions but weak CTR/position are the best optimization targets
    highImpressionLowCtr: byPage
      .filter((r) => r.impressions >= 20 && r.ctr < 0.02)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 20)
      .map((r) => ({
        page: r.keys[0],
        impressions: r.impressions,
        ctr: Math.round(r.ctr * 1000) / 10,
        position: Math.round(r.position * 10) / 10,
      })),
    sitemaps: sitemaps.map((s) => ({
      path: s.path,
      lastSubmitted: s.lastSubmitted,
      lastDownloaded: s.lastDownloaded,
      isPending: s.isPending,
      errors: s.errors,
      warnings: s.warnings,
      contents: s.contents?.map((c) => ({ type: c.type, submitted: c.submitted, indexed: c.indexed })),
    })),
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error("SEO report failed:", e.message);
  process.exit(1);
});
