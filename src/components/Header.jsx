import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { Menu, X, Phone, Globe, ChevronDown } from 'lucide-react'

const langLabels = { nl: 'NL', fr: 'FR', en: 'EN' }

export default function Header() {
  const { t, lang, switchLang } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langDropdown, setLangDropdown] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { key: 'properties', href: '#properties' },
    { key: 'services', href: '#services' },
    { key: 'areas', href: '#areas' },
    { key: 'about', href: '#about' },
    { key: 'blog', href: '#blog' },
    { key: 'contact', href: '#contact' },
  ]

  const scrollTo = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-transparent py-6'
      }`}
    >
      {/* Top bar */}
      <div className={`hidden lg:block border-b transition-colors duration-300 ${scrolled ? 'border-neutral-200' : 'border-white/20'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-2.5 text-sm">
          <a
            href={`tel:${siteConfig.phone}`}
            className={`flex items-center gap-2 font-medium transition-colors ${
              scrolled ? 'text-primary hover:text-accent' : 'text-white hover:text-accent-light'
            }`}
          >
            <Phone size={14} />
            {siteConfig.phone}
          </a>
          <div className="relative">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                scrolled ? 'text-neutral-600 hover:text-primary' : 'text-white/80 hover:text-white'
              }`}
            >
              <Globe size={14} />
              {langLabels[lang]}
              <ChevronDown size={12} />
            </button>
            {langDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-neutral-100 py-1 min-w-[80px]">
                {Object.entries(langLabels).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => { switchLang(code); setLangDropdown(false) }}
                    className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-neutral-50 transition-colors ${
                      lang === code ? 'text-accent font-semibold' : 'text-neutral-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-3">
        <a href="#" className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
            scrolled ? 'bg-primary text-accent' : 'bg-white/10 backdrop-blur-sm text-accent border border-white/20'
          }`}>
            {siteConfig.companyName.charAt(0)}
          </div>
          <div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-primary' : 'text-white'}`}>
              {siteConfig.companyName}
            </span>
            <span className={`block text-[10px] uppercase tracking-[0.2em] ${scrolled ? 'text-neutral-400' : 'text-white/60'}`}>
              {siteConfig.tagline}
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map(({ key, href }) => (
            <button
              key={key}
              onClick={() => scrollTo(href)}
              className={`text-sm font-medium transition-colors relative group ${
                scrolled ? 'text-neutral-600 hover:text-primary' : 'text-white/90 hover:text-white'
              }`}
            >
              {t(`nav.${key}`)}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={() => scrollTo('#valuation')}
            className="bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm"
          >
            {t('nav.valuation')}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-primary' : 'text-white'}`}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-100 shadow-xl">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navItems.map(({ key, href }) => (
              <button
                key={key}
                onClick={() => scrollTo(href)}
                className="text-left py-3 px-4 text-neutral-700 hover:text-primary hover:bg-neutral-50 rounded-lg font-medium transition-colors"
              >
                {t(`nav.${key}`)}
              </button>
            ))}
            <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-3">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-2 py-3 px-4 text-primary font-semibold"
              >
                <Phone size={18} /> {siteConfig.phone}
              </a>
              <button
                onClick={() => scrollTo('#valuation')}
                className="bg-accent text-white font-semibold py-3 px-4 rounded-lg text-center"
              >
                {t('nav.valuation')}
              </button>
              <div className="flex gap-2 px-4">
                {Object.entries(langLabels).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => { switchLang(code); setMenuOpen(false) }}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      lang === code ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
