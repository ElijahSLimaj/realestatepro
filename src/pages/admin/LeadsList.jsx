import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import {
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  AlertCircle,
  Filter,
  Save,
} from 'lucide-react'

const TYPE_BADGES = {
  valuation: { label: 'Taxatie', bg: 'bg-purple-100', text: 'text-purple-700' },
  mortgage: { label: 'Hypotheek', bg: 'bg-blue-100', text: 'text-blue-700' },
  contact: { label: 'Contact', bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

const STATUS_BADGES = {
  new: { label: 'Nieuw', bg: 'bg-amber-100', text: 'text-amber-700' },
  contacted: { label: 'Gecontacteerd', bg: 'bg-blue-100', text: 'text-blue-700' },
  closed: { label: 'Gesloten', bg: 'bg-neutral-100', text: 'text-neutral-500' },
}

export default function LeadsList() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [savingNotes, setSavingNotes] = useState(null)
  const [notesMap, setNotesMap] = useState({})

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setLeads(data || [])
      // Initialize notes map
      const nm = {}
      ;(data || []).forEach((l) => {
        nm[l.id] = l.notes || ''
      })
      setNotesMap(nm)
    } catch (err) {
      console.error('Failed to fetch leads:', err)
      setError('Kon leads niet ophalen.')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      )
    } catch (err) {
      console.error('Status update error:', err)
      setError('Status bijwerken mislukt.')
    }
  }

  async function saveNotes(id) {
    setSavingNotes(id)
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes: notesMap[id], updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, notes: notesMap[id] } : l))
      )
    } catch (err) {
      console.error('Notes save error:', err)
      setError('Notities opslaan mislukt.')
    } finally {
      setSavingNotes(null)
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function renderJsonData(data) {
    if (!data || typeof data !== 'object') return null
    const entries = Object.entries(data)
    if (entries.length === 0) return <p className="text-sm text-neutral-400">Geen extra data</p>
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="bg-neutral-50 rounded-lg px-3 py-2">
            <span className="text-xs font-medium text-neutral-400 uppercase">{key}</span>
            <p className="text-sm text-[#0C1D2E] font-medium">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </p>
          </div>
        ))}
      </div>
    )
  }

  const filteredLeads = leads.filter((lead) => {
    if (filterType !== 'all' && lead.type !== filterType) return false
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false
    return true
  })

  if (!supabaseConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Supabase niet geconfigureerd</p>
          <p className="mt-0.5 text-amber-700">
            Configureer je Supabase-project om leads te beheren. Voeg VITE_SUPABASE_URL en
            VITE_SUPABASE_ANON_KEY toe aan je .env bestand.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D2E]">Leads</h1>
          <p className="text-neutral-500 mt-1">Beheer inkomende leads en aanvragen.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
          <Filter size={15} />
          <span>Filter:</span>
        </div>
        {/* Type filters */}
        <div className="flex gap-1.5">
          {[
            { value: 'all', label: 'Alle types' },
            { value: 'valuation', label: 'Taxatie' },
            { value: 'mortgage', label: 'Hypotheek' },
            { value: 'contact', label: 'Contact' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === opt.value
                  ? 'bg-[#0C1D2E] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-neutral-200" />
        {/* Status filters */}
        <div className="flex gap-1.5">
          {[
            { value: 'all', label: 'Alle statussen' },
            { value: 'new', label: 'Nieuw' },
            { value: 'contacted', label: 'Gecontacteerd' },
            { value: 'closed', label: 'Gesloten' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterStatus === opt.value
                  ? 'bg-[#0C1D2E] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="divide-y divide-neutral-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="w-16 h-6 bg-neutral-200 rounded-full" />
                <div className="w-32 h-4 bg-neutral-200 rounded" />
                <div className="w-40 h-4 bg-neutral-100 rounded" />
                <div className="flex-1" />
                <div className="w-20 h-6 bg-neutral-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <Users size={40} className="mx-auto mb-3 text-neutral-300" />
          <p className="font-medium text-neutral-500">Geen leads gevonden</p>
          <p className="text-sm text-neutral-400 mt-1">
            {leads.length > 0 ? 'Pas de filters aan.' : 'Leads verschijnen hier zodra ze binnenkomen.'}
          </p>
        </div>
      ) : (
        /* Data Table */
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[100px_1fr_1fr_120px_120px_140px_40px] gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            <span>Type</span>
            <span>Naam</span>
            <span>Contact</span>
            <span>Telefoon</span>
            <span>Status</span>
            <span>Datum</span>
            <span />
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-neutral-100">
            {filteredLeads.map((lead) => {
              const typeBadge = TYPE_BADGES[lead.type] || { label: lead.type, bg: 'bg-neutral-100', text: 'text-neutral-600' }
              const statusBadge = STATUS_BADGES[lead.status] || { label: lead.status, bg: 'bg-neutral-100', text: 'text-neutral-600' }
              const isExpanded = expandedId === lead.id

              return (
                <div key={lead.id}>
                  {/* Main Row */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr_120px_120px_140px_40px] gap-2 md:gap-4 px-6 py-4 hover:bg-neutral-50/50 transition-colors cursor-pointer items-center"
                    onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                  >
                    {/* Type Badge */}
                    <div>
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
                        {typeBadge.label}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="font-medium text-[#0C1D2E] text-sm truncate">
                      {lead.name || '-'}
                    </div>

                    {/* Email */}
                    <div className="text-sm text-neutral-500 truncate">
                      {lead.email || '-'}
                    </div>

                    {/* Phone */}
                    <div className="text-sm text-neutral-500 truncate">
                      {lead.phone || '-'}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Clock size={13} />
                      {formatDate(lead.created_at)}
                    </div>

                    {/* Expand */}
                    <div className="flex justify-end">
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-neutral-400" />
                      ) : (
                        <ChevronDown size={16} className="text-neutral-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-5 bg-neutral-50/50 border-t border-neutral-100">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        {/* Lead Data JSON */}
                        <div>
                          <h4 className="text-sm font-semibold text-[#0C1D2E] mb-3">Gegevens</h4>
                          {renderJsonData(lead.data)}
                        </div>

                        {/* Status + Notes */}
                        <div className="space-y-4">
                          {/* Status Update */}
                          <div>
                            <h4 className="text-sm font-semibold text-[#0C1D2E] mb-2">Status wijzigen</h4>
                            <select
                              value={lead.status}
                              onChange={(e) => updateStatus(lead.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full ps-3.5 pe-10 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] cursor-pointer"
                            >
                              <option value="new">Nieuw</option>
                              <option value="contacted">Gecontacteerd</option>
                              <option value="closed">Gesloten</option>
                            </select>
                          </div>

                          {/* Notes */}
                          <div>
                            <h4 className="text-sm font-semibold text-[#0C1D2E] mb-2">Notities</h4>
                            <textarea
                              rows={3}
                              value={notesMap[lead.id] || ''}
                              onChange={(e) => {
                                setNotesMap((prev) => ({
                                  ...prev,
                                  [lead.id]: e.target.value,
                                }))
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] resize-none"
                              placeholder="Voeg notities toe..."
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                saveNotes(lead.id)
                              }}
                              disabled={savingNotes === lead.id}
                              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C8944A] hover:bg-[#b5833f] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {savingNotes === lead.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Save size={13} />
                              )}
                              Opslaan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
