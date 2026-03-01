import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

export default function Testimonials() {
  const { t, lang } = useLanguage()
  const [current, setCurrent] = useState(0)
  const reviews = siteConfig.testimonials

  const prev = () => setCurrent((c) => (c === 0 ? reviews.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === reviews.length - 1 ? 0 : c + 1))

  return (
    <section id="reviews" className="py-20 lg:py-28 bg-primary">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-[0.15em] mb-3">
            {t('testimonials.title')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Carousel */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 lg:p-12">
            <Quote size={48} className="text-accent/30 mb-6" />
            <p className="text-white text-lg lg:text-xl leading-relaxed mb-8">
              &ldquo;{reviews[current].text[lang]}&rdquo;
            </p>
            <div>
              <div className="font-bold text-white text-lg">{reviews[current].name}</div>
              <div className="text-accent text-sm">{reviews[current].propertyType[lang]}</div>
              <div className="text-white/50 text-sm">{reviews[current].location}</div>
              <div className="flex gap-0.5 mt-2">
                {[...Array(reviews[current].rating)].map((_, i) => (
                  <span key={i} className="text-accent">&#9733;</span>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? 'bg-accent w-8' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
