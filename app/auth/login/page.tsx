'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In production, call your auth API
      console.log('[Auth] Sending magic link to:', email)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in with your email to access your matches and saved jobs.</p>
          </div>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <Mail className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h2 className="font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-4">
                We've sent a magic link to <span className="font-semibold">{email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive it? Check your spam folder or try signing in again.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 btn-ghost"
              >
                Try Different Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? 'Sending...' : 'Send Magic Link'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center text-sm text-gray-600">
                No account yet?{' '}
                <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700 no-underline">
                  Sign up
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Help */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <a href="mailto:support@matchremote.io" className="text-blue-600 font-semibold hover:text-blue-700">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
