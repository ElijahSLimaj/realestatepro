import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'
import {
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Handshake,
  DollarSign,
  Calendar,
  User,
  ChevronRight,
  X,
  ArrowRight,
} from 'lucide-react'

const STAGES = [
  { key: 'lead', label: 'Lead', color: 'bg-blue-500', lightBg: 'bg-blue-50', text: 'text-blue-700' },
  { key: 'viewing', label: 'Viewing', color: 'bg-purple-500', lightBg: 'bg-purple-50', text: 'text-purple-700' },
  { key: 'offer', label: 'Offer', color: 'bg-amber-500', lightBg: 'bg-amber-50', text: 'text-amber-700' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-500', lightBg: 'bg-orange-50', text: 'text-orange-700' },
  { key: 'under_contract', label: 'Under Contract', color: 'bg-cyan-500', lightBg: 'bg-cyan-50', text: 'text-cyan-700' },
  { key: 'closing', label: 'Closing', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', text: 'text-emerald-700' },
  { key: 'completed', label: 'Completed', color: 'bg-green-600', lightBg: 'bg-green-50', text: 'text-green-700' },
  { key: 'lost', label: 'Lost', color: 'bg-red-500', lightBg: 'bg-red-50', text: 'text-red-700' },
]

const PRIORITIES = {
  low: { label: 'Low', color: 'bg-neutral-100 text-neutral-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val || 0)

const placeholderDeals = [
  { id: 'demo-1', title: 'Apartment Groenplaats', client_name: 'Sophie Peeters', deal_type: 'sale', stage: 'viewing', priority: 'high', deal_value: 385000, commission_amount: 11550, expected_close_date: '2026-04-15', created_at: '2026-03-01T10:00:00Z' },
  { id: 'demo-2', title: 'Villa Brasschaat', client_name: 'Thomas Willems', deal_type: 'sale', stage: 'offer', priority: 'urgent', deal_value: 1150000, commission_amount: 34500, expected_close_date: '2026-03-30', created_at: '2026-02-15T10:00:00Z' },
  { id: 'demo-3', title: 'Eilandje Rental', client_name: 'Marco Jansen', deal_type: 'rental', stage: 'lead', priority: 'medium', deal_value: 1800, commission_amount: 1800, expected_close_date: '2026-04-01', created_at: '2026-03-05T10:00:00Z' },
  { id: 'demo-4', title: 'Penthouse Louizalaan', client_name: 'Jan Claes', deal_type: 'sale', stage: 'negotiation', priority: 'high', deal_value: 1450000, commission_amount: 43500, expected_close_date: '2026-05-01', created_at: '2026-02-20T10:00:00Z' },
  { id: 'demo-5', title: 'Herenhuis Zurenborg', client_name: 'Marie Janssens', deal_type: 'sale', stage: 'under_contract', priority: 'medium', deal_value: 650000, commission_amount: 19500, expected_close_date: '2026-03-20', created_at: '2026-01-10T10:00:00Z' },
  { id: 'demo-6', title: 'Coupure Gent Rental', client_name: 'Lisa Mulder', deal_type: 'rental', stage: 'completed', priority: 'low', deal_value: 2800, commission_amount: 2800, expected_close_date: '2026-02-28', created_at: '2026-01-15T10:00:00Z' },
]

export default function DealsPipeline() {
  const { tenantId } = useTenant()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('board') // 'board' or 'list'
  const [filterStage, setFilterStage] = useState('all')
  const [search, setSearch] = useState('')
  const [showNewDeal, setShowNewDeal] = useState(false)

  // New deal form
  const [newDeal, setNewDeal] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    deal_type: 'sale',
    stage: 'lead',
    priority: 'medium',
    deal_value: '',
    commission_rate: '3',
    expected_close_date: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDeals()
  }, [tenantId])

  async function fetchDeals() {
    if (!supabaseConfigured || !tenantId) {
      setDeals(placeholderDeals)
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('deals')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setDeals(data || [])
    } catch (err) {
      console.error('Error fetching deals:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateDeal(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const value = Number(newDeal.deal_value) || 0
    const rate = Number(newDeal.commission_rate) || 0
    const commission = value * (rate / 100)

    try {
      if (!supabaseConfigured) {
        const fakeDeal = {
          id: `demo-${Date.now()}`,
          ...newDeal,
          deal_value: value,
          commission_rate: rate,
          commission_amount: commission,
          created_at: new Date().toISOString(),
        }
        setDeals((prev) => [fakeDeal, ...prev])
        setShowNewDeal(false)
        resetNewDeal()
        return
      }

      const { data, error: insertError } = await supabase
        .from('deals')
        .insert({
          tenant_id: tenantId,
          title: newDeal.title,
          client_name: newDeal.client_name,
          client_email: newDeal.client_email,
          client_phone: newDeal.client_phone,
          deal_type: newDeal.deal_type,
          stage: newDeal.stage,
          priority: newDeal.priority,
          deal_value: value,
          commission_rate: rate,
          commission_amount: commission,
          expected_close_date: newDeal.expected_close_date || null,
          notes: newDeal.notes,
        })
        .select()
        .single()

      if (insertError) throw insertError
      setDeals((prev) => [data, ...prev])
      setShowNewDeal(false)
      resetNewDeal()
    } catch (err) {
      console.error('Error creating deal:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleStageChange(dealId, newStage) {
    if (!supabaseConfigured) {
      setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage } : d))
      return
    }

    try {
      const updates = { stage: newStage, updated_at: new Date().toISOString() }
      if (newStage === 'completed') updates.actual_close_date = new Date().toISOString().split('T')[0]

      const { error: updateError } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', dealId)

      if (updateError) throw updateError
      setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, ...updates } : d))
    } catch (err) {
      console.error('Error updating deal stage:', err)
    }
  }

  function resetNewDeal() {
    setNewDeal({ title: '', client_name: '', client_email: '', client_phone: '', deal_type: 'sale', stage: 'lead', priority: 'medium', deal_value: '', commission_rate: '3', expected_close_date: '', notes: '' })
  }

  // Filtering
  const filteredDeals = deals.filter((d) => {
    if (filterStage !== 'all' && d.stage !== filterStage) return false
    if (search && !d.title?.toLowerCase().includes(search.toLowerCase()) && !d.client_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Stats
  const activeDeals = deals.filter((d) => !['completed', 'lost'].includes(d.stage))
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0)
  const totalCommission = activeDeals.reduce((sum, d) => sum + (Number(d.commission_amount) || 0), 0)
  const wonDeals = deals.filter((d) => d.stage === 'completed')

  const inputClasses = 'w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D2E]">Deal Pipeline</h1>
          <p className="text-neutral-500 text-sm mt-1">Track and manage your real estate deals</p>
        </div>
        <button
          onClick={() => setShowNewDeal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C8944A] hover:bg-[#b5833f] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Active Deals</p>
          <p className="text-2xl font-bold text-[#0C1D2E] mt-1">{activeDeals.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Pipeline Value</p>
          <p className="text-2xl font-bold text-[#0C1D2E] mt-1">{formatCurrency(totalPipelineValue)}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Expected Commission</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalCommission)}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Deals Won</p>
          <p className="text-2xl font-bold text-[#0C1D2E] mt-1">{wonDeals.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setFilterStage('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterStage === 'all' ? 'bg-[#0C1D2E] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            All
          </button>
          {STAGES.filter((s) => s.key !== 'completed' && s.key !== 'lost').map((s) => (
            <button
              key={s.key}
              onClick={() => setFilterStage(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterStage === s.key ? 'bg-[#0C1D2E] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setView('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${view === 'board' ? 'bg-[#0C1D2E] text-white' : 'bg-neutral-100 text-neutral-600'}`}
          >
            Board
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${view === 'list' ? 'bg-[#0C1D2E] text-white' : 'bg-neutral-100 text-neutral-600'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#C8944A] animate-spin" />
        </div>
      ) : view === 'board' ? (
        /* Board View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.filter((s) => s.key !== 'completed' && s.key !== 'lost').map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.key)
            return (
              <div key={stage.key} className="min-w-[280px] flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                  <h3 className="text-sm font-semibold text-[#0C1D2E]">{stage.label}</h3>
                  <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                </div>
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onStageChange={handleStageChange} />
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-neutral-200 p-6 text-center text-xs text-neutral-400">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Deal</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Stage</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Priority</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600">Value</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600">Commission</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Close Date</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredDeals.map((deal) => {
                  const stage = STAGES.find((s) => s.key === deal.stage) || STAGES[0]
                  const priority = PRIORITIES[deal.priority] || PRIORITIES.medium
                  return (
                    <tr key={deal.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/admin/deals/${deal.id}`} className="font-medium text-[#0C1D2E] hover:text-[#C8944A]">
                          {deal.title}
                        </Link>
                        <p className="text-xs text-neutral-400 capitalize">{deal.deal_type}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{deal.client_name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${stage.lightBg} ${stage.text}`}>
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${priority.color}`}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#0C1D2E]">{formatCurrency(deal.deal_value)}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatCurrency(deal.commission_amount)}</td>
                      <td className="px-4 py-3 text-neutral-500">
                        {deal.expected_close_date
                          ? new Date(deal.expected_close_date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
                          : '-'
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/deals/${deal.id}`} className="p-2 rounded-lg text-neutral-400 hover:text-[#0C1D2E] hover:bg-neutral-100 inline-flex transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredDeals.length === 0 && (
            <div className="p-12 text-center text-neutral-400">
              <Handshake className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No deals found</p>
            </div>
          )}
        </div>
      )}

      {/* New Deal Modal */}
      {showNewDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNewDeal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-[#0C1D2E]">New Deal</h2>
              <button onClick={() => setShowNewDeal(false)} className="p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Deal title *</label>
                <input type="text" required value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} className={inputClasses} placeholder="e.g. Apartment Groenplaats" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Deal type</label>
                  <select value={newDeal.deal_type} onChange={(e) => setNewDeal({ ...newDeal, deal_type: e.target.value })} className={`${inputClasses} cursor-pointer`}>
                    <option value="sale">Sale</option>
                    <option value="rental">Rental</option>
                    <option value="acquisition">Acquisition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Priority</label>
                  <select value={newDeal.priority} onChange={(e) => setNewDeal({ ...newDeal, priority: e.target.value })} className={`${inputClasses} cursor-pointer`}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Client name</label>
                <input type="text" value={newDeal.client_name} onChange={(e) => setNewDeal({ ...newDeal, client_name: e.target.value })} className={inputClasses} placeholder="Sophie Peeters" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input type="email" value={newDeal.client_email} onChange={(e) => setNewDeal({ ...newDeal, client_email: e.target.value })} className={inputClasses} placeholder="sophie@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
                  <input type="tel" value={newDeal.client_phone} onChange={(e) => setNewDeal({ ...newDeal, client_phone: e.target.value })} className={inputClasses} placeholder="+32 ..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Deal value (&euro;)</label>
                  <input type="number" value={newDeal.deal_value} onChange={(e) => setNewDeal({ ...newDeal, deal_value: e.target.value })} className={inputClasses} placeholder="385000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Commission %</label>
                  <input type="number" step="0.1" value={newDeal.commission_rate} onChange={(e) => setNewDeal({ ...newDeal, commission_rate: e.target.value })} className={inputClasses} placeholder="3" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Expected close date</label>
                <input type="date" value={newDeal.expected_close_date} onChange={(e) => setNewDeal({ ...newDeal, expected_close_date: e.target.value })} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Notes</label>
                <textarea rows={3} value={newDeal.notes} onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })} className={`${inputClasses} resize-y`} placeholder="Any additional notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewDeal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-[#C8944A] hover:bg-[#b5833f] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function DealCard({ deal, onStageChange }) {
  const stage = STAGES.find((s) => s.key === deal.stage) || STAGES[0]
  const stageIndex = STAGES.findIndex((s) => s.key === deal.stage)
  const nextStage = STAGES[stageIndex + 1]
  const priority = PRIORITIES[deal.priority] || PRIORITIES.medium

  return (
    <Link
      to={`/admin/deals/${deal.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-md hover:border-[#C8944A]/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-[#0C1D2E] group-hover:text-[#C8944A] transition-colors">{deal.title}</h4>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priority.color}`}>{priority.label}</span>
      </div>
      {deal.client_name && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
          <User className="w-3 h-3" />
          {deal.client_name}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#0C1D2E]">{formatCurrency(deal.deal_value)}</span>
        {deal.expected_close_date && (
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <Calendar className="w-3 h-3" />
            {new Date(deal.expected_close_date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
      {nextStage && nextStage.key !== 'lost' && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStageChange(deal.id, nextStage.key) }}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-50 text-neutral-500 hover:bg-[#C8944A]/10 hover:text-[#C8944A] transition-colors cursor-pointer"
        >
          Move to {nextStage.label}
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </Link>
  )
}
