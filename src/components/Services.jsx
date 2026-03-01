import { useLanguage } from '../context/LanguageContext'
import { Home, TrendingUp, Building2, ClipboardCheck, PiggyBank, Scale, ArrowRight } from 'lucide-react'

const services = [
  { key: 'buying', icon: Home },
  { key: 'selling', icon: TrendingUp },
  { key: 'rental', icon: Building2 },
  { key: 'valuation', icon: ClipboardCheck },
  { key: 'investment', icon: PiggyBank },
  { key: 'legal', icon: Scale },
]

export default function Services() {
  const { t } = useLanguage()

  return (
    <section id="services" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-[0.15em] mb-3">
            {t('services.title')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            {t('services.title')}
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="group bg-neutral-50 hover:bg-primary rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-14 h-14 bg-accent/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <Icon size={28} className="text-accent group-hover:text-accent-light transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-primary group-hover:text-white mb-3 transition-colors">
                {t(`services.${key}`)}
              </h3>
              <p className="text-neutral-500 group-hover:text-white/80 mb-6 leading-relaxed transition-colors">
                {t(`services.${key}Desc`)}
              </p>
              <span className="inline-flex items-center gap-2 text-accent group-hover:text-accent-light font-semibold text-sm transition-colors">
                {t('services.learnMore')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
