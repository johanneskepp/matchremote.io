// IndexNow (indexnow.org) is Bing/Yandex/Seznam's equivalent of Google's
// Indexing API: pinging it tells participating search engines a URL changed
// so they crawl it sooner instead of waiting for their normal schedule. The
// key file at public/<key>.txt proves ownership of the domain, the same key
// is sent with every submission.
const INDEXNOW_KEY = '6bfa82f46892e9ea89dcd8c8ca95dd4d'
const INDEXNOW_HOST = 'matchremote.io'
const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`
// IndexNow's own documented cap per submission call.
const MAX_URLS_PER_CALL = 10000

export async function submitUrlsToIndexNow(urls: string[]): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (urls.length === 0) return { ok: true }
  if (urls.length > MAX_URLS_PER_CALL) {
    return { ok: false, error: `${urls.length} urls exceeds IndexNow's ${MAX_URLS_PER_CALL} per call limit` }
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: INDEXNOW_HOST,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList: urls,
      }),
    })

    // IndexNow returns 200 or 202 on success, no response body to parse.
    if (!response.ok) {
      return { ok: false, status: response.status, error: `IndexNow API responded ${response.status}` }
    }
    return { ok: true, status: response.status }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
