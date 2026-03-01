import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { Shield, Award, Heart, Target } from 'lucide-react'

function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const duration = 2000
          const start = performance.now()
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])

  return (
    <span ref={ref} className="counter-value text-4xl lg:text-5xl font-bold text-accent">
      {count}{suffix}
    </span>
  )
}

export default function About() {
  const { t } = useLanguage()
  const { stats } = siteConfig

  const values = [
    { key: 'valueTrust', icon: Shield },
    { key: 'valueExpertise', icon: Award },
    { key: 'valuePersonal', icon: Heart },
    { key: 'valueResults', icon: Target },
  ]

  return (
    <section id="about" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-[0.15em] mb-3">
            {t('about.subtitle')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            {t('about.title')}
          </h2>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
              alt="About VastGoed Elite"
              className="rounded-2xl shadow-lg w-full aspect-[4/3] object-cover"
            />
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 hidden lg:block">
              <div className="text-3xl font-bold text-accent mb-1">{stats.googleRating}</div>
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-lg">&#9733;</span>
                ))}
              </div>
              <div className="text-neutral-500 text-sm">Google Reviews</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-neutral-600 text-lg leading-relaxed mb-6">
              {t('about.description')}
            </p>
            <p className="text-neutral-500 leading-relaxed mb-8 italic border-l-4 border-accent pl-4">
              {t('about.mission')}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <AnimatedCounter end={stats.yearsActive} suffix="+" />
                <div className="text-neutral-500 text-sm mt-1">{t('about.statsYears')}</div>
              </div>
              <div>
                <AnimatedCounter end={stats.propertiesSold} suffix="+" />
                <div className="text-neutral-500 text-sm mt-1">{t('about.statsProperties')}</div>
              </div>
              <div>
                <AnimatedCounter end={stats.happyClients} suffix="+" />
                <div className="text-neutral-500 text-sm mt-1">{t('about.statsClients')}</div>
              </div>
              <div>
                <AnimatedCounter end={stats.teamMembers} />
                <div className="text-neutral-500 text-sm mt-1">{t('about.statsTeam')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-2xl font-bold text-primary text-center mb-10">
            {t('about.values')}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ key, icon: Icon }) => (
              <div key={key} className="text-center p-6 rounded-2xl bg-neutral-50 hover:bg-primary group transition-all duration-300 hover:shadow-lg">
                <div className="w-14 h-14 bg-accent/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Icon size={28} className="text-accent group-hover:text-accent-light transition-colors" />
                </div>
                <h4 className="text-lg font-bold text-primary group-hover:text-white mb-2 transition-colors">
                  {t(`about.${key}`)}
                </h4>
                <p className="text-neutral-500 group-hover:text-white/80 text-sm leading-relaxed transition-colors">
                  {t(`about.${key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
