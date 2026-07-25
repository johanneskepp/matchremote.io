import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center pt-12 md:pt-0">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-green-50" />

      <div className="container-safe w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="flex items-center gap-2 w-fit">
              <Zap className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-green-600">
                AI-Powered Matching • Free to Start
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Find your <span className="gradient-text">perfect remote job</span> in minutes
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Stop endless scrolling. Answer 15 smart questions and get matched with remote jobs that actually fit your lifestyle, timezone, and skills.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Intelligent matching algorithm</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Considers async needs and timezone</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Updated daily with fresh opportunities</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/quiz" className="btn-primary flex items-center justify-center gap-2">
                Start Quiz <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pricing" className="btn-outline flex items-center justify-center gap-2">
                View Pricing
              </Link>
            </div>
          </div>

          {/* Right Side - Visual Element */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Floating Card 1 */}
              <div className="absolute top-0 right-0 w-80 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <div className="text-sm font-semibold text-gray-500 mb-2">Perfect Match</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Senior React Developer</h3>
                    <div className="text-2xl font-bold text-green-500">92%</div>
                  </div>
                  <p className="text-sm text-gray-600">Remote • $120k-150k • Async-friendly</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="badge-primary">React</span>
                    <span className="badge-primary">TypeScript</span>
                    <span className="badge-success">Async</span>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute top-64 left-0 w-80 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <div className="text-sm font-semibold text-gray-500 mb-2">Great Match</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Full Stack Engineer</h3>
                    <div className="text-2xl font-bold text-blue-500">78%</div>
                  </div>
                  <p className="text-sm text-gray-600">USA • $100k-130k • Flexible hours</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="badge-primary">Node.js</span>
                    <span className="badge-primary">React</span>
                    <span className="badge-warning">Timezone</span>
                  </div>
                </div>
              </div>

              {/* Gradient blob */}
              <div className="absolute inset-0 -z-10 w-96 h-96 bg-gradient-to-r from-blue-300 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
