import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useTenant } from '../context/TenantContext'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { getLocalizedField } from '../lib/utils'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ChatWidget from '../components/ChatWidget'
import {
  ArrowLeft, ArrowRight, Home, TrendingUp, Building2,
  ClipboardCheck, PiggyBank, Scale, Phone, Mail,
  CheckCircle2,
} from 'lucide-react'

const iconMap = { Home, TrendingUp, Building2, ClipboardCheck, PiggyBank, Scale }

const staticServices = {
  buying: {
    icon: Home,
    benefits: ['buyingBenefit1', 'buyingBenefit2', 'buyingBenefit3', 'buyingBenefit4'],
  },
  selling: {
    icon: TrendingUp,
    benefits: ['sellingBenefit1', 'sellingBenefit2', 'sellingBenefit3', 'sellingBenefit4'],
  },
  rental: {
    icon: Building2,
    benefits: ['rentalBenefit1', 'rentalBenefit2', 'rentalBenefit3', 'rentalBenefit4'],
  },
  valuation: {
    icon: ClipboardCheck,
    benefits: ['valuationBenefit1', 'valuationBenefit2', 'valuationBenefit3', 'valuationBenefit4'],
  },
  investment: {
    icon: PiggyBank,
    benefits: ['investmentBenefit1', 'investmentBenefit2', 'investmentBenefit3', 'investmentBenefit4'],
  },
  legal: {
    icon: Scale,
    benefits: ['legalBenefit1', 'legalBenefit2', 'legalBenefit3', 'legalBenefit4'],
  },
}

export default function ServiceDetail() {
  const { key } = useParams()
  const { t, lang } = useLanguage()
  const { tenantId } = useTenant()
  const [service, setService] = useState(null)
  const [allServices, setAllServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (supabaseConfigured) {
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('sort_order')
        setAllServices(services || [])
        const found = (services || []).find(s => s.key === key)
        setService(found || null)
      } else {
        const found = staticServices[key]
        if (found) {
          setService({ key, ...found })
        }
        setAllServices(Object.entries(staticServices).map(([k, v]) => ({ key: k, ...v })))
      }
      setLoading(false)
    }
    fetchData()
  }, [key])

  const getServiceTitle = (svc) => {
    if (supabaseConfigured) return getLocalizedField(svc, 'title', lang)
    return t(`services.${svc.key}`)
  }

  const getServiceDesc = (svc) => {
    if (supabaseConfigured) return getLocalizedField(svc, 'description', lang)
    return t(`services.${svc.key}Desc`)
  }

  const getIcon = (svc) => {
    if (supabaseConfigured) return iconMap[svc.icon_name] || Home
    return svc.icon || Home
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 text-center px-6">
          <Building2 size={48} className="mx-auto text-neutral-300 mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">{t('serviceDetail.notFound')}</h1>
          <p className="text-neutral-500 mb-6">{t('serviceDetail.notFoundText')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-dark transition-colors"
          >
            <ArrowLeft size={16} />
            {t('serviceDetail.back')}
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const Icon = getIcon(service)
  const title = getServiceTitle(service)
  const description = getServiceDesc(service)
  const benefits = staticServices[service.key]?.benefits || []
  const otherServices = allServices.filter(s => s.key !== key)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Service header */}
              <div className="flex items-start gap-5 mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon size={32} className="text-accent" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">{title}</h1>
                  <p className="text-neutral-500 text-lg leading-relaxed">{description}</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-neutral-50 rounded-2xl p-8 mb-8">
                <h2 className="text-xl font-bold text-primary mb-6">{t('serviceDetail.whatWeOffer')}</h2>
                <div className="space-y-4">
                  {benefits.map((benefitKey) => (
                    <div key={benefitKey} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-accent shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{t(`serviceDetail.${benefitKey}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process steps */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-primary mb-6">{t('serviceDetail.howItWorks')}</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="bg-white rounded-xl border border-neutral-100 p-6 text-center">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">{step}</span>
                      </div>
                      <h3 className="font-bold text-primary mb-1">{t(`serviceDetail.step${step}Title`)}</h3>
                      <p className="text-neutral-500 text-sm">{t(`serviceDetail.step${step}Text`)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              {/* Contact CTA */}
              <div className="bg-primary rounded-2xl p-6 lg:p-8 mb-6 sticky top-28">
                <h2 className="text-xl font-bold text-white mb-2">{t('serviceDetail.ctaTitle')}</h2>
                <p className="text-white/70 text-sm mb-6">{t('serviceDetail.ctaText')}</p>
                <div className="space-y-3 mb-6">
                  <a
                    href="tel:+3231234567"
                    className="flex items-center gap-3 text-white/90 hover:text-accent transition-colors"
                  >
                    <Phone size={18} className="text-accent" />
                    +32 3 123 45 67
                  </a>
                  <a
                    href="mailto:info@vastgoedelite.be"
                    className="flex items-center gap-3 text-white/90 hover:text-accent transition-colors"
                  >
                    <Mail size={18} className="text-accent" />
                    info@vastgoedelite.be
                  </a>
                </div>
                <Link
                  to="/"
                  className="group w-full bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {t('serviceDetail.contactUs')}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Other services */}
              <div className="bg-neutral-50 rounded-2xl p-6">
                <h3 className="font-bold text-primary mb-4">{t('serviceDetail.otherServices')}</h3>
                <div className="space-y-2">
                  {otherServices.slice(0, 5).map((svc) => {
                    const SvcIcon = getIcon(svc)
                    return (
                      <Link
                        key={svc.key}
                        to={`/service/${svc.key}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors group"
                      >
                        <SvcIcon size={18} className="text-accent" />
                        <span className="text-neutral-700 font-medium group-hover:text-accent transition-colors">
                          {getServiceTitle(svc)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}
