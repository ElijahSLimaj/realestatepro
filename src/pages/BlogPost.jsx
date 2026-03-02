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
  ArrowLeft, Clock, Calendar, ArrowRight, BookOpen,
} from 'lucide-react'

export default function BlogPost() {
  const { slug } = useParams()
  const { t, lang } = useLanguage()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (supabaseConfigured) {
        const { data: article } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single()
        setPost(article)

        if (article) {
          const { data: related } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .neq('slug', slug)
            .order('published_at', { ascending: false })
            .limit(2)
          setRelatedPosts(related || [])
        }
      } else {
        const found = siteConfig.blogPosts.find(p => p.slug === slug || String(p.id) === String(slug))
        setPost(found || null)
        if (found) {
          setRelatedPosts(siteConfig.blogPosts.filter(p => p.id !== found.id).slice(0, 2))
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [slug])

  const getTitle = (p) =>
    supabaseConfigured ? getLocalizedField(p, 'title', lang) : p.title[lang]

  const getExcerpt = (p) =>
    supabaseConfigured ? getLocalizedField(p, 'excerpt', lang) : p.excerpt[lang]

  const getContent = (p) =>
    supabaseConfigured ? getLocalizedField(p, 'content', lang) : (p.content?.[lang] || getExcerpt(p))

  const getImage = (p) =>
    supabaseConfigured ? p.image_url : p.image

  const getDate = (p) =>
    supabaseConfigured ? (p.published_at || p.created_at) : p.date

  const getSlug = (p) =>
    supabaseConfigured ? p.slug : (p.slug || p.id)

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(lang === 'nl' ? 'nl-BE' : lang === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 text-center px-6">
          <BookOpen size={48} className="mx-auto text-neutral-300 mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">{t('blogDetail.notFound')}</h1>
          <p className="text-neutral-500 mb-6">{t('blogDetail.notFoundText')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-dark transition-colors"
          >
            <ArrowLeft size={16} />
            {t('blogDetail.back')}
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const title = getTitle(post)
  const content = getContent(post)
  const image = getImage(post)
  const readTime = post.readTime || post.read_time

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Article header */}
          <article>
            <div className="mb-8">
              <div className="flex items-center gap-4 text-neutral-400 text-sm mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(getDate(post))}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {readTime} {t('blog.minRead')}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-primary leading-tight mb-4">
                {title}
              </h1>
              <p className="text-neutral-500 text-lg leading-relaxed">
                {getExcerpt(post)}
              </p>
            </div>

            {/* Featured image */}
            <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-10">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div className="text-neutral-700 leading-relaxed whitespace-pre-line text-base">
                {content}
              </div>
            </div>
          </article>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-neutral-200 pt-10">
              <h2 className="text-2xl font-bold text-primary mb-6">{t('blogDetail.relatedPosts')}</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${getSlug(related)}`}
                    className="group bg-neutral-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={getImage(related)}
                        alt={getTitle(related)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <div className="text-neutral-400 text-sm mb-2">{formatDate(getDate(related))}</div>
                      <h3 className="font-bold text-primary group-hover:text-accent transition-colors mb-2">
                        {getTitle(related)}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-accent text-sm font-semibold">
                        {t('blog.readMore')}
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}
