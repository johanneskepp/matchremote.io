import { google } from "googleapis";
import fs from "fs";
import path from "path";

function loadCredentials() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY_PATH is not set");
  }
  const resolved = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath);
  return JSON.parse(fs.readFileSync(resolved, "utf-8"));
}

function getSiteUrl() {
  const site = process.env.GOOGLE_SEARCH_CONSOLE_SITE;
  if (!site) {
    throw new Error("GOOGLE_SEARCH_CONSOLE_SITE is not set");
  }
  return site;
}

async function getAuthClient(scopes: string[]) {
  const credentials = loadCredentials();
  const auth = new google.auth.GoogleAuth({ credentials, scopes });
  return auth.getClient();
}

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function querySearchAnalytics(opts: {
  startDate: string;
  endDate: string;
  dimensions: ("query" | "page" | "date" | "country" | "device")[];
  rowLimit?: number;
}): Promise<SearchAnalyticsRow[]> {
  const authClient = await getAuthClient(["https://www.googleapis.com/auth/webmasters.readonly"]);
  const sc = google.searchconsole({ version: "v1", auth: authClient as any });
  const res = await sc.searchanalytics.query({
    siteUrl: getSiteUrl(),
    requestBody: {
      startDate: opts.startDate,
      endDate: opts.endDate,
      dimensions: opts.dimensions,
      rowLimit: opts.rowLimit ?? 100,
    },
  });
  return (res.data.rows as SearchAnalyticsRow[]) ?? [];
}

export async function listSitemaps() {
  const authClient = await getAuthClient(["https://www.googleapis.com/auth/webmasters.readonly"]);
  const sc = google.searchconsole({ version: "v1", auth: authClient as any });
  const res = await sc.sitemaps.list({ siteUrl: getSiteUrl() });
  return res.data.sitemap ?? [];
}

export async function submitSitemap(sitemapUrl: string) {
  const authClient = await getAuthClient(["https://www.googleapis.com/auth/webmasters"]);
  const sc = google.searchconsole({ version: "v1", auth: authClient as any });
  await sc.sitemaps.submit({ siteUrl: getSiteUrl(), feedpath: sitemapUrl });
}

export async function inspectUrl(inspectionUrl: string) {
  const authClient = await getAuthClient(["https://www.googleapis.com/auth/webmasters.readonly"]);
  const sc = google.searchconsole({ version: "v1", auth: authClient as any });
  const res = await sc.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl,
      siteUrl: getSiteUrl(),
    },
  });
  return res.data.inspectionResult;
}

/**
 * Notifies Google that a URL was published or updated. Only valid for pages carrying
 * JobPosting or BroadcastEvent structured data per Google's Indexing API terms of use,
 * i.e. our /jobs/[slug] pages, not arbitrary pages.
 */
export async function notifyUrlUpdated(url: string) {
  const authClient = await getAuthClient(["https://www.googleapis.com/auth/indexing"]);
  const indexing = google.indexing({ version: "v3", auth: authClient as any });
  await indexing.urlNotifications.publish({
    requestBody: { url, type: "URL_UPDATED" },
  });
}
