import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge, inputClass, primaryButtonClass } from '../components/ui'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'

export default function Journal() {
  const { user } = useAuth()
  const toast = useToast()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [mood, setMood] = useState('🔥')
  const [tagsInput, setTagsInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    supabase
      .from('career_journal')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to load journal entries from Supabase, trying localStorage:', error)
          try {
            const cached = localStorage.getItem(`career_journal_${user.id}`)
            if (cached) setEntries(JSON.parse(cached))
          } catch (e) {
            console.error('Failed to parse local journal entries cache:', e)
          }
        } else {
          const mapped = (data || []).map(item => ({
            id: item.id,
            text: item.text,
            mood: item.mood,
            tags: item.tags,
            date: new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            timestamp: new Date(item.created_at).getTime()
          }))
          setEntries(mapped)
        }
        setLoading(false)
      })
  }, [user.id])

  useEffect(() => {
    if (!loading && user?.id) {
      try {
        localStorage.setItem(`career_journal_${user.id}`, JSON.stringify(entries))
      } catch (e) {
        console.error('Failed to save journal entries to localStorage:', e)
      }
    }
  }, [entries, loading, user?.id])

  const handleAddEntry = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    const parsedTags = tagsInput
      .split(',')
      .map(tag => tag.trim().replace(/^#/, ''))
      .filter(Boolean)
      .map(tag => `#${tag}`)

    const tags = parsedTags.length > 0 ? parsedTags : ['#general']

    const { data, error } = await supabase
      .from('career_journal')
      .insert({
        user_id: user.id,
        text,
        mood,
        tags
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to save reflection.')
      return
    }

    const newEntry = {
      id: data.id,
      text: data.text,
      mood: data.mood,
      tags: data.tags,
      date: new Date(data.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      timestamp: new Date(data.created_at).getTime()
    }

    setEntries(prev => [newEntry, ...prev])
    setText('')
    setTagsInput('')
    setMood('🔥')
    toast.success('Reflection logged! Keep it up. ✓')
  }

  const handleDeleteEntry = async (id) => {
    const { error } = await supabase
      .from('career_journal')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete entry.')
      return
    }

    setEntries(prev => prev.filter(ent => ent.id !== id))
    toast.success('Journal entry removed.')
  }

  const filteredEntries = entries.filter(ent => {
    const matchesSearch = ent.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const totalLogs = entries.length
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    let streakCount = 0
    if (entries.length > 0) {
      let lastTime = Date.now()
      const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp)
      for (let i = 0; i < sorted.length; i++) {
        const diffDays = Math.floor((lastTime - sorted[i].timestamp) / (1000 * 60 * 60 * 24))
        if (diffDays <= 1) {
          streakCount++
          lastTime = sorted[i].timestamp
        } else {
          break
        }
      }
    }
    const timer = setTimeout(() => {
      setStreak(streakCount)
    }, 0)
    return () => clearTimeout(timer)
  }, [entries])

  return (
    <AppShell title="Placement Journal & Log" subtitle="Reflect on your daily learning, log interviews, and track your mood.">
      <div className="grid gap-6 lg:grid-cols-[1fr_350px] max-w-6xl mx-auto animate-fade-up">
        
        {/* Left: Entries History */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
            <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
              <span>Total Logs: {totalLogs}</span>
              <span>Streak: {streak} 🔥</span>
            </div>
            
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search entries or #tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 shimmer rounded-xl" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
              <p className="text-gray-500">No journal logs found. Write your first reflection on the right!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredEntries.map((ent) => (
                <Card3D key={ent.id}>
                  <div className="flex justify-between items-center gap-4 mb-3">
                    <span className="text-xs text-cyan-400 font-bold">{ent.date}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg" title="Mood">{ent.mood}</span>
                      <button
                        onClick={() => handleDeleteEntry(ent.id)}
                        className="text-xs text-red-500 hover:text-red-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
                    {ent.text}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.05]">
                    {ent.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-bold px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card3D>
              ))}
            </div>
          )}
        </div>

        {/* Right: Add Entry Form */}
        <div className="space-y-6">
          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Write Log</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  What did you learn or practice today?
                </label>
                <textarea
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={`${inputClass} min-h-36 text-sm resize-none`}
                  placeholder="Today I solved 3 trees problems, did a mock interview, and revised CSS grid..."
                />
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Session Mood
                </label>
                <div className="flex justify-between bg-white/[0.02] border border-white/[0.06] p-2 rounded-xl">
                  {['😤', '😔', '😐', '😊', '🔥'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`text-2xl p-2 rounded-xl transition-all hover:scale-115 cursor-pointer ${
                        mood === m ? 'bg-cyan-500/20 scale-110 border border-cyan-500/40' : ''
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={inputClass + ' text-sm'}
                  placeholder="e.g. learning, dsa, failed_round"
                />
              </div>

              <button
                type="submit"
                className={primaryButtonClass + ' w-full py-3.5 mt-2'}
              >
                Log Reflection 📝
              </button>
            </form>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
