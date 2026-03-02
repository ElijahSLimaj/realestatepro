import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { Building2, Users, FileText, MessageCircle, TrendingUp, Clock } from 'lucide-react'

const placeholderStats = {
  properties: 24,
  leads: 12,
  blogPosts: 8,
  chatSessions: 36,
}

const placeholderLeads = [
  { id: 1, name: 'Jan de Vries', email: 'jan@example.com', type: 'buying', created_at: '2026-03-01T14:30:00Z' },
  { id: 2, name: 'Sophie Bakker', email: 'sophie@example.com', type: 'selling', created_at: '2026-02-28T09:15:00Z' },
  { id: 3, name: 'Marco Jansen', email: 'marco@example.com', type: 'renting', created_at: '2026-02-27T16:45:00Z' },
  { id: 4, name: 'Lisa Mulder', email: 'lisa@example.com', type: 'buying', created_at: '2026-02-26T11:00:00Z' },
  { id: 5, name: 'Tom Hendriks', email: 'tom@example.com', type: 'valuation', created_at: '2026-02-25T08:20:00Z' },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    leads: 0,
    blogPosts: 0,
    chatSessions: 0,
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!supabaseConfigured) {
        setStats(placeholderStats)
        setRecentLeads(placeholderLeads)
        setLoading(false)
        return
      }

      try {
        const [
          { count: propertiesCount },
          { count: leadsCount },
          { count: blogPostsCount },
          { count: chatSessionsCount },
          { data: leads },
        ] = await Promise.all([
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
          supabase.from('chat_sessions').select('*', { count: 'exact', head: true }),
          supabase.from('leads').select('id, name, email, type, created_at').order('created_at', { ascending: false }).limit(5),
        ])

        setStats({
          properties: propertiesCount ?? 0,
          leads: leadsCount ?? 0,
          blogPosts: blogPostsCount ?? 0,
          chatSessions: chatSessionsCount ?? 0,
        })
        setRecentLeads(leads ?? [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      label: 'Total Properties',
      value: stats.properties,
      icon: Building2,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Leads',
      value: stats.leads,
      icon: Users,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Blog Posts',
      value: stats.blogPosts,
      icon: FileText,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Chat Sessions',
      value: stats.chatSessions,
      icon: MessageCircle,
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeBadgeClasses = (type) => {
    const map = {
      buying: 'bg-blue-100 text-blue-700',
      selling: 'bg-emerald-100 text-emerald-700',
      renting: 'bg-amber-100 text-amber-700',
      valuation: 'bg-purple-100 text-purple-700',
    }
    return map[type] || 'bg-neutral-100 text-neutral-700'
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0C1D2E]">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Welcome back. Here's an overview of your site.</p>
      </div>

      {/* Supabase not configured notice */}
      {!supabaseConfigured && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 flex items-start gap-3">
          <TrendingUp size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Demo Mode</p>
            <p className="mt-0.5 text-amber-700">
              Supabase is not configured. Showing placeholder data. Connect your Supabase project to see live stats.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div
            key={label}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <Icon size={22} className={iconColor} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0C1D2E]">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-neutral-200 rounded animate-pulse" />
              ) : (
                value
              )}
            </p>
            <p className="text-sm text-neutral-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 w-10 h-10 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-[#C8944A]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0C1D2E]">Recent Leads</h2>
              <p className="text-sm text-neutral-400">Last 5 inquiries</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentLeads.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No leads yet</p>
            <p className="text-sm mt-1">New inquiries will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#0C1D2E] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {lead.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1D2E] truncate">{lead.name}</p>
                  <p className="text-sm text-neutral-400 truncate">{lead.email}</p>
                </div>

                {/* Type Badge */}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize shrink-0 ${getTypeBadgeClasses(lead.type)}`}>
                  {lead.type}
                </span>

                {/* Date */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 shrink-0">
                  <Clock size={13} />
                  {formatDate(lead.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
