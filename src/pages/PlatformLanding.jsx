import { Link } from 'react-router-dom'
import {
  Building2,
  BarChart3,
  Globe,
  Users,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Palette,
  MessageSquare,
  TrendingUp,
  Home,
} from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'Your Own Branded Website',
    description: 'Launch a professional real estate website with your branding, listings, and content — in minutes.',
  },
  {
    icon: BarChart3,
    title: 'Deal Pipeline Management',
    description: 'Track every deal from first contact to closing. Never lose track of a lead or miss a deadline.',
  },
  {
    icon: Users,
    title: 'Lead Capture & CRM',
    description: 'Automatically capture leads from your website. Manage contacts, schedule viewings, track conversions.',
  },
  {
    icon: Palette,
    title: 'Full Customization',
    description: 'Change colors, hero images, sections, and content. Make it yours without touching code.',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Built-in chat widget for your website visitors. Respond in real-time from your admin dashboard.',
  },
  {
    icon: TrendingUp,
    title: 'Valuation & Mortgage Tools',
    description: 'Offer home valuations and mortgage calculators to your visitors. Generate more qualified leads.',
  },
]

const plans = [
  {
    name: 'Starter',
    price: '49',
    period: '/mo',
    description: 'Perfect for independent agents',
    features: ['Up to 25 listings', '1 team member', 'Custom branding', 'Lead management', 'Blog'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '99',
    period: '/mo',
    description: 'For growing agencies',
    features: ['Unlimited listings', '5 team members', 'Deal pipeline CRM', 'Custom domain', 'Live chat', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '249',
    period: '/mo',
    description: 'For large brokerages',
    features: ['Everything in Pro', 'Unlimited team', 'API access', 'White-label', 'Dedicated support', 'Custom integrations'],
    cta: 'Contact Sales',
    popular: false,
  },
]

const stats = [
  { value: '500+', label: 'Agencies' },
  { value: '50K+', label: 'Listings Managed' },
  { value: '€2B+', label: 'Deal Volume' },
  { value: '99.9%', label: 'Uptime' },
]

export default function PlatformLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0C1D2E] flex items-center justify-center">
              <Home className="w-5 h-5 text-[#C8944A]" />
            </div>
            <span className="text-xl font-bold text-[#0C1D2E]">RealEstatePro</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-neutral-600 hover:text-[#0C1D2E] hidden sm:block">Features</a>
            <a href="#pricing" className="text-sm text-neutral-600 hover:text-[#0C1D2E] hidden sm:block">Pricing</a>
            <Link
              to="/register"
              className="bg-[#C8944A] hover:bg-[#b5833f] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1D2E] to-[#1a3a5c]" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 px-4 py-1.5 rounded-full text-sm mb-6">
              <Zap className="w-4 h-4 text-[#C8944A]" />
              The all-in-one platform for real estate professionals
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Run your agency.{' '}
              <span className="text-[#C8944A]">Close more deals.</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl">
              Get a professional website, manage listings, track deals from lead to closing,
              and grow your real estate business — all from one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#C8944A] hover:bg-[#b5833f] text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-colors"
              >
                See Features
              </a>
            </div>
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-[#C8944A]/10 blur-3xl" />
      </section>

      {/* Stats Bar */}
      <section className="border-b border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-[#0C1D2E]">{stat.value}</p>
                <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0C1D2E] mb-4">
              Everything you need to run your agency
            </h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              From website to CRM to deal management — we've got you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-neutral-200 hover:border-[#C8944A]/30 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C8944A]/10 flex items-center justify-center mb-4 group-hover:bg-[#C8944A]/15 transition-colors">
                  <Icon className="w-6 h-6 text-[#C8944A]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0C1D2E] mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0C1D2E] mb-4">
              Live in 5 minutes
            </h2>
            <p className="text-lg text-neutral-500">No code. No designers. No developers needed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your agency account and choose your plan.' },
              { step: '2', title: 'Customize', desc: 'Set your branding, add listings, and customize your site.' },
              { step: '3', title: 'Go Live', desc: 'Your website is live. Start managing deals and closing.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#0C1D2E] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-[#0C1D2E] mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0C1D2E] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-neutral-500">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-8 flex flex-col ${
                  plan.popular
                    ? 'border-[#C8944A] shadow-xl shadow-[#C8944A]/10 relative'
                    : 'border-neutral-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C8944A] text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-[#0C1D2E]">{plan.name}</h3>
                <p className="text-sm text-neutral-500 mt-1">{plan.description}</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-bold text-[#0C1D2E]">&euro;{plan.price}</span>
                  <span className="text-neutral-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors ${
                    plan.popular
                      ? 'bg-[#C8944A] hover:bg-[#b5833f] text-white'
                      : 'bg-[#0C1D2E] hover:bg-[#0C1D2E]/90 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-[#0C1D2E]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to grow your agency?
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Join hundreds of real estate professionals who've already made the switch.
            Start your free 14-day trial today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#C8944A] hover:bg-[#b5833f] text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#0C1D2E] flex items-center justify-center">
              <Home className="w-4 h-4 text-[#C8944A]" />
            </div>
            <span className="text-sm font-semibold text-[#0C1D2E]">RealEstatePro</span>
          </div>
          <p className="text-sm text-neutral-400">&copy; {new Date().getFullYear()} RealEstatePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
