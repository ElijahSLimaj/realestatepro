import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { Home, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = account, 2 = agency, 3 = done
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Step 1 fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Step 2 fields
  const [agencyName, setAgencyName] = useState('')
  const [agencySlug, setAgencySlug] = useState('')
  const [phone, setPhone] = useState('')

  // Result
  const [tenantSlug, setTenantSlug] = useState('')

  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  function handleAgencyNameChange(value) {
    setAgencyName(value)
    if (!agencySlug || agencySlug === generateSlug(agencyName)) {
      setAgencySlug(generateSlug(value))
    }
  }

  async function handleStep1(e) {
    e.preventDefault()
    if (!email || !password || !fullName) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError(null)
    setStep(2)
  }

  async function handleStep2(e) {
    e.preventDefault()
    if (!agencyName || !agencySlug) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (!supabaseConfigured) {
        // Demo mode
        await new Promise((r) => setTimeout(r, 1500))
        setTenantSlug(agencySlug)
        setStep(3)
        return
      }

      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Account created but no user ID returned. Check your email for verification.')

      // 2. Create the tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: agencyName,
          slug: agencySlug,
          plan: 'free',
        })
        .select()
        .single()

      if (tenantError) {
        if (tenantError.message?.includes('duplicate') || tenantError.code === '23505') {
          throw new Error('This agency URL is already taken. Please choose a different one.')
        }
        throw tenantError
      }

      // 3. Create tenant membership (owner)
      const { error: memberError } = await supabase
        .from('tenant_members')
        .insert({
          tenant_id: tenant.id,
          user_id: userId,
          role: 'owner',
        })

      if (memberError) throw memberError

      // 4. Create default site settings
      const { error: settingsError } = await supabase
        .from('site_settings')
        .insert({
          tenant_id: tenant.id,
          company_name: agencyName,
          phone: phone,
          email: email,
        })

      if (settingsError) console.error('Settings creation failed:', settingsError)

      // 5. Create default services
      const defaultServices = [
        { tenant_id: tenant.id, key: 'buying', icon_name: 'Home', sort_order: 1, title_nl: 'Kopen', title_fr: 'Acheter', title_en: 'Buying', description_nl: 'Wij helpen u bij het vinden van uw droomwoning.', description_fr: 'Nous vous aidons à trouver votre maison de rêve.', description_en: 'We help you find your dream home.' },
        { tenant_id: tenant.id, key: 'selling', icon_name: 'TrendingUp', sort_order: 2, title_nl: 'Verkopen', title_fr: 'Vendre', title_en: 'Selling', description_nl: 'Maximaliseer de waarde van uw woning.', description_fr: 'Maximisez la valeur de votre propriété.', description_en: 'Maximize the value of your property.' },
        { tenant_id: tenant.id, key: 'rental', icon_name: 'Key', sort_order: 3, title_nl: 'Verhuur', title_fr: 'Location', title_en: 'Rental', description_nl: 'Professioneel verhuurbeheer.', description_fr: 'Gestion locative professionnelle.', description_en: 'Professional rental management.' },
      ]

      await supabase.from('services').insert(defaultServices)

      setTenantSlug(agencySlug)
      setStep(3)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = 'w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] bg-white'

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0C1D2E] flex items-center justify-center">
              <Home className="w-5 h-5 text-[#C8944A]" />
            </div>
            <span className="text-2xl font-bold text-[#0C1D2E]">RealEstatePro</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#C8944A]' : 'bg-neutral-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#C8944A]' : 'bg-neutral-200'}`} />
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-[#0C1D2E] mb-1">Create your account</h1>
              <p className="text-neutral-500 text-sm mb-6">Start your 14-day free trial. No credit card required.</p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClasses}
                    placeholder="Jan Janssen"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="jan@agency.be"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClasses}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#C8944A] hover:bg-[#b5833f] text-white py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {/* Step 2: Agency */}
          {step === 2 && (
            <>
              <button
                onClick={() => { setStep(1); setError(null) }}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#0C1D2E] mb-4 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-[#0C1D2E] mb-1">Set up your agency</h1>
              <p className="text-neutral-500 text-sm mb-6">This will be your website and admin panel.</p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleStep2} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Agency name</label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => handleAgencyNameChange(e.target.value)}
                    className={inputClasses}
                    placeholder="VastGoed Elite"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Website URL</label>
                  <div className="flex items-center gap-0">
                    <input
                      type="text"
                      value={agencySlug}
                      onChange={(e) => setAgencySlug(generateSlug(e.target.value))}
                      className={`${inputClasses} rounded-r-none border-r-0`}
                      placeholder="vastgoed-elite"
                      required
                    />
                    <div className="bg-neutral-100 border border-neutral-300 px-3 py-3 rounded-r-xl text-sm text-neutral-500 whitespace-nowrap">
                      .realestatepro.com
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClasses}
                    placeholder="+32 3 123 45 67"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C8944A] hover:bg-[#b5833f] text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating your agency...
                    </>
                  ) : (
                    'Launch My Agency'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-[#0C1D2E] mb-2">You're all set!</h1>
              <p className="text-neutral-500 text-sm mb-8">
                Your agency website is ready. You can now add listings, customize your site, and start managing deals.
              </p>
              <div className="space-y-3">
                <a
                  href={`/?tenant=${tenantSlug}`}
                  className="block w-full bg-[#0C1D2E] hover:bg-[#0C1D2E]/90 text-white py-3 rounded-xl text-sm font-semibold transition-colors text-center"
                >
                  View Your Website
                </a>
                <a
                  href={`/admin?tenant=${tenantSlug}`}
                  className="block w-full bg-[#C8944A] hover:bg-[#b5833f] text-white py-3 rounded-xl text-sm font-semibold transition-colors text-center"
                >
                  Go to Admin Dashboard
                </a>
              </div>
              <p className="text-xs text-neutral-400 mt-6">
                Your site: <span className="font-mono">{tenantSlug}.realestatepro.com</span>
              </p>
            </div>
          )}
        </div>

        {/* Bottom link */}
        {step < 3 && (
          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{' '}
            <a href="/admin/login" className="text-[#C8944A] hover:underline font-medium">
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
