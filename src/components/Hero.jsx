import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { ArrowRight, ChevronDown, Shield, Award, Star, Clock, Search } from 'lucide-react'

export default function Hero() {
  const { t } = useLanguage()
  const { stats } = siteConfig
  const [searchMode, setSearchMode] = useState('buy')

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/95 via-primary/85 to-primary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:pt-44 lg:pb-0 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
            <Award size={16} className="text-accent" />
            <span className="text-white/90 text-sm font-medium">
              {t('hero.badge', { years: stats.yearsActive })}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fade-in-up delay-100">
            {t('hero.title')}
            <br />
            <span className="text-accent">{t('hero.titleHighlight')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed animate-fade-in-up delay-200">
            {t('hero.subtitle', { years: stats.yearsActive })}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up delay-300">
            <button
              onClick={() => scrollTo('#valuation')}
              className="group bg-accent hover:bg-accent-dark text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-2xl hover:-translate-y-0.5 text-lg flex items-center justify-center gap-2 animate-pulse-glow"
            >
              {t('hero.cta')}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollTo('#properties')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-all text-lg"
            >
              {t('hero.ctaSecondary')}
            </button>
          </div>
        </div>

        {/* Property Search Bar */}
        <div className="animate-fade-in-up delay-400 mb-16">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 lg:p-4">
            {/* Buy/Rent toggle */}
            <div className="flex gap-2 mb-6 lg:mb-5 lg:inline-flex">
              <button
                onClick={() => setSearchMode('buy')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  searchMode === 'buy'
                    ? 'bg-accent text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {t('hero.searchModeBuy')}
              </button>
              <button
                onClick={() => setSearchMode('rent')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  searchMode === 'rent'
                    ? 'bg-accent text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {t('hero.searchModeRent')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:items-end">
              {/* Location */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1 lg:hidden">{t('hero.searchLocation')}</label>
                <input
                  type="text"
                  placeholder={t('hero.searchLocationPlaceholder')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1 lg:hidden">{t('hero.searchType')}</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors appearance-none">
                  <option value="" className="text-neutral-800">{t('hero.searchTypeAll')}</option>
                  <option value="apartment" className="text-neutral-800">{t('hero.searchTypeApartment')}</option>
                  <option value="house" className="text-neutral-800">{t('hero.searchTypeHouse')}</option>
                  <option value="villa" className="text-neutral-800">{t('hero.searchTypeVilla')}</option>
                  <option value="penthouse" className="text-neutral-800">{t('hero.searchTypePenthouse')}</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1 lg:hidden">{t('hero.searchPrice')}</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors appearance-none">
                  <option value="" className="text-neutral-800">{t('hero.searchPriceAny')}</option>
                  <option value="250000" className="text-neutral-800">{searchMode === 'buy' ? '€250.000' : '€1.000/m'}</option>
                  <option value="500000" className="text-neutral-800">{searchMode === 'buy' ? '€500.000' : '€2.000/m'}</option>
                  <option value="750000" className="text-neutral-800">{searchMode === 'buy' ? '€750.000' : '€3.000/m'}</option>
                  <option value="1000000" className="text-neutral-800">{searchMode === 'buy' ? '€1.000.000' : '€5.000/m'}</option>
                </select>
              </div>

              {/* Search button */}
              <button className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2">
                <Search size={18} />
                {t('hero.searchButton')}
              </button>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-500 pb-16">
          {[
            { icon: Clock, text: t('hero.trustYears', { years: stats.yearsActive }) },
            { icon: Award, text: t('hero.trustProperties', { count: stats.propertiesSold }) },
            { icon: Star, text: t('hero.trustRating', { rating: stats.googleRating }) },
            { icon: Shield, text: t('hero.trustClients', { count: stats.happyClients }) },
          ].map(({ icon: Icon, text }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
            >
              <Icon size={20} className="text-accent shrink-0" />
              <span className="text-white text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo('#properties')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator text-white/50 hover:text-white transition-colors"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  )
}
