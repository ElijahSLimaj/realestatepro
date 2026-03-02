import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ImageIcon,
} from 'lucide-react'

const emptyForm = {
  name: '',
  image_url: '',
  avg_price: 0,
  listing_count: 0,
  sort_order: 0,
  description_nl: '',
  description_fr: '',
  description_en: '',
}

export default function NeighborhoodsList() {
  const [neighborhoods, setNeighborhoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchNeighborhoods()
  }, [])

  async function fetchNeighborhoods() {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setNeighborhoods(data || [])
    } catch (err) {
      console.error('Failed to fetch neighborhoods:', err)
      setError('Kon wijken niet ophalen.')
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
      image_url: item.image_url || '',
      avg_price: item.avg_price || 0,
      listing_count: item.listing_count || 0,
      sort_order: item.sort_order || 0,
      description_nl: item.description_nl || '',
      description_fr: item.description_fr || '',
      description_en: item.description_en || '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        avg_price: Number(form.avg_price) || 0,
        listing_count: Number(form.listing_count) || 0,
        sort_order: Number(form.sort_order) || 0,
      }
      if (editing) {
        const { error } = await supabase
          .from('neighborhoods')
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('neighborhoods').insert(payload)
        if (error) throw error
      }
      setModalOpen(false)
      fetchNeighborhoods()
    } catch (err) {
      console.error('Save error:', err)
      setError('Opslaan mislukt.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('neighborhoods').delete().eq('id', id)
      if (error) throw error
      setDeleteConfirm(null)
      fetchNeighborhoods()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Verwijderen mislukt.')
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (!supabaseConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Supabase niet geconfigureerd</p>
          <p className="mt-0.5 text-amber-700">
            Configureer je Supabase-project om wijken te beheren. Voeg VITE_SUPABASE_URL en
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
          <h1 className="text-2xl font-bold text-[#0C1D2E]">Wijken</h1>
          <p className="text-neutral-500 mt-1">Beheer buurten en wijken.</p>
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
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden animate-pulse">
              <div className="h-40 bg-neutral-200" />
              <div className="p-5">
                <div className="h-4 bg-neutral-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : neighborhoods.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <MapPin size={40} className="mx-auto mb-3 text-neutral-300" />
          <p className="font-medium text-neutral-500">Nog geen wijken</p>
          <p className="text-sm text-neutral-400 mt-1">Voeg je eerste wijk toe.</p>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {neighborhoods.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="h-40 bg-neutral-100 relative overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-neutral-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#0C1D2E] px-2.5 py-1 rounded-lg">
                  #{item.sort_order}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-[#0C1D2E] text-lg mb-2">{item.name}</h3>
                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                  <span>Gem. prijs: <span className="font-semibold text-[#0C1D2E]">{formatPrice(item.avg_price)}</span></span>
                  <span>{item.listing_count} woningen</span>
                </div>
                {item.description_nl && (
                  <p className="text-sm text-neutral-500 line-clamp-2">{item.description_nl}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-neutral-100">
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
              Weet je zeker dat je deze wijk wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
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
                {editing ? 'Wijk bewerken' : 'Nieuwe wijk'}
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
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Naam *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                  placeholder="Wijknaam"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Afbeelding URL</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                  placeholder="https://..."
                />
              </div>

              {/* Row: Price, Listings, Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Gem. prijs</label>
                  <input
                    type="number"
                    value={form.avg_price}
                    onChange={(e) => setForm({ ...form, avg_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Aantal woningen</label>
                  <input
                    type="number"
                    value={form.listing_count}
                    onChange={(e) => setForm({ ...form, listing_count: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Sorteervolgorde</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description NL */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Beschrijving (NL)</label>
                <textarea
                  rows={3}
                  value={form.description_nl}
                  onChange={(e) => setForm({ ...form, description_nl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] resize-none"
                  placeholder="Beschrijving in het Nederlands"
                />
              </div>

              {/* Description FR */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Beschrijving (FR)</label>
                <textarea
                  rows={3}
                  value={form.description_fr}
                  onChange={(e) => setForm({ ...form, description_fr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] resize-none"
                  placeholder="Description en francais"
                />
              </div>

              {/* Description EN */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Beschrijving (EN)</label>
                <textarea
                  rows={3}
                  value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] resize-none"
                  placeholder="Description in English"
                />
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
