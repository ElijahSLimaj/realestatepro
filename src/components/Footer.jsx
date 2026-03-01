import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const { t } = useLanguage()

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const quickLinks = [
    { label: t('nav.properties'), href: '#properties' },
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.areas'), href: '#areas' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.blog'), href: '#blog' },
  ]

  const areas = siteConfig.neighborhoods.slice(0, 5).map(n => n.name)

  return (
    <footer id="contact" className="bg-primary pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Company */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                {siteConfig.companyName.charAt(0)}
              </div>
              <div>
                <span className="text-white font-bold text-lg">{siteConfig.companyName}</span>
                <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em]">{siteConfig.tagline}</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="text-accent text-xs font-medium">
              {t('footer.nvm')} &middot; KvK: {siteConfig.kvk}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map(({ label, href }) => (
                <li key={href}>
                  <button
                    onClick={() => scrollTo(href)}
                    className="text-white/50 hover:text-accent text-sm transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('footer.serviceAreas')}</h4>
            <ul className="space-y-2">
              {areas.map((area) => (
                <li key={area}>
                  <button
                    onClick={() => scrollTo('#areas')}
                    className="text-white/50 hover:text-accent text-sm transition-colors"
                  >
                    {area}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('footer.contactTitle')}</h4>
            <div className="space-y-3">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-3 text-white/50 hover:text-accent text-sm transition-colors"
              >
                <Phone size={16} className="text-accent shrink-0" />
                {siteConfig.phone}
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-3 text-white/50 hover:text-accent text-sm transition-colors"
              >
                <Mail size={16} className="text-accent shrink-0" />
                {siteConfig.email}
              </a>
              <div className="flex items-start gap-3 text-white/50 text-sm">
                <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                {siteConfig.address}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} {siteConfig.companyName}. {t('footer.rights')}
          </div>
          <div className="flex gap-6">
            <button className="text-white/30 hover:text-white/60 text-sm transition-colors">
              {t('footer.privacy')}
            </button>
            <button className="text-white/30 hover:text-white/60 text-sm transition-colors">
              {t('footer.terms')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
