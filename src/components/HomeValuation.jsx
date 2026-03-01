import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { Home, ArrowRight } from 'lucide-react'

export default function HomeValuation() {
  const { t } = useLanguage()
  const [propertyType, setPropertyType] = useState('')
  const [postcode, setPostcode] = useState('')
  const [area, setArea] = useState(100)
  const [rooms, setRooms] = useState(3)
  const [yearBuilt, setYearBuilt] = useState(2000)
  const [result, setResult] = useState(null)

  const calculate = () => {
    if (!propertyType) return
    const rates = siteConfig.valuationRates[propertyType]
    if (!rates) return

    const ageFactor = yearBuilt >= 2010 ? 1.15 : yearBuilt >= 1990 ? 1.0 : 0.9
    const roomFactor = 1 + (rooms - 3) * 0.03
    const min = Math.round(rates.min * area * ageFactor * roomFactor)
    const max = Math.round(rates.max * area * ageFactor * roomFactor)

    setResult({ min, max })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section id="valuation" className="py-20 lg:py-28 bg-accent/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-4">
              <Home size={18} className="text-accent" />
              <span className="text-accent font-semibold text-sm">{t('valuation.title')}</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
              {t('valuation.title')}
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              {t('valuation.subtitle')}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Property type */}
              <div>
                <label className="block text-neutral-700 font-medium text-sm mb-2">
                  {t('valuation.propertyType')}
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full border-2 border-neutral-200 rounded-lg px-4 py-3 focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="">{t('valuation.propertyTypeSelect')}</option>
                  <option value="apartment">{t('valuation.apartment')}</option>
                  <option value="house">{t('valuation.house')}</option>
                  <option value="villa">{t('valuation.villa')}</option>
                  <option value="penthouse">{t('valuation.penthouse')}</option>
                </select>
              </div>

              {/* Postcode */}
              <div>
                <label className="block text-neutral-700 font-medium text-sm mb-2">
                  {t('valuation.postcode')}
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder={t('valuation.postcodePlaceholder')}
                  className="w-full border-2 border-neutral-200 rounded-lg px-4 py-3 focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              {/* Living area */}
              <div>
                <label className="block text-neutral-700 font-medium text-sm mb-2">
                  {t('valuation.livingArea')}: {area} m²
                </label>
                <input
                  type="range"
                  min="30"
                  max="500"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>30 m²</span>
                  <span>500 m²</span>
                </div>
              </div>

              {/* Rooms */}
              <div>
                <label className="block text-neutral-700 font-medium text-sm mb-2">
                  {t('valuation.rooms')}: {rooms}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Year built */}
              <div className="sm:col-span-2">
                <label className="block text-neutral-700 font-medium text-sm mb-2">
                  {t('valuation.yearBuilt')}: {yearBuilt}
                </label>
                <input
                  type="range"
                  min="1900"
                  max="2026"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>1900</span>
                  <span>2026</span>
                </div>
              </div>
            </div>

            {/* Calculate */}
            <button
              onClick={calculate}
              className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg text-lg"
            >
              {t('valuation.calculate')}
            </button>

            {/* Result */}
            {result && (
              <div className="mt-8 p-6 bg-primary rounded-xl text-center animate-fade-in-up">
                <div className="text-white/60 text-sm mb-2">{t('valuation.range')}</div>
                <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">
                  {formatPrice(result.min)} — {formatPrice(result.max)}
                </div>
                <p className="text-white/50 text-sm mb-6">
                  {t('valuation.disclaimer')}
                </p>
                <button className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 rounded-lg transition-all">
                  {t('valuation.requestValuation')}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
