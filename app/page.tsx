import { HeroSection } from "@/components/HeroSection";
import Link from "next/link";
import { Check, Zap, Target, Clock } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="bg-gradient-to-b from-transparent via-blue-50 to-transparent py-20 md:py-32">
        <div className="container-safe">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why matchremote?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We understand what matters for remote workers. Our algorithm considers your unique needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our AI analyzes job listings to find roles that truly match your preferences, not just keywords.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Async-Aware</h3>
              <p className="text-gray-600">
                We score jobs based on how async-friendly they are. Your work-life balance matters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">
                Stop scrolling through hundreds of jobs. Get your top 20 matches in seconds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free to Start</h3>
              <p className="text-gray-600">
                Take the quiz and see your matches for free. Premium features unlock more features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container-safe">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to find your perfect remote job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Take the Quiz</h3>
              <p className="text-gray-600 mb-6">
                Answer 15 thoughtful questions about your work style, timezone, skills, and preferences.
              </p>
              <p className="text-sm text-gray-500">Takes 5 minutes</p>
            </div>

            {/* Step 2 */}
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Matched</h3>
              <p className="text-gray-600 mb-6">
                Our AI algorithm scores thousands of remote jobs against your profile instantly.
              </p>
              <p className="text-sm text-gray-500">Real-time matching</p>
            </div>

            {/* Step 3 */}
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Apply</h3>
              <p className="text-gray-600 mb-6">
                Browse your personalized matches, read detailed insights, and apply to great jobs.
              </p>
              <p className="text-sm text-gray-500">Direct links to jobs</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/quiz" className="btn-primary inline-flex items-center gap-2">
              Start the Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 md:py-24">
        <div className="container-safe text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to find your perfect remote job?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of remote workers who've found their ideal match. Start today for free.
          </p>
          <Link href="/quiz" className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition inline-block">
            Take the Quiz
          </Link>
        </div>
      </section>
    </>
  );
}
