import { useLanguage } from '../context/LanguageContext'
import { siteConfig } from '../data/siteConfig'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { supabaseConfigured } from '../lib/supabase'
import { getLocalizedField } from '../lib/utils'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'

export default function Blog() {
  const { t, lang } = useLanguage()

  const { data: dbPosts } = useSupabaseQuery('blog_posts', {
    filters: { status: 'published' },
    order: { column: 'published_at', ascending: false },
    fallbackData: [],
  })

  const posts = supabaseConfigured && dbPosts.length > 0
    ? dbPosts
    : siteConfig.blogPosts

  const isDbData = supabaseConfigured && dbPosts.length > 0

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(lang === 'nl' ? 'nl-BE' : lang === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPostTitle = (post) =>
    isDbData ? getLocalizedField(post, 'title', lang) : post.title[lang]

  const getPostExcerpt = (post) =>
    isDbData ? getLocalizedField(post, 'excerpt', lang) : post.excerpt[lang]

  const getPostImage = (post) =>
    isDbData ? post.image_url : post.image

  const getPostDate = (post) =>
    isDbData ? (post.published_at || post.created_at) : post.date

  const getPostSlug = (post) =>
    isDbData ? post.slug : (post.slug || post.id)

  return (
    <section id="blog" className="py-20 lg:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-[0.15em] mb-3">
            {t('blog.title')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            {t('blog.title')}
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              to={`/blog/${getPostSlug(post)}`}
              key={post.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={getPostImage(post)}
                  alt={getPostTitle(post)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-neutral-400 text-sm mb-3">
                  <span>{formatDate(getPostDate(post))}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.readTime || post.read_time} {t('blog.minRead')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary group-hover:text-accent mb-3 transition-colors leading-snug">
                  {getPostTitle(post)}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed mb-4">
                  {getPostExcerpt(post)}
                </p>
                <span className="inline-flex items-center gap-2 text-accent font-semibold text-sm group-hover:text-accent-dark transition-colors">
                  {t('blog.readMore')}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
