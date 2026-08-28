// Some sources hand us text whose UTF-8 bytes were already decoded as Latin-1
// somewhere upstream, so a right single quote (E2 80 99) arrives as the three
// characters "â" plus two C1 controls, an em dash arrives as "â" plus two more,
// and a Chinese city name arrives as a run of Latin-1 letters. The bytes are
// all still there, they are just being read one at a time instead of in groups,
// so the original character is recoverable exactly rather than guessed at.
//
// The repair deliberately works on one run of high characters at a time instead
// of round tripping the whole string. A whole string round trip corrupts any
// character above U+00FF sitting next to the damage, because encoding it back
// to Latin-1 truncates it to a single byte, and that loss is silent. Repairing
// run by run also means a run that is genuine text simply fails to decode and
// is left exactly as it was, which is what protects Portuguese "dinâmica",
// French "bâtiment" and German "für" from being mangled into punctuation.

// A maximal run of characters that could be Latin-1 read bytes. ASCII ends a
// run, so ordinary words act as natural boundaries.
const HIGH_RUN = /[\u0080-\u00ff]+/g

// Sources occasionally hand us text that was mis-decoded twice, where "Ã¢â‚¬â„¢"
// is a right single quote that needs two passes. Bounded rather than looping to
// a fixed point so a pathological input cannot spin.
const MAX_PASSES = 3

function repairOnce(text: string): string {
  return text.replace(HIGH_RUN, (run) => {
    const bytes = Buffer.from(Array.from(run).map((c) => c.charCodeAt(0)))
    const decoded = bytes.toString('utf8')

    // U+FFFD means these bytes were never a UTF-8 sequence, so the run is
    // genuine accented text and must be left exactly as it is.
    if (decoded.includes('\ufffd') || decoded === run) return run
    return decoded
  })
}

export function repairMojibake(text: string): string {
  if (!text) return text

  let current = text
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const next = repairOnce(current)
    if (next === current) break
    current = next
  }

  return current
}

// True when a repair would change the text, used by the repair script to skip
// rows that are already clean.
export function containsMojibake(text: string): boolean {
  return !!text && repairMojibake(text) !== text
}
