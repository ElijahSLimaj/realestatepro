import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { MessageCircle, X, Send } from 'lucide-react'

export default function ChatWidget() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [initialized, setInitialized] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open && !initialized) {
      setMessages([{ from: 'bot', text: t('chat.welcomeMessage') }])
      setInitialized(true)
    }
  }, [open, initialized, t])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (text) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { from: 'user', text }])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: t('chat.autoReply') }])
    }, 1000)
  }

  const quickReplies = [
    t('chat.quickBuy'),
    t('chat.quickSell'),
    t('chat.quickViewing'),
    t('chat.quickValuation'),
  ]

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 ${
          open ? 'bg-neutral-700 text-white' : 'bg-accent text-white animate-pulse-glow'
        }`}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <div className="text-white font-bold">{t('chat.title')}</div>
            <div className="text-white/50 text-xs">VastGoed Elite</div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.from === 'bot'
                    ? 'bg-neutral-100 text-neutral-700 rounded-bl-md'
                    : 'bg-accent text-white rounded-br-md ml-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => send(reply)}
                  className="text-xs bg-accent/10 text-accent font-medium px-3 py-1.5 rounded-full hover:bg-accent/20 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-neutral-100 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder={t('chat.placeholder')}
              className="flex-1 bg-neutral-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              onClick={() => send(input)}
              className="bg-accent text-white p-2.5 rounded-lg hover:bg-accent-dark transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
