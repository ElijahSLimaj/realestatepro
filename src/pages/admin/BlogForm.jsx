import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'
import {
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react'

const LANGUAGES = [
  { code: 'nl', label: 'Nederlands' },
  { code: 'fr', label: 'Frans' },
  { code: 'en', label: 'Engels' },
]

const EMPTY_FORM = {
  slug: '',
  status: 'draft',
  read_time: 5,
  image_url: '',
  title_nl: '',
  title_fr: '',
  title_en: '',
  excerpt_nl: '',
  excerpt_fr: '',
  excerpt_en: '',
  content_nl: '',
  content_fr: '',
  content_en: '',
  published_at: '',
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function BlogForm() {
  const { tenantId } = useTenant()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [form, setForm] = useState(EMPTY_FORM)
  const [activeTab, setActiveTab] = useState('nl')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    if (isEditing) {
      fetchPost()
    }
  }, [id, tenantId])

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [success])

  async function fetchPost() {
    if (!supabaseConfigured || !tenantId) return

    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      setForm({
        slug: data.slug || '',
        status: data.status || 'draft',
        read_time: data.read_time || 5,
        image_url: data.image_url || '',
        title_nl: data.title_nl || '',
        title_fr: data.title_fr || '',
        title_en: data.title_en || '',
        excerpt_nl: data.excerpt_nl || '',
        excerpt_fr: data.excerpt_fr || '',
        excerpt_en: data.excerpt_en || '',
        content_nl: data.content_nl || '',
        content_fr: data.content_fr || '',
        content_en: data.content_en || '',
        published_at: data.published_at
          ? new Date(data.published_at).toISOString().split('T')[0]
          : '',
      })
      setSlugManuallyEdited(true) // Don't auto-generate for existing posts
    } catch (err) {
      console.error('Error fetching blog post:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field, value) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-generate slug from NL title when slug hasn't been manually edited
      if (field === 'title_nl' && !slugManuallyEdited) {
        updated.slug = generateSlug(value)
      }

      return updated
    })
  }

  function handleSlugChange(value) {
    setSlugManuallyEdited(true)
    setForm((prev) => ({ ...prev, slug: generateSlug(value) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!supabaseConfigured || !tenantId) {
      setError('Supabase is niet geconfigureerd.')
      return
    }

    if (!form.slug.trim()) {
      setError('Slug is verplicht.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload = {
        slug: form.slug.trim(),
        status: form.status,
        read_time: parseInt(form.read_time, 10) || 5,
        image_url: form.image_url.trim() || null,
        title_nl: form.title_nl.trim() || null,
        title_fr: form.title_fr.trim() || null,
        title_en: form.title_en.trim() || null,
        excerpt_nl: form.excerpt_nl.trim() || null,
        excerpt_fr: form.excerpt_fr.trim() || null,
        excerpt_en: form.excerpt_en.trim() || null,
        content_nl: form.content_nl.trim() || null,
        content_fr: form.content_fr.trim() || null,
        content_en: form.content_en.trim() || null,
        published_at:
          form.status === 'published' && form.published_at
            ? new Date(form.published_at).toISOString()
            : form.status === 'published'
              ? new Date().toISOString()
              : null,
        updated_at: new Date().toISOString(),
      }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('tenant_id', tenantId)
          .eq('id', id)

        if (updateError) throw updateError
        setSuccess('Artikel succesvol bijgewerkt.')
      } else {
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert([{ ...payload, tenant_id: tenantId }])

        if (insertError) throw insertError
        setSuccess('Artikel succesvol aangemaakt.')
        navigate('/admin/blog')
      }
    } catch (err) {
      console.error('Error saving blog post:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Supabase not configured
  if (!supabaseConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-primary">
            {isEditing ? 'Artikel bewerken' : 'Nieuw artikel'}
          </h1>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            Supabase niet geconfigureerd
          </h3>
          <p className="text-neutral-500 max-w-md mx-auto">
            Configureer je Supabase omgevingsvariabelen om blogartikelen te beheren.
          </p>
        </div>
      </div>
    )
  }

  // Loading existing post
  if (isEditing && loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-primary">Artikel bewerken</h1>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-primary">
            {isEditing ? 'Artikel bewerken' : 'Nieuw artikel'}
          </h1>
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error/5 border border-error/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-error shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-xl">
          <CheckCircle className="w-5 h-5 text-success shrink-0" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-primary mb-4">
            Meta-informatie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="artikel-url-slug"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Wordt automatisch gegenereerd uit de NL titel
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full ps-3 pe-10 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors bg-white"
              >
                <option value="draft">Concept</option>
                <option value="published">Gepubliceerd</option>
              </select>
            </div>

            {/* Read Time */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Leestijd (minuten)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={form.read_time}
                onChange={(e) => handleChange('read_time', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Afbeelding URL
              </label>
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://voorbeeld.nl/afbeelding.jpg"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>

            {/* Published At (only shown when published) */}
            {form.status === 'published' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Publicatiedatum
                </label>
                <input
                  type="date"
                  value={form.published_at}
                  onChange={(e) => handleChange('published_at', e.target.value)}
                  className="w-full ps-3 pe-10 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
              </div>
            )}
          </div>

          {/* Image preview */}
          {form.image_url && (
            <div className="mt-4">
              <p className="text-sm font-medium text-neutral-700 mb-1.5">
                Voorbeeld
              </p>
              <div className="w-48 h-32 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div
                  className="w-full h-full items-center justify-center hidden"
                >
                  <ImageIcon className="w-8 h-8 text-neutral-300" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content tabs */}
        <div className="bg-white rounded-xl border border-neutral-200">
          {/* Tab headers */}
          <div className="border-b border-neutral-200">
            <div className="flex">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveTab(lang.code)}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                    activeTab === lang.code
                      ? 'text-accent'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {lang.label}
                  {activeTab === lang.code && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6 space-y-4">
            {LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className={activeTab === lang.code ? 'space-y-4' : 'hidden'}
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Titel ({lang.label})
                  </label>
                  <input
                    type="text"
                    value={form[`title_${lang.code}`]}
                    onChange={(e) =>
                      handleChange(`title_${lang.code}`, e.target.value)
                    }
                    placeholder={`Titel in het ${lang.label}`}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Samenvatting ({lang.label})
                  </label>
                  <textarea
                    value={form[`excerpt_${lang.code}`]}
                    onChange={(e) =>
                      handleChange(`excerpt_${lang.code}`, e.target.value)
                    }
                    placeholder={`Korte samenvatting in het ${lang.label}`}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-y"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Inhoud ({lang.label})
                  </label>
                  <textarea
                    value={form[`content_${lang.code}`]}
                    onChange={(e) =>
                      handleChange(`content_${lang.code}`, e.target.value)
                    }
                    placeholder={`Volledige inhoud in het ${lang.label}`}
                    rows={12}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Bijwerken' : 'Aanmaken'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
