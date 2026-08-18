// Job sources hand us HTML escaped text in fields that are not HTML: RemoteOK
// sends "MARINE PAINTER &amp; BLASTER" as a title, Jobicy (WordPress) sends
// "Johnson &#038; Johnson" as a company, Himalayas sends "&#x28;Contractor&#x29;".
// Stored raw, that text reaches three places that matter for SEO: the visible
// h1 and title tag (where it renders as the literal characters "&amp;"), the
// JobPosting structured data we publish to Google, and the URL slug, since
// slugify strips "&" and ";" but keeps the entity body, turning "&amp;" into
// the word "amp" and "&#038;" into "038".
//
// Decoding happens in a single left to right pass on purpose. A repeated pass
// would over decode, turning a source's escaped "&amp;lt;" into a real "<" and
// letting markup back into a field that should be plain text.

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  bull: '•',
  middot: '·',
  laquo: '«',
  raquo: '»',
  deg: '°',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  copy: '©',
  reg: '®',
  trade: '™',
  eacute: 'é',
  egrave: 'è',
  agrave: 'à',
  ccedil: 'ç',
  uuml: 'ü',
  ouml: 'ö',
  auml: 'ä',
  szlig: 'ß',
}

const ENTITY_RE = /&(#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,9});/g

// Code points that must never come back from a decode, whatever the source
// sent: C0/C1 control characters (which would corrupt a title or a JSON-LD
// string) and unpaired surrogates.
function isUnsafeCodePoint(code: number): boolean {
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return true
  if (code >= 0xd800 && code <= 0xdfff) return true
  if (code < 0x20 && code !== 0x09 && code !== 0x0a) return true
  if (code >= 0x7f && code <= 0x9f) return true
  return false
}

export function decodeHtmlEntities(text: string): string {
  if (!text || text.indexOf('&') === -1) return text

  return text.replace(ENTITY_RE, (match, body: string) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X'
      const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10)
      if (isUnsafeCodePoint(code)) return match
      return String.fromCodePoint(code)
    }

    const named = NAMED_ENTITIES[body] ?? NAMED_ENTITIES[body.toLowerCase()]
    return named === undefined ? match : named
  })
}

// Converts source HTML into readable plain text with paragraph breaks kept
// intact (job detail pages render this with white-space: pre-wrap), rather
// than collapsing every tag to a single space.
function htmlToText(html: string): string {
  return html
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]*>/g, '')
}

/**
 * Turns a source's description HTML into the plain text we store.
 *
 * RemoteOK and Arbeitnow send their descriptions escaped one time too many, so
 * the real tags are still spelled "&lt;p&gt;" after the markup pass and only
 * surface once the entities are decoded. Converting once and decoding once
 * left those tags sitting in the stored text, where they rendered as a literal
 * "<p>" on the job page, so each decode gets its markup converted too. Bounded
 * rather than looping to a fixed point, so a pathological input cannot spin.
 */
export function htmlToPlainText(html: string): string {
  let text = decodeHtmlEntities(htmlToText(html))
  for (let pass = 0; pass < 2 && /<[a-z!/][^>]*>/i.test(text); pass++) {
    text = decodeHtmlEntities(htmlToText(text))
  }

  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function containsHtmlEntity(text: string): boolean {
  if (!text) return false
  ENTITY_RE.lastIndex = 0
  const found = ENTITY_RE.test(text)
  ENTITY_RE.lastIndex = 0
  return found
}
