import Link from 'next/link'

interface LogoProps {
  /** Pixel height of the icon mark. Wordmark font size scales with it. */
  size?: number
  href?: string
}

export default function Logo({ size = 28, href = '/' }: LogoProps) {
  const fontSize = Math.round(size * 0.79)

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="128" height="128" rx="30" fill="var(--accent)" />
      <circle cx="64" cy="64" r="46" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.95" />
      <circle cx="64" cy="64" r="27" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.95" />
      <circle cx="64" cy="64" r="9" fill="#FFFFFF" />
      <circle className="logo-pulse-dot" cx="112" cy="16" r="17" fill="var(--teal)" stroke="var(--surface)" strokeWidth="5" />
    </svg>
  )

  const content = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
      {mark}
      <span
        className="font-display"
        style={{ fontSize, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}
      >
        match<span style={{ color: 'var(--accent)' }}>remote</span>
      </span>
    </span>
  )

  if (!href) return content

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  )
}
