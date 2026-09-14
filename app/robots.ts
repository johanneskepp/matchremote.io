import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // jobs-feed.xml is the full catalogue with descriptions, 8.76 MB per
        // fetch, built for aggregator partners who are handed the URL
        // directly. No partner is registered yet and nothing links to it, so
        // a crawler that stumbles on it only spends origin transfer.
        disallow: ['/api/', '/auth/', '/results', '/jobs-feed.xml'],
      },
      {
        // These three were 39 percent of all requests on 2026-09-13 and none
        // of them can bring a visitor: LivelapBot is an unknown crawler on
        // OVH, PetalBot feeds Huawei's search engine, AhrefsBot feeds Ahrefs'
        // own index (not Site Audit, which is AhrefsSiteAudit and still
        // welcome). They are also denied at the edge by a Vercel Firewall
        // rule, this is the polite copy of the same decision.
        userAgent: ['LivelapBot', 'PetalBot', 'AhrefsBot'],
        disallow: '/',
      },
    ],
    sitemap: 'https://matchremote.io/sitemap.xml',
  }
}
