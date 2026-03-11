import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'
import {
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  ImageOff,
  X,
} from 'lucide-react'

const emptyForm = {
  type: 'sale',
  category: 'apartment',
  status: 'draft',
  is_featured: false,
  is_new: false,
  address: '',
  city: '',
  postcode: '',
  price: '',
  beds: '',
  baths: '',
  area: '',
  year_built: '',
  title_nl: '',
  title_fr: '',
  title_en: '',
  description_nl: '',
  description_fr: '',
  description_en: '',
  images: '[]',
}

const typeOptions = [
  { value: 'sale', label: 'Koop' },
  { value: 'rent', label: 'Huur' },
]

const categoryOptions = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Huis' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
]

const statusOptions = [
  { value: 'active', label: 'Actief' },
  { value: 'sold', label: 'Verkocht' },
  { value: 'rented', label: 'Verhuurd' },
  { value: 'draft', label: 'Concept' },
]

const langTabs = [
  { key: 'nl', label: 'Nederlands' },
  { key: 'fr', label: 'Frans' },
  { key: 'en', label: 'Engels' },
]

export default function PropertyForm() {
  const { tenantId } = useTenant()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [form, setForm] = useState(emptyForm)
  const [activeLang, setActiveLang] = useState('nl')
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (isEditing && supabaseConfigured && tenantId) {
      fetchProperty()
    }
  }, [id, tenantId])

  async function fetchProperty() {
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      setForm({
        type: data.type || 'sale',
        category: data.category || 'apartment',
        status: data.status || 'draft',
        is_featured: data.is_featured || false,
        is_new: data.is_new || false,
        address: data.address || '',
        city: data.city || '',
        postcode: data.postcode || '',
        price: data.price ?? '',
        beds: data.beds ?? '',
        baths: data.baths ?? '',
        area: data.area ?? '',
        year_built: data.year_built ?? '',
        title_nl: data.title_nl || '',
        title_fr: data.title_fr || '',
        title_en: data.title_en || '',
        description_nl: data.description_nl || '',
        description_fr: data.description_fr || '',
        description_en: data.description_en || '',
        images: JSON.stringify(data.images || [], null, 2),
      })
    } catch (err) {
      console.error('Error fetching property:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      // Parse images JSON
      let parsedImages
      try {
        parsedImages = JSON.parse(form.images)
        if (!Array.isArray(parsedImages)) {
          throw new Error('Images must be a JSON array')
        }
      } catch {
        throw new Error(
          'Ongeldige JSON voor afbeeldingen. Gebruik een geldige JSON-array, bijv. ["url1", "url2"]'
        )
      }

      const record = {
        type: form.type,
        category: form.category,
        status: form.status,
        is_featured: form.is_featured,
        is_new: form.is_new,
        address: form.address || null,
        city: form.city || null,
        postcode: form.postcode || null,
        price: parseFloat(form.price) || 0,
        beds: parseInt(form.beds, 10) || 0,
        baths: parseInt(form.baths, 10) || 0,
        area: parseInt(form.area, 10) || 0,
        year_built: form.year_built ? parseInt(form.year_built, 10) : null,
        title_nl: form.title_nl || null,
        title_fr: form.title_fr || null,
        title_en: form.title_en || null,
        description_nl: form.description_nl || null,
        description_fr: form.description_fr || null,
        description_en: form.description_en || null,
        images: parsedImages,
        updated_at: new Date().toISOString(),
      }

      let result
      if (isEditing) {
        result = await supabase
          .from('properties')
          .update(record)
          .eq('tenant_id', tenantId)
          .eq('id', id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('properties')
          .insert({ ...record, tenant_id: tenantId })
          .select()
          .single()
      }

      if (result.error) throw result.error

      setSuccess(
        isEditing
          ? 'Woning succesvol bijgewerkt!'
          : 'Woning succesvol aangemaakt!'
      )

      // If new property, redirect to edit page
      if (!isEditing && result.data?.id) {
        setTimeout(() => {
          navigate(`/admin/properties/${result.data.id}`, { replace: true })
        }, 1000)
      }
    } catch (err) {
      console.error('Error saving property:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Parse images for preview
  let imagePreviewList = []
  try {
    const parsed = JSON.parse(form.images)
    if (Array.isArray(parsed)) imagePreviewList = parsed
  } catch {
    // ignore parse errors for preview
  }

  // Not configured
  if (!supabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">
          Supabase niet geconfigureerd
        </h3>
        <p className="text-neutral-500 max-w-md">
          Stel de omgevingsvariabelen in om woningen te beheren.
        </p>
      </div>
    )
  }

  // Loading existing property
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/properties"
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {isEditing ? 'Woning bewerken' : 'Nieuwe woning'}
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {isEditing
              ? 'Pas de gegevens van deze woning aan'
              : 'Vul de gegevens in voor een nieuwe woning'}
          </p>
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error rounded-lg px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto shrink-0 p-0.5 hover:bg-error/10 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success/20 text-success rounded-lg px-4 py-3 text-sm flex items-start gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto shrink-0 p-0.5 hover:bg-success/10 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Info ── */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-primary mb-4">
            Basisinformatie
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full ps-3 pe-10 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Categorie
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full ps-3 pe-10 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full ps-3 pe-10 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured checkbox */}
            <div className="flex items-center gap-3 sm:col-span-1">
              <label className="relative inline-flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-neutral-300 text-accent focus:ring-accent/30"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Uitgelicht
                </span>
              </label>
            </div>

            {/* New badge checkbox */}
            <div className="flex items-center gap-3 sm:col-span-1">
              <label className="relative inline-flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_new"
                  checked={form.is_new}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-neutral-300 text-accent focus:ring-accent/30"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Nieuw-badge
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* ── Location ── */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-primary mb-4">Locatie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Adres
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Keizersgracht 123"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Stad
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Antwerpen"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Postcode
              </label>
              <input
                type="text"
                name="postcode"
                value={form.postcode}
                onChange={handleChange}
                placeholder="1015 AB"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
          </div>
        </section>

        {/* ── Details ── */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-primary mb-4">Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Prijs (EUR)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="450000"
                min="0"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Slaapkamers
              </label>
              <input
                type="number"
                name="beds"
                value={form.beds}
                onChange={handleChange}
                placeholder="3"
                min="0"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Badkamers
              </label>
              <input
                type="number"
                name="baths"
                value={form.baths}
                onChange={handleChange}
                placeholder="2"
                min="0"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Oppervlakte (m2)
              </label>
              <input
                type="number"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="120"
                min="0"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Bouwjaar
              </label>
              <input
                type="number"
                name="year_built"
                value={form.year_built}
                onChange={handleChange}
                placeholder="1920"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
          </div>
        </section>

        {/* ── Descriptions (NL / FR / EN tabs) ── */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-primary mb-4">
            Beschrijvingen
          </h2>

          {/* Language tabs */}
          <div className="flex gap-1 mb-4 bg-neutral-100 rounded-lg p-1 w-fit">
            {langTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveLang(tab.key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  activeLang === tab.key
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active language fields */}
          {langTabs.map((tab) => (
            <div
              key={tab.key}
              className={activeLang === tab.key ? 'space-y-4' : 'hidden'}
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Titel ({tab.label})
                </label>
                <input
                  type="text"
                  name={`title_${tab.key}`}
                  value={form[`title_${tab.key}`]}
                  onChange={handleChange}
                  placeholder={`Titel in het ${tab.label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Beschrijving ({tab.label})
                </label>
                <textarea
                  name={`description_${tab.key}`}
                  value={form[`description_${tab.key}`]}
                  onChange={handleChange}
                  rows={5}
                  placeholder={`Beschrijving in het ${tab.label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-y"
                />
              </div>
            </div>
          ))}
        </section>

        {/* ── Images ── */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-primary mb-1">
            Afbeeldingen
          </h2>
          <p className="text-neutral-500 text-sm mb-4">
            Voer een JSON-array van afbeeldings-URLs in. Upload-functionaliteit
            wordt later toegevoegd.
          </p>

          <textarea
            name="images"
            value={form.images}
            onChange={handleChange}
            rows={4}
            placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-y"
          />

          {/* Image previews */}
          {imagePreviewList.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-neutral-500 mb-2">
                Voorbeeld ({imagePreviewList.length}{' '}
                {imagePreviewList.length === 1 ? 'afbeelding' : 'afbeeldingen'})
              </p>
              <div className="flex flex-wrap gap-2">
                {imagePreviewList.map((url, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-14 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center"
                  >
                    {typeof url === 'string' && url ? (
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <ImageOff className="w-4 h-4 text-neutral-300 hidden" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <Link
            to="/admin/properties"
            className="px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Annuleren
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </form>
    </div>
  )
}
