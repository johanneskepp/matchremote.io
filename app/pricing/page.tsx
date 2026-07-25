import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Get started with job matching',
      features: [
        'Take the quiz',
        'See top 20 matches',
        'Match score breakdown',
        'Save 5 jobs',
        'Email alerts (weekly)',
      ],
      cta: 'Get Started',
      ctaHref: '/quiz',
      featured: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'Recommended for active job seekers',
      features: [
        'Everything in Starter',
        'Unlimited saved jobs',
        'Email alerts (daily)',
        'Advanced filtering',
        'Salary negotiation guides',
        'Company research tools',
        'Priority support',
        'CV optimization tips',
      ],
      cta: 'Start 7-Day Trial',
      ctaHref: '#',
      featured: true,
    },
    {
      name: 'Teams',
      price: 'Custom',
      description: 'For hiring managers and teams',
      features: [
        'Post job openings',
        'Candidate matching',
        'Bulk email campaigns',
        'Analytics dashboard',
        'Team collaboration',
        'Priority support',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      ctaHref: '#',
      featured: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 md:py-24">
      <div className="container-safe">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works for you. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.featured
                  ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-2xl scale-105'
                  : 'bg-white border border-gray-200 text-gray-900 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Badge */}
              {plan.featured && (
                <div className="inline-block bg-yellow-300 text-yellow-900 font-semibold px-3 py-1 rounded-full text-sm mb-4">
                  Most Popular
                </div>
              )}

              {/* Name & Price */}
              <h3 className={`text-2xl font-bold mb-2 ${plan.featured ? 'text-white' : ''}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className={`${plan.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href={plan.ctaHref}
                className={`block text-center font-semibold py-3 rounded-lg mb-8 transition ${
                  plan.featured
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.featured ? 'text-yellow-300' : 'text-green-500'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I try Professional before paying?',
                a: 'Yes! Get 7 days free to explore all Pro features. No credit card required.',
              },
              {
                q: 'What happens when I cancel?',
                a: 'You can cancel anytime. You\'ll retain access through the end of your billing period.',
              },
              {
                q: 'Do you offer annual plans?',
                a: 'Yes! Save 20% with annual billing. Contact our team for details.',
              },
              {
                q: 'Is there a student discount?',
                a: 'Absolutely. Use code STUDENT30 for 30% off Professional plans.',
              },
            ].map((item, index) => (
              <div key={index} className="card">
                <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
