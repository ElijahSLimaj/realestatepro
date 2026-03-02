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
  ArrowLeft, Bed, Bath, Maximize, Calendar, MapPin,
  Building2, Clock, Check, Send, ChevronLeft, ChevronRight,
} from 'lucide-react'

export default function PropertyDetail() {
  const { id } = useParams()
  const { t, lang } = useLanguage()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  // Viewing form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function fetchProperty() {
      if (supabaseConfigured) {
        const { data } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single()
        setProperty(data)
      } else {
        // Fallback: find by id in static data
        const found = siteConfig.properties.find(p => String(p.id) === String(id))
        setProperty(found || null)
      }
      setLoading(false)
    }
    fetchProperty()
  }, [id])

  const getTitle = (p) =>
    supabaseConfigured ? getLocalizedField(p, 'title', lang) : p.title[lang]

  const getDescription = (p) =>
    supabaseConfigured ? getLocalizedField(p, 'description', lang) : p.description?.[lang]

  const getImages = (p) => {
    if (supabaseConfigured) return p.images || []
    return p.image ? [p.image] : []
  }

  const formatPrice = (price, type) => {
    const formatted = new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price)
    return type === 'rent' ? `${formatted}${t('detail.perMonth')}` : formatted
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !preferredDate || !preferredTime) return
    setSubmitting(true)

    if (supabaseConfigured) {
      await supabase.from('viewings').insert({
        property_id: id,
        name,
        email: email || null,
        phone: phone || null,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        message: message || null,
      })
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  // Get min date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

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

  if (!property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 text-center px-6">
          <Building2 size={48} className="mx-auto text-neutral-300 mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">{t('detail.notFound')}</h1>
          <p className="text-neutral-500 mb-6">{t('detail.notFoundText')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-dark transition-colors"
          >
            <ArrowLeft size={16} />
            {t('detail.back')}
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const images = getImages(property)
  const title = getTitle(property)
  const description = getDescription(property)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left column: images + details */}
            <div className="lg:col-span-3">
              {/* Image gallery */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4">
                <img
                  src={images[activeImage] || 'https://placehold.co/800x500/0C1D2E/C8944A?text=No+Image'}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold text-white ${
                    property.type === 'sale' ? 'bg-primary' : 'bg-accent'
                  }`}>
                    {property.type === 'sale' ? t('detail.forSale') : t('detail.forRent')}
                  </span>
                  {(property.is_new || property.isNew) && (
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white bg-success">
                      {t('detail.new')}
                    </span>
                  )}
                </div>
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage(i => i === 0 ? images.length - 1 : i - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setActiveImage(i => i === images.length - 1 ? 0 : i + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mb-8">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activeImage ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title + price */}
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">{title}</h1>
                <div className="flex items-center gap-2 text-neutral-500 mb-4">
                  <MapPin size={16} />
                  <span>{property.address}, {property.city}</span>
                  {property.postcode && <span>· {property.postcode}</span>}
                </div>
                <div className="text-3xl font-bold text-accent">
                  {formatPrice(property.price, property.type)}
                </div>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                  <Bed size={20} className="mx-auto text-accent mb-2" />
                  <div className="text-lg font-bold text-primary">{property.beds}</div>
                  <div className="text-xs text-neutral-500">{t('detail.beds')}</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                  <Bath size={20} className="mx-auto text-accent mb-2" />
                  <div className="text-lg font-bold text-primary">{property.baths}</div>
                  <div className="text-xs text-neutral-500">{t('detail.baths')}</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                  <Maximize size={20} className="mx-auto text-accent mb-2" />
                  <div className="text-lg font-bold text-primary">{property.area} m²</div>
                  <div className="text-xs text-neutral-500">{t('detail.area')}</div>
                </div>
                {property.year_built || property.yearBuilt ? (
                  <div className="bg-neutral-50 rounded-xl p-4 text-center">
                    <Calendar size={20} className="mx-auto text-accent mb-2" />
                    <div className="text-lg font-bold text-primary">{property.year_built || property.yearBuilt}</div>
                    <div className="text-xs text-neutral-500">{t('detail.yearBuilt')}</div>
                  </div>
                ) : null}
              </div>

              {/* Description */}
              {description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-primary mb-4">{t('detail.description')}</h2>
                  <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              )}
            </div>

            {/* Right column: scheduling form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 lg:p-8 sticky top-28">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Clock size={20} className="text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-primary">{t('detail.scheduleVisit')}</h2>
                </div>
                <p className="text-neutral-500 text-sm mb-6">{t('detail.scheduleSubtitle')}</p>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-success" />
                    </div>
                    <p className="text-success font-semibold text-lg">{t('detail.success')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">{t('detail.yourName')} *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full border-2 border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('detail.email')}</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border-2 border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('detail.phone')}</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full border-2 border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('detail.preferredDate')} *</label>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          min={minDate}
                          required
                          className="w-full border-2 border-neutral-200 rounded-lg ps-4 pe-10 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('detail.preferredTime')} *</label>
                        <select
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          required
                          className="w-full border-2 border-neutral-200 rounded-lg ps-4 pe-10 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                        >
                          <option value="">&mdash;</option>
                          <option value="morning">{t('detail.morning')}</option>
                          <option value="afternoon">{t('detail.afternoon')}</option>
                          <option value="evening">{t('detail.evening')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">{t('detail.message')}</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder={t('detail.messagePlaceholder')}
                        className="w-full border-2 border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group w-full bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send size={16} />
                      {t('detail.submit')}
                    </button>
                  </form>
                )}
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
