import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react'

const emptyForm = {
  name: '',
  location: '',
  rating: 5,
  property_type_nl: '',
  property_type_fr: '',
  property_type_en: '',
  text_nl: '',
  text_fr: '',
  text_en: '',
  is_visible: true,
}

export default function TestimonialsList() {
  const { tenantId } = useTenant()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchTestimonials()
  }, [tenantId])

  async function fetchTestimonials() {
    if (!supabaseConfigured || !tenantId) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTestimonials(data || [])
    } catch (err) {
      console.error('Failed to fetch testimonials:', err)
      setError('Kon recensies niet ophalen.')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      name: item.name || '',
      location: item.location || '',
      rating: item.rating || 5,
      property_type_nl: item.property_type_nl || '',
      property_type_fr: item.property_type_fr || '',
      property_type_en: item.property_type_en || '',
      text_nl: item.text_nl || '',
      text_fr: item.text_fr || '',
      text_en: item.text_en || '',
      is_visible: item.is_visible ?? true,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        const { error } = await supabase
          .from('testimonials')
          .update(form)
          .eq('tenant_id', tenantId)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('testimonials').insert({ ...form, tenant_id: tenantId })
        if (error) throw error
      }
      setModalOpen(false)
      fetchTestimonials()
    } catch (err) {
      console.error('Save error:', err)
      setError('Opslaan mislukt.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id)
      if (error) throw error
      setDeleteConfirm(null)
      fetchTestimonials()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Verwijderen mislukt.')
    }
  }

  async function toggleVisibility(item) {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_visible: !item.is_visible })
        .eq('id', item.id)
      if (error) throw error
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, is_visible: !t.is_visible } : t))
      )
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  function renderStars(rating) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}
          />
        ))}
      </div>
    )
  }

  if (!supabaseConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Supabase niet geconfigureerd</p>
          <p className="mt-0.5 text-amber-700">
            Configureer je Supabase-project om recensies te beheren. Voeg VITE_SUPABASE_URL en
            VITE_SUPABASE_ANON_KEY toe aan je .env bestand.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D2E]">Recensies</h1>
          <p className="text-neutral-500 mt-1">Beheer klantrecensies en testimonials.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#C8944A] hover:bg-[#b5833f] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Toevoegen
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-3" />
              <div className="h-3 bg-neutral-100 rounded w-1/3 mb-4" />
              <div className="h-3 bg-neutral-100 rounded w-full mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <Star size={40} className="mx-auto mb-3 text-neutral-300" />
          <p className="font-medium text-neutral-500">Nog geen recensies</p>
          <p className="text-sm text-neutral-400 mt-1">Voeg je eerste recensie toe.</p>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${
                item.is_visible ? 'border-neutral-200' : 'border-neutral-200 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#0C1D2E]">{item.name}</h3>
                  {item.location && (
                    <p className="text-sm text-neutral-400">{item.location}</p>
                  )}
                </div>
                {renderStars(item.rating)}
              </div>

              {/* Property type */}
              {item.property_type_nl && (
                <span className="inline-block text-xs font-medium bg-[#0C1D2E]/8 text-[#0C1D2E] px-2.5 py-1 rounded-full mb-3">
                  {item.property_type_nl}
                </span>
              )}

              {/* Text */}
              <p className="text-sm text-neutral-600 line-clamp-3 mb-4">
                {item.text_nl || '(Geen tekst)'}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <button
                  onClick={() => toggleVisibility(item)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    item.is_visible
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  {item.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  {item.is_visible ? 'Zichtbaar' : 'Verborgen'}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-[#0C1D2E] transition-colors cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#0C1D2E] mb-2">Verwijderen?</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Weet je zeker dat je deze recensie wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-lg font-semibold text-[#0C1D2E]">
                {editing ? 'Recensie bewerken' : 'Nieuwe recensie'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Row: Name + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Naam *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="Naam klant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Locatie</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="Bijv. Brussel"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Beoordeling</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm({ ...form, rating: i })}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={
                          i <= form.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-300'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type (NL/FR/EN) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Woningtype (NL / FR / EN)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={form.property_type_nl}
                    onChange={(e) => setForm({ ...form, property_type_nl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="NL"
                  />
                  <input
                    type="text"
                    value={form.property_type_fr}
                    onChange={(e) => setForm({ ...form, property_type_fr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="FR"
                  />
                  <input
                    type="text"
                    value={form.property_type_en}
                    onChange={(e) => setForm({ ...form, property_type_en: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="EN"
                  />
                </div>
              </div>

              {/* Text NL */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tekst (NL)</label>
                <textarea
                  rows={3}
                  value={form.text_nl}
                  onChange={(e) => setForm({ ...form, text_nl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] resize-none"
                  placeholder="Recensietekst in het Nederlands"
                />
              </div>

              {/* Text FR */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tekst (FR)</label>
                <textarea
                  rows={3}
                  value={form.text_fr}
                  onChange={(e) => setForm({ ...form, text_fr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] resize-none"
                  placeholder="Texte en francais"
                />
              </div>

              {/* Text EN */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tekst (EN)</label>
                <textarea
                  rows={3}
                  value={form.text_en}
                  onChange={(e) => setForm({ ...form, text_en: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] resize-none"
                  placeholder="Review text in English"
                />
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_visible: !form.is_visible })}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    form.is_visible ? 'bg-[#C8944A]' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.is_visible ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm text-neutral-600">
                  {form.is_visible ? 'Zichtbaar op website' : 'Verborgen'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C8944A] hover:bg-[#b5833f] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {editing ? 'Opslaan' : 'Toevoegen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
