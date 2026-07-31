<?xml version="1.0" encoding="UTF-8"?>
<!--
  Renders the raw RSS XML as a readable page when a human opens feed.xml in a
  browser. Feed readers and aggregators fetch the same file over HTTP and
  ignore this processing instruction entirely, so the feed itself is
  untouched, this only changes what a person sees if they click the link.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/rss/channel">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title><xsl:value-of select="title"/></title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #EDEEF0;
            color: #1A1C20;
            font-family: -apple-system, "Segoe UI", Inter, sans-serif;
          }
          header {
            background: #FFFFFF;
            border-bottom: 2px solid #D3D6DA;
            padding: 32px 20px;
          }
          .wrap {
            max-width: 720px;
            margin: 0 auto;
            padding: 0 20px;
          }
          header .wrap { padding: 0; }
          h1 {
            font-size: 28px;
            margin: 0 0 8px;
          }
          header p {
            color: #5B5F68;
            margin: 0 0 16px;
            font-size: 15px;
          }
          .notice {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #E3F3FB;
            color: #12719F;
            font-size: 13px;
            font-weight: 600;
            border-radius: 999px;
            padding: 6px 14px;
          }
          main.wrap { padding-top: 24px; padding-bottom: 56px; }
          .item {
            background: #FFFFFF;
            border: 1px solid #D3D6DA;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 14px;
          }
          .item a {
            color: #1E3A8A;
            font-size: 17px;
            font-weight: 700;
            text-decoration: none;
          }
          .item a:hover { text-decoration: underline; }
          .item .date {
            color: #5B5F68;
            font-size: 13px;
            margin: 4px 0 10px;
          }
          .item .desc {
            color: #1A1C20;
            font-size: 15px;
            line-height: 1.5;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="wrap">
            <h1><xsl:value-of select="title"/></h1>
            <p><xsl:value-of select="description"/></p>
            <span class="notice">This is an RSS feed. Subscribe with any feed reader, or browse the newest jobs below.</span>
          </div>
        </header>
        <main class="wrap">
          <xsl:for-each select="item">
            <div class="item">
              <a href="{link}"><xsl:value-of select="title"/></a>
              <div class="date"><xsl:value-of select="pubDate"/></div>
              <p class="desc"><xsl:value-of select="description"/></p>
            </div>
          </xsl:for-each>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
