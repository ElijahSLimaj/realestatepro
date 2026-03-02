import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { supabaseConfigured } from '../lib/supabase'
import { getLocalizedField } from '../lib/utils'
import { Link } from 'react-router-dom'
import { Bed, Bath, Maximize, ArrowRight } from 'lucide-react'

export default function FeaturedProperties() {
  const { t, lang } = useLanguage()
  const [activeFilter, setActiveFilter] = useState('all')

  const { data: dbProperties } = useSupabaseQuery('properties', {
    filters: { is_featured: true, status: 'active' },
    fallbackData: [],
  })

  const properties = supabaseConfigured ? dbProperties : siteConfig.properties

  const filters = [
    { key: 'all', label: t('properties.filterAll') },
    { key: 'sale', label: t('properties.filterSale') },
    { key: 'rent', label: t('properties.filterRent') },
  ]

  const filtered = activeFilter === 'all'
    ? properties
    : properties.filter(p => p.type === activeFilter)

  const formatPrice = (price, type) => {
    const formatted = new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price)
    return type === 'rent' ? `${formatted}${t('properties.perMonth')}` : formatted
  }

  return (
    <section id="properties" className="py-20 lg:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-[0.15em] mb-3">
            {t('properties.title')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            {t('properties.title')}
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            {t('properties.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-10">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === key
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <Link
              to={`/property/${property.id}`}
              key={property.id}
              className="property-card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={supabaseConfigured ? property.images?.[0] : property.image}
                  alt={supabaseConfigured ? getLocalizedField(property, 'title', lang) : property.title[lang]}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    property.type === 'sale' ? 'bg-primary' : 'bg-accent'
                  }`}>
                    {property.type === 'sale' ? t('properties.forSale') : t('properties.forRent')}
                  </span>
                  {property.isNew && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-success">
                      {t('properties.new')}
                    </span>
                  )}
                </div>
                {/* Price */}
                <div className="absolute bottom-4 left-4">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">
                    {formatPrice(property.price, property.type)}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-accent transition-colors">
                  {supabaseConfigured ? getLocalizedField(property, 'title', lang) : property.title[lang]}
                </h3>
                <p className="text-neutral-500 text-sm mb-4">
                  {property.address}, {property.city}
                </p>
                <div className="flex items-center gap-4 text-neutral-500 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Bed size={16} />
                    {property.beds} {t('properties.beds')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath size={16} />
                    {property.baths} {t('properties.baths')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize size={16} />
                    {property.area} {t('properties.area')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <button className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg">
            {t('properties.viewAll')}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  )
}
