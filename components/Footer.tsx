import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-100 border-t border-gray-800">
      <div className="container-safe py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4 text-white no-underline hover:text-blue-400">
              <Briefcase className="w-6 h-6 text-blue-400" />
              matchremote
            </Link>
            <p className="text-gray-400 text-sm">
              Find your perfect remote job match powered by AI
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition text-sm no-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-gray-400 hover:text-blue-400 transition text-sm no-underline">
                  Take Quiz
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-blue-400 transition text-sm no-underline">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {year} matchremote. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">
              LinkedIn
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
