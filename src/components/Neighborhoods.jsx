import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { supabaseConfigured } from '../lib/supabase'
import { getLocalizedField } from '../lib/utils'
import { Link } from 'react-router-dom'
import { MapPin, Home, ArrowRight } from 'lucide-react'

export default function Neighborhoods() {
  const { t, lang } = useLanguage()

  const { data: dbNeighborhoods } = useSupabaseQuery('neighborhoods', {
    order: { column: 'sort_order' },
    fallbackData: [],
  })

  const neighborhoods = supabaseConfigured ? dbNeighborhoods : siteConfig.neighborhoods

  const formatPrice = (price) => {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section id="areas" className="py-20 lg:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-[0.15em] mb-3">
            {t('neighborhoods.title')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            {t('neighborhoods.title')}
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            {t('neighborhoods.subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {neighborhoods.map((area) => (
            <Link
              to={`/neighborhood/${area.id}`}
              key={area.id}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Image */}
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={supabaseConfigured ? area.image_url : area.image}
                  alt={area.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/40 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {area.name}
                </h3>
                <p className="text-white/70 text-sm mb-4 leading-relaxed line-clamp-2">
                  {supabaseConfigured ? getLocalizedField(area, 'description', lang) : area.description[lang]}
                </p>
                <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-accent" />
                    {t('neighborhoods.avgPrice')}: {formatPrice(area.avg_price || area.avgPrice)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Home size={14} className="text-accent" />
                    {area.listing_count || area.listingCount} {t('neighborhoods.listings')}
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 text-accent font-semibold text-sm group-hover:text-accent-light transition-colors">
                  {t('neighborhoods.explore')}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
