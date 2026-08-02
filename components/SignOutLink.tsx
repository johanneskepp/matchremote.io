'use client'

import { useRouter } from 'next/navigation'

export default function SignOutLink() {
  const router = useRouter()

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <button
      onClick={signOut}
      style={{ color: 'var(--ink-soft)', fontSize: '15px', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
    >
      Sign out
    </button>
  )
}
