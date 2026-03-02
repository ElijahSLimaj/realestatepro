import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { siteConfig } from '../data/siteConfig'
import { getLocalizedField } from '../lib/utils'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ChatWidget from '../components/ChatWidget'
import {
  ArrowLeft, MapPin, Home, Bed, Bath, Maximize,
  Building2, TrendingUp, ArrowRight,
} from 'lucide-react'

export default function NeighborhoodDetail() {
  const { id } = useParams()
  const { t, lang } = useLanguage()
  const [neighborhood, setNeighborhood] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (supabaseConfigured) {
        const { data: area } = await supabase
          .from('neighborhoods')
          .select('*')
          .eq('id', id)
          .single()
        setNeighborhood(area)

        if (area) {
          const { data: props } = await supabase
            .from('properties')
            .select('*')
            .ilike('city', `%${area.name.split(' ')[0]}%`)
            .eq('status', 'active')
          setProperties(props || [])
        }
      } else {
        const found = siteConfig.neighborhoods.find(n => String(n.id) === String(id))
        setNeighborhood(found || null)

        if (found) {
          const cityMatch = found.name.split(' ')[0].toLowerCase()
          const props = siteConfig.properties.filter(p =>
            p.city.toLowerCase().includes(cityMatch)
          )
          setProperties(props)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const getDescription = (area) =>
    supabaseConfigured ? getLocalizedField(area, 'description', lang) : area.description?.[lang]

  const getTitle = (p) =>
    supabaseConfigured ? getLocalizedField(p, 'title', lang) : p.title[lang]

  const formatPrice = (price, type) => {
    const formatted = new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price)
    return type === 'rent' ? `${formatted}${t('properties.perMonth')}` : formatted
  }

  const formatAvgPrice = (price) =>
    new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price)

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

  if (!neighborhood) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 text-center px-6">
          <MapPin size={48} className="mx-auto text-neutral-300 mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">{t('neighborhoodDetail.notFound')}</h1>
          <p className="text-neutral-500 mb-6">{t('neighborhoodDetail.notFoundText')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-dark transition-colors"
          >
            <ArrowLeft size={16} />
            {t('neighborhoodDetail.back')}
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const image = supabaseConfigured ? neighborhood.image_url : neighborhood.image
  const description = getDescription(neighborhood)
  const avgPrice = supabaseConfigured ? neighborhood.avg_price : neighborhood.avgPrice
  const listingCount = supabaseConfigured ? neighborhood.listing_count : neighborhood.listingCount

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[21/9] mb-8">
            <img
              src={image}
              alt={neighborhood.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3">{neighborhood.name}</h1>
              <p className="text-white/80 text-lg max-w-3xl leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-xl border border-neutral-100 p-5 text-center shadow-sm">
              <TrendingUp size={22} className="mx-auto text-accent mb-2" />
              <div className="text-xl font-bold text-primary">{formatAvgPrice(avgPrice)}</div>
              <div className="text-xs text-neutral-500">{t('neighborhoodDetail.avgPrice')}</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-100 p-5 text-center shadow-sm">
              <Home size={22} className="mx-auto text-accent mb-2" />
              <div className="text-xl font-bold text-primary">{listingCount}</div>
              <div className="text-xs text-neutral-500">{t('neighborhoodDetail.totalListings')}</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-100 p-5 text-center shadow-sm">
              <Building2 size={22} className="mx-auto text-accent mb-2" />
              <div className="text-xl font-bold text-primary">{properties.length}</div>
              <div className="text-xs text-neutral-500">{t('neighborhoodDetail.availableNow')}</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-100 p-5 text-center shadow-sm">
              <MapPin size={22} className="mx-auto text-accent mb-2" />
              <div className="text-xl font-bold text-primary">{neighborhood.name}</div>
              <div className="text-xs text-neutral-500">{t('neighborhoodDetail.location')}</div>
            </div>
          </div>

          {/* Properties in this area */}
          <h2 className="text-2xl font-bold text-primary mb-6">
            {t('neighborhoodDetail.propertiesIn')} {neighborhood.name}
          </h2>

          {properties.length === 0 ? (
            <div className="bg-neutral-50 rounded-2xl p-12 text-center">
              <Building2 size={40} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">{t('neighborhoodDetail.noProperties')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link
                  to={`/property/${property.id}`}
                  key={property.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={supabaseConfigured ? property.images?.[0] : property.image}
                      alt={getTitle(property)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        property.type === 'sale' ? 'bg-primary' : 'bg-accent'
                      }`}>
                        {property.type === 'sale' ? t('properties.forSale') : t('properties.forRent')}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="text-2xl font-bold text-white drop-shadow-lg">
                        {formatPrice(property.price, property.type)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-accent transition-colors">
                      {getTitle(property)}
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
          )}

          {/* CTA */}
          <div className="mt-12 bg-primary rounded-2xl p-8 lg:p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              {t('neighborhoodDetail.ctaTitle')}
            </h3>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              {t('neighborhoodDetail.ctaText')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg"
            >
              {t('neighborhoodDetail.ctaButton')}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}
