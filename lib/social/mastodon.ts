// Returns null when MASTODON_INSTANCE_URL or MASTODON_ACCESS_TOKEN is not
// configured, so a missing credential is a clearly reported failure rather
// than a crash, same convention as lib/social/bluesky.ts.
function getCredentials(): { instanceUrl: string; accessToken: string } | null {
  const instanceUrl = process.env.MASTODON_INSTANCE_URL
  const accessToken = process.env.MASTODON_ACCESS_TOKEN
  if (!instanceUrl || !accessToken) return null
  return { instanceUrl: instanceUrl.replace(/\/+$/, ''), accessToken }
}

export function mastodonConfigured(): boolean {
  return getCredentials() !== null
}

// Posts one piece of text as a public status to the matchremote Mastodon
// account. Mastodon's statuses API auto-links any URL inside the text, no
// separate rich text / facet step needed like Bluesky.
export async function postToMastodon(text: string): Promise<{ ok: boolean; uri?: string; error?: string }> {
  const creds = getCredentials()
  if (!creds) return { ok: false, error: 'MASTODON_INSTANCE_URL or MASTODON_ACCESS_TOKEN is not configured' }

  try {
    const response = await fetch(`${creds.instanceUrl}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ status: text, visibility: 'public' }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      return { ok: false, error: `Mastodon API ${response.status}: ${body.slice(0, 300)}` }
    }

    const data = (await response.json()) as { url?: string; uri?: string }
    return { ok: true, uri: data.url ?? data.uri }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
