import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  GripVertical,
} from 'lucide-react'

const emptyForm = {
  key: '',
  icon_name: '',
  sort_order: 0,
  title_nl: '',
  title_fr: '',
  title_en: '',
  description_nl: '',
  description_fr: '',
  description_en: '',
}

export default function ServicesList() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setServices(data || [])
    } catch (err) {
      console.error('Failed to fetch services:', err)
      setError('Kon diensten niet ophalen.')
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
      key: item.key || '',
      icon_name: item.icon_name || '',
      sort_order: item.sort_order || 0,
      title_nl: item.title_nl || '',
      title_fr: item.title_fr || '',
      title_en: item.title_en || '',
      description_nl: item.description_nl || '',
      description_fr: item.description_fr || '',
      description_en: item.description_en || '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.key.trim() || !form.title_nl.trim()) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order) || 0,
      }
      if (editing) {
        const { error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('services').insert(payload)
        if (error) throw error
      }
      setModalOpen(false)
      fetchServices()
    } catch (err) {
      console.error('Save error:', err)
      setError('Opslaan mislukt.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
      setDeleteConfirm(null)
      fetchServices()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Verwijderen mislukt.')
    }
  }

  if (!supabaseConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Supabase niet geconfigureerd</p>
          <p className="mt-0.5 text-amber-700">
            Configureer je Supabase-project om diensten te beheren. Voeg VITE_SUPABASE_URL en
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
          <h1 className="text-2xl font-bold text-[#0C1D2E]">Diensten</h1>
          <p className="text-neutral-500 mt-1">Beheer de diensten die je aanbiedt.</p>
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
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-neutral-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <Briefcase size={40} className="mx-auto mb-3 text-neutral-300" />
          <p className="font-medium text-neutral-500">Nog geen diensten</p>
          <p className="text-sm text-neutral-400 mt-1">Voeg je eerste dienst toe.</p>
        </div>
      ) : (
        /* Service Cards */
        <div className="space-y-3">
          {services.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Sort indicator */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <GripVertical size={16} className="text-neutral-300" />
                  <span className="text-xs font-bold text-neutral-400">{item.sort_order}</span>
                </div>

                {/* Icon name badge */}
                <div className="w-12 h-12 rounded-xl bg-[#0C1D2E]/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono font-semibold text-[#0C1D2E] truncate px-1">
                    {item.icon_name || '?'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#0C1D2E]">{item.title_nl}</h3>
                    <span className="text-xs font-mono bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                      {item.key}
                    </span>
                  </div>
                  {item.description_nl && (
                    <p className="text-sm text-neutral-500 line-clamp-2">{item.description_nl}</p>
                  )}
                  {/* Language hints */}
                  <div className="flex gap-2 mt-2">
                    {item.title_fr && (
                      <span className="text-xs bg-neutral-50 text-neutral-400 px-2 py-0.5 rounded">
                        FR: {item.title_fr}
                      </span>
                    )}
                    {item.title_en && (
                      <span className="text-xs bg-neutral-50 text-neutral-400 px-2 py-0.5 rounded">
                        EN: {item.title_en}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
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
              Weet je zeker dat je deze dienst wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
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
                {editing ? 'Dienst bewerken' : 'Nieuwe dienst'}
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
              {/* Row: Key + Icon + Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Key *</label>
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="bijv. verkoop"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Icoon naam</label>
                  <input
                    type="text"
                    value={form.icon_name}
                    onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="bijv. Home"
                  />
                  <p className="text-xs text-neutral-400 mt-1">Lucide icon naam</p>
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

              {/* Title NL/FR/EN */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Titel (NL / FR / EN)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={form.title_nl}
                    onChange={(e) => setForm({ ...form, title_nl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="NL *"
                  />
                  <input
                    type="text"
                    value={form.title_fr}
                    onChange={(e) => setForm({ ...form, title_fr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="FR"
                  />
                  <input
                    type="text"
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
                    placeholder="EN"
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
                disabled={saving || !form.key.trim() || !form.title_nl.trim()}
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
