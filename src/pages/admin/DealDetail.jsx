import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MessageSquare,
  FileText,
  Clock,
  Plus,
  Check,
  ArrowRight,
} from 'lucide-react'

const STAGES = [
  { key: 'lead', label: 'Lead' },
  { key: 'viewing', label: 'Viewing' },
  { key: 'offer', label: 'Offer' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'under_contract', label: 'Under Contract' },
  { key: 'closing', label: 'Closing' },
  { key: 'completed', label: 'Completed' },
  { key: 'lost', label: 'Lost' },
]

export default function DealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tenantId } = useTenant()
  const { user } = useAuth()

  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Activities
  const [activities, setActivities] = useState([])
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  // Tasks
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  useEffect(() => {
    fetchDeal()
  }, [id, tenantId])

  async function fetchDeal() {
    if (!supabaseConfigured || !tenantId) {
      // Demo mode
      setDeal({
        id,
        title: 'Demo Deal',
        client_name: 'Sophie Peeters',
        client_email: 'sophie@email.com',
        client_phone: '+32 3 123 45 67',
        deal_type: 'sale',
        stage: 'viewing',
        priority: 'high',
        deal_value: 385000,
        commission_rate: 3,
        commission_amount: 11550,
        expected_close_date: '2026-04-15',
        notes: 'Client is very interested. Second viewing scheduled.',
        created_at: '2026-03-01T10:00:00Z',
      })
      setActivities([
        { id: 'a1', activity_type: 'stage_change', title: 'Stage changed to Viewing', created_at: '2026-03-05T10:00:00Z' },
        { id: 'a2', activity_type: 'note', title: 'Initial contact via website', description: 'Client submitted a viewing request for the Groenplaats apartment.', created_at: '2026-03-01T10:00:00Z' },
      ])
      setTasks([
        { id: 't1', title: 'Schedule second viewing', due_date: '2026-03-15', is_completed: false, sort_order: 1 },
        { id: 't2', title: 'Prepare property comparison document', due_date: '2026-03-12', is_completed: true, completed_at: '2026-03-11T10:00:00Z', sort_order: 2 },
      ])
      setLoading(false)
      return
    }

    try {
      const [
        { data: dealData, error: dealError },
        { data: activityData },
        { data: taskData },
      ] = await Promise.all([
        supabase.from('deals').select('*').eq('id', id).eq('tenant_id', tenantId).single(),
        supabase.from('deal_activities').select('*').eq('deal_id', id).order('created_at', { ascending: false }),
        supabase.from('deal_tasks').select('*').eq('deal_id', id).order('sort_order'),
      ])

      if (dealError) throw dealError
      setDeal(dealData)
      setActivities(activityData || [])
      setTasks(taskData || [])
    } catch (err) {
      console.error('Error fetching deal:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      if (!supabaseConfigured) {
        await new Promise((r) => setTimeout(r, 500))
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        setSaving(false)
        return
      }

      const value = Number(deal.deal_value) || 0
      const rate = Number(deal.commission_rate) || 0

      const { error: updateError } = await supabase
        .from('deals')
        .update({
          title: deal.title,
          client_name: deal.client_name,
          client_email: deal.client_email,
          client_phone: deal.client_phone,
          deal_type: deal.deal_type,
          stage: deal.stage,
          priority: deal.priority,
          deal_value: value,
          commission_rate: rate,
          commission_amount: value * (rate / 100),
          expected_close_date: deal.expected_close_date || null,
          notes: deal.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleStageChange(newStage) {
    const oldStage = deal.stage
    setDeal({ ...deal, stage: newStage })

    if (!supabaseConfigured) return

    try {
      const updates = { stage: newStage, updated_at: new Date().toISOString() }
      if (newStage === 'completed') updates.actual_close_date = new Date().toISOString().split('T')[0]

      await supabase.from('deals').update(updates).eq('id', id)

      // Log activity
      const { data: activity } = await supabase.from('deal_activities').insert({
        deal_id: id,
        user_id: user?.id,
        activity_type: 'stage_change',
        title: `Stage changed from ${oldStage} to ${newStage}`,
      }).select().single()

      if (activity) setActivities((prev) => [activity, ...prev])
    } catch (err) {
      console.error('Error changing stage:', err)
      setDeal({ ...deal, stage: oldStage })
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return
    setAddingNote(true)

    try {
      if (!supabaseConfigured) {
        setActivities((prev) => [{ id: `a-${Date.now()}`, activity_type: 'note', title: newNote, created_at: new Date().toISOString() }, ...prev])
        setNewNote('')
        setAddingNote(false)
        return
      }

      const { data, error } = await supabase.from('deal_activities').insert({
        deal_id: id,
        user_id: user?.id,
        activity_type: 'note',
        title: newNote,
      }).select().single()

      if (error) throw error
      setActivities((prev) => [data, ...prev])
      setNewNote('')
    } catch (err) {
      console.error('Error adding note:', err)
    } finally {
      setAddingNote(false)
    }
  }

  async function handleAddTask() {
    if (!newTask.trim()) return
    setAddingTask(true)

    try {
      if (!supabaseConfigured) {
        setTasks((prev) => [...prev, { id: `t-${Date.now()}`, title: newTask, is_completed: false, sort_order: prev.length + 1 }])
        setNewTask('')
        setAddingTask(false)
        return
      }

      const { data, error } = await supabase.from('deal_tasks').insert({
        deal_id: id,
        title: newTask,
        sort_order: tasks.length + 1,
      }).select().single()

      if (error) throw error
      setTasks((prev) => [...prev, data])
      setNewTask('')
    } catch (err) {
      console.error('Error adding task:', err)
    } finally {
      setAddingTask(false)
    }
  }

  async function handleToggleTask(taskId, completed) {
    setTasks((prev) => prev.map((t) =>
      t.id === taskId ? { ...t, is_completed: completed, completed_at: completed ? new Date().toISOString() : null } : t
    ))

    if (!supabaseConfigured) return

    try {
      await supabase.from('deal_tasks').update({
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      }).eq('id', taskId)
    } catch (err) {
      console.error('Error toggling task:', err)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this deal?')) return

    try {
      if (supabaseConfigured) {
        await supabase.from('deals').delete().eq('id', id)
      }
      navigate('/admin/deals')
    } catch (err) {
      setError(err.message)
    }
  }

  const inputClasses = 'w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#C8944A] animate-spin" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Deal not found.</p>
        <Link to="/admin/deals" className="text-[#C8944A] hover:underline text-sm mt-2 inline-block">Back to deals</Link>
      </div>
    )
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === deal.stage)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/deals" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0C1D2E]">{deal.title}</h1>
            <p className="text-sm text-neutral-500 capitalize">{deal.deal_type} deal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8944A] hover:bg-[#b5833f] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Deal saved successfully!
        </div>
      )}

      {/* Stage Pipeline */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STAGES.map((stage, i) => {
            const isCurrent = stage.key === deal.stage
            const isPast = i < currentStageIndex
            const isLost = stage.key === 'lost'
            return (
              <button
                key={stage.key}
                onClick={() => handleStageChange(stage.key)}
                className={`flex-1 min-w-[80px] py-2 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                  isCurrent
                    ? isLost ? 'bg-red-500 text-white' : 'bg-[#C8944A] text-white'
                    : isPast
                    ? 'bg-emerald-50 text-emerald-700'
                    : isLost
                    ? 'bg-neutral-50 text-neutral-400 hover:bg-red-50 hover:text-red-600'
                    : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'
                }`}
              >
                {stage.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Deal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Details */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#0C1D2E] mb-2">Deal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Title</label>
                <input type="text" value={deal.title} onChange={(e) => setDeal({ ...deal, title: e.target.value })} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Deal type</label>
                <select value={deal.deal_type} onChange={(e) => setDeal({ ...deal, deal_type: e.target.value })} className={`${inputClasses} cursor-pointer`}>
                  <option value="sale">Sale</option>
                  <option value="rental">Rental</option>
                  <option value="acquisition">Acquisition</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Priority</label>
                <select value={deal.priority} onChange={(e) => setDeal({ ...deal, priority: e.target.value })} className={`${inputClasses} cursor-pointer`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Expected close date</label>
                <input type="date" value={deal.expected_close_date || ''} onChange={(e) => setDeal({ ...deal, expected_close_date: e.target.value })} className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Deal value (&euro;)</label>
                <input type="number" value={deal.deal_value || ''} onChange={(e) => setDeal({ ...deal, deal_value: e.target.value })} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Commission %</label>
                <input type="number" step="0.1" value={deal.commission_rate || ''} onChange={(e) => setDeal({ ...deal, commission_rate: e.target.value })} className={inputClasses} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Notes</label>
              <textarea rows={3} value={deal.notes || ''} onChange={(e) => setDeal({ ...deal, notes: e.target.value })} className={`${inputClasses} resize-y`} />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-[#0C1D2E] mb-4">Activity</h2>

            {/* Add note */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Add a note..."
                className="flex-1 px-3.5 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]"
              />
              <button onClick={handleAddNote} disabled={addingNote || !newNote.trim()} className="px-4 py-2 rounded-lg bg-[#0C1D2E] text-white text-sm font-medium disabled:opacity-50 cursor-pointer">
                {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
              </button>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    activity.activity_type === 'stage_change' ? 'bg-[#C8944A]/10' :
                    activity.activity_type === 'note' ? 'bg-blue-50' :
                    'bg-neutral-100'
                  }`}>
                    {activity.activity_type === 'stage_change' ? <ArrowRight className="w-4 h-4 text-[#C8944A]" /> :
                     activity.activity_type === 'note' ? <MessageSquare className="w-4 h-4 text-blue-500" /> :
                     <Clock className="w-4 h-4 text-neutral-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0C1D2E]">{activity.title}</p>
                    {activity.description && <p className="text-xs text-neutral-500 mt-0.5">{activity.description}</p>}
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(activity.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">No activity yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Client + Tasks */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-[#0C1D2E] mb-4">Client</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
                <input type="text" value={deal.client_name || ''} onChange={(e) => setDeal({ ...deal, client_name: e.target.value })} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
                <input type="email" value={deal.client_email || ''} onChange={(e) => setDeal({ ...deal, client_email: e.target.value })} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Phone</label>
                <input type="tel" value={deal.client_phone || ''} onChange={(e) => setDeal({ ...deal, client_phone: e.target.value })} className={inputClasses} />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-[#0C1D2E] mb-4">Tasks</h2>
            <div className="space-y-2 mb-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleTask(task.id, !task.is_completed)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      task.is_completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-neutral-300 hover:border-[#C8944A]'
                    }`}
                  >
                    {task.is_completed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`text-sm ${task.is_completed ? 'text-neutral-400 line-through' : 'text-[#0C1D2E]'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-neutral-400">No tasks yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a task..."
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30"
              />
              <button onClick={handleAddTask} disabled={addingTask || !newTask.trim()} className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 cursor-pointer">
                <Plus className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-[#0C1D2E] mb-4">Financials</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Deal Value</span>
                <span className="text-sm font-semibold text-[#0C1D2E]">
                  {new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(deal.deal_value || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Commission Rate</span>
                <span className="text-sm font-semibold text-[#0C1D2E]">{deal.commission_rate || 0}%</span>
              </div>
              <hr className="border-neutral-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-700">Commission</span>
                <span className="text-lg font-bold text-emerald-600">
                  {new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format((Number(deal.deal_value) || 0) * ((Number(deal.commission_rate) || 0) / 100))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
