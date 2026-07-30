// @atproto/api is ESM-only and its transitive dependency multiformats@13
// dropped its CommonJS build entirely. tsx compiles this project to CJS, and
// a plain `import` there gets resolved through a CJS-style path (including
// tsx's own tsconfig "paths" hook), which cannot see multiformats' ESM-only
// "import" export condition and fails with ERR_PACKAGE_PATH_NOT_EXPORTED. A
// dynamic `import()` is a real ESM import even from CJS code and goes through
// Node's proper ESM resolver instead, which is the only combination that
// actually works under tsx today.
async function loadAtproto() {
  return import('@atproto/api')
}

// Returns null when BLUESKY_HANDLE or BLUESKY_APP_PASSWORD is not configured,
// so a missing credential is a clearly reported failure rather than a crash,
// same convention as lib/email/client.ts's getResend.
function getCredentials(): { handle: string; appPassword: string } | null {
  const handle = process.env.BLUESKY_HANDLE
  const appPassword = process.env.BLUESKY_APP_PASSWORD
  if (!handle || !appPassword) return null
  return { handle, appPassword }
}

export function blueskyConfigured(): boolean {
  return getCredentials() !== null
}

// Posts one piece of text to the matchremote Bluesky account, detecting the
// job URL inside it as a clickable link facet rather than posting it as dead
// text. Use an app password (bsky.app settings > App Passwords), never the
// main account password.
export async function postToBluesky(text: string): Promise<{ ok: boolean; uri?: string; error?: string }> {
  const creds = getCredentials()
  if (!creds) return { ok: false, error: 'BLUESKY_HANDLE or BLUESKY_APP_PASSWORD is not configured' }

  try {
    const { AtpAgent, RichText } = await loadAtproto()

    const agent = new AtpAgent({ service: 'https://bsky.social' })
    await agent.login({ identifier: creds.handle, password: creds.appPassword })

    const rt = new RichText({ text })
    await rt.detectFacets(agent)

    const post = await agent.post({
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    })

    return { ok: true, uri: post.uri }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
