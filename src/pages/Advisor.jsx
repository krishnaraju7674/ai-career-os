import { useEffect, useRef, useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { readUserData, writeUserData } from '../services/localUserData'
import { supabase } from '../services/supabaseClient'
import { useToast } from '../context/ToastContext'

const MODELS = [
  { id: 'gemini-1.5-flash',    label: '✨ Gemini Flash 1.5' },
  { id: 'gemini-1.5-flash-8b', label: '✨ Gemini Flash 8B' },
  { id: 'gemini-1.5-pro',      label: '✨ Gemini Pro 1.5'  },
  { id: 'gemini-2.0-flash',    label: '✨ Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', label: '✨ Gemini 2.0 Lite' },
]

const STARTERS = [
  'What should I study this week based on my skills?',
  'How do I prepare for a frontend developer interview?',
  'Review my interview readiness.',
  'What projects should I build to get hired?',
]

async function fetchUserContext(userId) {
  const [{ data: profile }, { data: skills }] = await Promise.all([
    supabase.from('profiles').select('college_name, branch, roles(role_name)').eq('id', userId).maybeSingle(),
    supabase.from('user_skills').select('level, skills(skill_name)').eq('user_id', userId).limit(10),
  ])
  return [
    `Role: ${profile?.roles?.role_name || 'Not set'}`,
    `Branch: ${profile?.branch || 'Not set'} at ${profile?.college_name || 'Not set'}`,
    `Top Skills: ${skills?.map(s => `${s.skills?.skill_name}(${s.level})`).join(', ') || 'None yet'}`,
  ].join(' | ')
}

async function sendToAI(modelId, context, history, message) {
  // PRO PRODUCTION MOVE: We now call our OWN server endpoint.
  // This keeps the API key hidden on the server and bypasses all CORS issues.
  const url = '/api/gemini' 

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelId,
      contents: [
        { role: 'user', parts: [{ text: `You are an expert AI career advisor for Indian college placement. Student context: ${context}. Be concise (under 150 words), use bullet points.` }] },
        { role: 'model', parts: [{ text: "Understood! I'm your career advisor. Ask me anything!" }] },
        ...history.slice(-4).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ]
    })
  })

  const data = await res.json()

  if (!res.ok || data.error) {
    const msg = data.error?.message || data.error || `HTTP ${res.status}`
    const isRate = msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate') || res.status === 429
    const seconds = (() => { const m = msg.match(/(\d+\.?\d*)\s*s/i); return m ? Math.ceil(parseFloat(m[1])) : 60 })()
    throw new Error(isRate ? `RATE_LIMIT:${seconds}` : msg)
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response. Try again.'
}

export default function Advisor() {
  const { user } = useAuth()
  const toast = useToast()
  const [messages, setMessages] = useState(() => readUserData(user.id, 'advisorChat', []))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState('')
  const [modelId, setModelId] = useState('gemini-1.5-flash')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const timerRef = useRef(null)
  const pendingRef = useRef('')
  const bottomRef = useRef(null)

  useEffect(() => { fetchUserContext(user.id).then(setContext) }, [user.id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => () => clearInterval(timerRef.current), [])

  const startCountdown = (secs, retryMsg) => {
    pendingRef.current = retryMsg
    setCountdown(secs)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setError('')
          const m = pendingRef.current; pendingRef.current = ''
          if (m) setTimeout(() => send(m), 400)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading || countdown > 0) return
    setInput('')
    setError('')
    const prev = [...messages, { role: 'user', text: msg }]
    setMessages(prev)
    setLoading(true)

    try {
      const reply = await sendToAI(modelId, context, messages, msg)
      const updated = [...prev, { role: 'assistant', text: reply }]
      setMessages(updated)
      writeUserData(user.id, 'advisorChat', updated.slice(-40))
    } catch (e) {
      if (e.message.startsWith('RATE_LIMIT:')) {
        const secs = parseInt(e.message.split(':')[1]) || 60
        setError('RATE_LIMIT')
        startCountdown(secs, msg)
      } else {
        setError(e.message)
      }
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMessages([])
    writeUserData(user.id, 'advisorChat', [])
    setError('')
    setCountdown(0)
    clearInterval(timerRef.current)
    pendingRef.current = ''
    toast.success('Chat cleared!')
  }

  return (
    <AppShell
      title="AI Career Advisor"
      subtitle="Powered by Production AI Bridge — secure and seamless."
      maxWidth="max-w-3xl"
      actions={
        <div className="flex gap-2 items-center">
          <select
            value={modelId}
            onChange={e => setModelId(e.target.value)}
            className="text-[11px] bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1.5 text-gray-400 outline-none"
          >
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          {messages.length > 0 && (
            <button onClick={reset} className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg transition">
              Clear
            </button>
          )}
        </div>
      }
    >
      {/* Rate limit banner */}
      {error === 'RATE_LIMIT' && countdown > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-orange-300">⏳ AI Cooldown — Auto-retrying in {countdown}s</span>
            <span className="text-2xl font-black text-orange-400 tabular-nums">{countdown}s</span>
          </div>
          <div className="w-full bg-orange-900/30 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-orange-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 60) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Generic error */}
      {error && error !== 'RATE_LIMIT' && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          ❌ {error}
        </div>
      )}

      {/* Chat area */}
      <Panel className="flex flex-col gap-3 min-h-[420px] max-h-[500px] overflow-y-auto mb-4 p-4">
        {messages.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 animate-fade-up">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center mb-3 text-2xl">✨</div>
            <p className="font-bold text-white mb-1 text-lg">Your Personal Placement Advisor</p>
            <p className="text-xs text-gray-500">Securely connected via production AI bridge.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/10' : 'glass text-gray-200 rounded-tl-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1.5">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </Panel>

      {/* Starter prompts */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={countdown > 0 || loading}
              className="text-xs rounded-full border border-white/[0.1] bg-white/[0.03] text-gray-400 px-3 py-1.5 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300 transition disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={countdown > 0 ? `Auto-retrying...` : 'Ask your career mentor…'}
          className={inputClass + ' flex-1 !bg-white/[0.03] !border-white/[0.05] focus:!border-indigo-500/50'}
          disabled={loading || countdown > 0}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading || countdown > 0}
          className={primaryButtonClass + ' !px-6 min-w-[80px] shadow-lg shadow-indigo-500/20'}
        >
          {countdown > 0 ? `${countdown}s` : loading ? '…' : 'Ask AI'}
        </button>
      </div>
    </AppShell>
  )
}
