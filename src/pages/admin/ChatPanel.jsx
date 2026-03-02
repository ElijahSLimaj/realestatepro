import { useState, useEffect, useRef } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import {
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  User,
  Headset,
  Circle,
} from 'lucide-react'

export default function ChatPanel() {
  const [sessions, setSessions] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [reply, setReply] = useState('')
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const subscriptionRef = useRef(null)

  useEffect(() => {
    fetchSessions()
    return () => {
      // Clean up realtime subscription on unmount
      if (subscriptionRef.current) {
        supabase?.removeChannel(subscriptionRef.current)
      }
    }
  }, [])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchSessions() {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setSessions(data || [])
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
      setError('Kon chatsessies niet ophalen.')
    } finally {
      setLoading(false)
    }
  }

  async function selectSession(session) {
    setSelectedSession(session)
    setMessages([])
    setReply('')
    setLoadingMessages(true)

    // Remove previous subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
      subscriptionRef.current = null
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError('Kon berichten niet ophalen.')
    } finally {
      setLoadingMessages(false)
    }

    // Subscribe to realtime for this session
    const channel = supabase
      .channel(`chat-messages-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    subscriptionRef.current = channel
  }

  async function sendReply() {
    if (!reply.trim() || !selectedSession || sending) return
    setSending(true)
    try {
      const { error } = await supabase.from('chat_messages').insert({
        session_id: selectedSession.id,
        sender: 'agent',
        message: reply.trim(),
      })
      if (error) throw error
      setReply('')
    } catch (err) {
      console.error('Send error:', err)
      setError('Bericht verzenden mislukt.')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }

  function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('nl-BE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!supabaseConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Supabase niet geconfigureerd</p>
          <p className="mt-0.5 text-amber-700">
            Configureer je Supabase-project om chat te gebruiken. Voeg VITE_SUPABASE_URL en
            VITE_SUPABASE_ANON_KEY toe aan je .env bestand.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0C1D2E]">Chat</h1>
        <p className="text-neutral-500 mt-1">Reageer op chatberichten van bezoekers.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 h-[calc(100vh-260px)] min-h-[500px]">
        {/* Left: Sessions List */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-[#0C1D2E]">Sessies</h3>
            <p className="text-xs text-neutral-400 mt-0.5">{sessions.length} totaal</p>
          </div>

          {loading ? (
            <div className="flex-1 p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-200 rounded w-2/3" />
                    <div className="h-2 bg-neutral-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <MessageSquare size={32} className="mx-auto mb-2 text-neutral-300" />
                <p className="text-sm text-neutral-400">Nog geen chatsessies</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors cursor-pointer ${
                    selectedSession?.id === session.id ? 'bg-[#C8944A]/5 border-r-2 border-r-[#C8944A]' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#0C1D2E]/10 flex items-center justify-center shrink-0">
                    <User size={16} className="text-[#0C1D2E]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#0C1D2E] truncate">
                        {session.visitor_name || 'Bezoeker'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 ${
                          session.status === 'active' ? 'text-emerald-600' : 'text-neutral-400'
                        }`}
                      >
                        <Circle
                          size={7}
                          className={session.status === 'active' ? 'fill-emerald-500' : 'fill-neutral-300'}
                        />
                        {session.status === 'active' ? 'Actief' : 'Gesloten'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDate(session.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Message Thread */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm flex flex-col overflow-hidden">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <MessageSquare size={48} className="mx-auto mb-3 text-neutral-200" />
                <p className="text-neutral-500 font-medium">Selecteer een sessie</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Klik op een chatsessie aan de linkerkant om berichten te bekijken.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0C1D2E] flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0C1D2E]">
                    {selectedSession.visitor_name || 'Bezoeker'}
                  </h3>
                  <p className="text-xs text-neutral-400">{formatDate(selectedSession.created_at)}</p>
                </div>
                <span
                  className={`ml-auto inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    selectedSession.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  <Circle
                    size={7}
                    className={selectedSession.status === 'active' ? 'fill-emerald-500' : 'fill-neutral-300'}
                  />
                  {selectedSession.status === 'active' ? 'Actief' : 'Gesloten'}
                </span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-neutral-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-neutral-400">Nog geen berichten in deze sessie.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          msg.sender === 'agent'
                            ? 'bg-[#0C1D2E] text-white rounded-br-md'
                            : 'bg-neutral-100 text-[#0C1D2E] rounded-bl-md'
                        }`}
                      >
                        {/* Sender label */}
                        <div className="flex items-center gap-1.5 mb-1">
                          {msg.sender === 'agent' ? (
                            <Headset size={11} className="opacity-60" />
                          ) : (
                            <User size={11} className="opacity-60" />
                          )}
                          <span className="text-[10px] font-medium opacity-60 uppercase">
                            {msg.sender === 'agent' ? 'Agent' : 'Bezoeker'}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.sender === 'agent' ? 'text-white/40' : 'text-neutral-400'
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="px-4 py-3 border-t border-neutral-100">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A] resize-none max-h-32"
                    placeholder="Typ een bericht..."
                    style={{ minHeight: '42px' }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="p-2.5 rounded-xl bg-[#C8944A] hover:bg-[#b5833f] text-white transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
