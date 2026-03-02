import { useState, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { Calculator, ArrowRight, Check } from 'lucide-react'

export default function MortgageCalculator() {
  const { t } = useLanguage()
  const [price, setPrice] = useState(400000)
  const [downPayment, setDownPayment] = useState(40000)
  const [rate, setRate] = useState(3.8)
  const [term, setTerm] = useState(30)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const calculation = useMemo(() => {
    const loan = price - downPayment
    const monthlyRate = rate / 100 / 12
    const totalPayments = term * 12

    if (monthlyRate === 0) {
      const monthly = loan / totalPayments
      return { monthly, totalInterest: 0, totalPayment: loan, loan }
    }

    const monthly = loan * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
    const totalPayment = monthly * totalPayments
    const totalInterest = totalPayment - loan

    return { monthly, totalInterest, totalPayment, loan }
  }, [price, downPayment, rate, term])

  const submitLead = async () => {
    if (!supabaseConfigured) return
    setSubmitting(true)
    try {
      await supabase.from('leads').insert({
        type: 'mortgage',
        email: email || null,
        phone: phone || null,
        data: {
          price, downPayment, rate, term,
          monthlyPayment: Math.round(calculation.monthly),
          loanAmount: calculation.loan,
          totalInterest: Math.round(calculation.totalInterest),
        },
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit mortgage lead:', err)
    }
    setSubmitting(false)
  }

  const formatPrice = (value) => {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const interestPercent = calculation.totalPayment > 0
    ? Math.round((calculation.totalInterest / calculation.totalPayment) * 100)
    : 0
  const principalPercent = 100 - interestPercent

  return (
    <section id="mortgage" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 mb-4">
              <Calculator size={18} className="text-primary" />
              <span className="text-primary font-semibold text-sm">{t('mortgage.title')}</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
              {t('mortgage.title')}
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              {t('mortgage.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="bg-neutral-50 rounded-2xl p-8">
              {/* Property price */}
              <div className="mb-6">
                <label className="flex justify-between text-neutral-700 font-medium text-sm mb-2">
                  <span>{t('mortgage.propertyPrice')}</span>
                  <span className="text-accent font-bold">{formatPrice(price)}</span>
                </label>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="10000"
                  value={price}
                  onChange={(e) => {
                    const newPrice = Number(e.target.value)
                    setPrice(newPrice)
                    if (downPayment > newPrice * 0.5) setDownPayment(Math.round(newPrice * 0.1))
                  }}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>€100.000</span>
                  <span>€2.000.000</span>
                </div>
              </div>

              {/* Down payment */}
              <div className="mb-6">
                <label className="flex justify-between text-neutral-700 font-medium text-sm mb-2">
                  <span>{t('mortgage.downPayment')}</span>
                  <span className="text-accent font-bold">{formatPrice(downPayment)} ({Math.round(downPayment / price * 100)}%)</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.round(price * 0.5)}
                  step="5000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>€0</span>
                  <span>{formatPrice(Math.round(price * 0.5))}</span>
                </div>
              </div>

              {/* Interest rate */}
              <div className="mb-6">
                <label className="flex justify-between text-neutral-700 font-medium text-sm mb-2">
                  <span>{t('mortgage.interestRate')}</span>
                  <span className="text-accent font-bold">{rate.toFixed(1)}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>1%</span>
                  <span>8%</span>
                </div>
              </div>

              {/* Loan term */}
              <div>
                <label className="block text-neutral-700 font-medium text-sm mb-3">
                  {t('mortgage.loanTerm')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 25, 30].map((y) => (
                    <button
                      key={y}
                      onClick={() => setTerm(y)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        term === y
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary'
                      }`}
                    >
                      {y} {t('mortgage.years')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              {/* Monthly payment */}
              <div className="bg-primary rounded-2xl p-8 mb-6 text-center">
                <div className="text-white/60 text-sm mb-2">{t('mortgage.monthlyPayment')}</div>
                <div className="text-4xl lg:text-5xl font-bold text-accent mb-4 counter-value">
                  {formatPrice(Math.round(calculation.monthly))}
                </div>
                <div className="text-white/40 text-sm">
                  {t('mortgage.loanAmount')}: {formatPrice(calculation.loan)}
                </div>
              </div>

              {/* Breakdown bar */}
              <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
                <div className="flex rounded-full overflow-hidden h-4 mb-4">
                  <div
                    className="bg-primary transition-all duration-500"
                    style={{ width: `${principalPercent}%` }}
                  />
                  <div
                    className="bg-accent transition-all duration-500"
                    style={{ width: `${interestPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-neutral-600">{t('mortgage.principal')}</span>
                    <span className="font-bold text-primary">{principalPercent}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-neutral-600">{t('mortgage.interest')}</span>
                    <span className="font-bold text-accent">{interestPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                  <div className="text-neutral-500 text-xs mb-1">{t('mortgage.totalInterest')}</div>
                  <div className="text-lg font-bold text-primary">{formatPrice(Math.round(calculation.totalInterest))}</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                  <div className="text-neutral-500 text-xs mb-1">{t('mortgage.totalPayment')}</div>
                  <div className="text-lg font-bold text-primary">{formatPrice(Math.round(calculation.totalPayment))}</div>
                </div>
              </div>

              {/* CTA */}
              {submitted ? (
                <div className="w-full bg-success/10 text-success font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg">
                  <Check size={20} />
                  {t('mortgage.ctaAdvice')} ✓
                </div>
              ) : (
                <div className="space-y-3">
                  {supabaseConfigured && (
                    <div className="flex gap-3 mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="flex-1 border-2 border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Telefoon"
                        className="flex-1 border-2 border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                  <button
                    onClick={submitLead}
                    disabled={submitting}
                    className="group w-full bg-accent hover:bg-accent-dark text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                  >
                    {t('mortgage.ctaAdvice')}
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
