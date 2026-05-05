import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, StatusBadge } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabaseClient'
import { todayISO } from '../services/localUserData'

const HABITS = [
  { id: 'dsa',        label: 'Solved DSA problems',                   icon: '🧠', color: 'blue' },
  { id: 'applied',    label: 'Applied to jobs/internships',            icon: '💼', color: 'green' },
  { id: 'interview',  label: 'Practiced mock interview',              icon: '🎙️', color: 'indigo' },
  { id: 'resume',     label: 'Improved resume or portfolio',           icon: '📄', color: 'violet' },
  { id: 'networking', label: 'Connected with someone on LinkedIn',     icon: '🤝', color: 'yellow' },
  { id: 'learning',   label: 'Watched a tutorial or course',          icon: '📚', color: 'purple' },
]

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

export default function Habits() {
  const { user } = useAuth()
  const toast = useToast()
  const today = todayISO()

  // habit_id → true for today's done habits
  const [todayDone, setTodayDone] = useState({})
  // date → count of done habits
  const [heatmapData, setHeatmapData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const days = lastNDays(28)
      const since = days[0]
      const { data, error } = await supabase
        .from('habit_log')
        .select('log_date, habit_id, done')
        .eq('user_id', user.id)
        .gte('log_date', since)
        .eq('done', true)

      if (error) { toast.error('Failed to load habits.'); setLoading(false); return }

      const todayMap = {}
      const heatmap = {}

      ;(data || []).forEach(row => {
        if (row.done) {
          if (row.log_date === today) todayMap[row.habit_id] = true
          heatmap[row.log_date] = (heatmap[row.log_date] || 0) + 1
        }
      })

      setTodayDone(todayMap)
      setHeatmapData(heatmap)
      setLoading(false)
    }
    fetch()
  }, [user.id, today])

  const toggle = async (id) => {
    const done = !!todayDone[id]

    // Optimistic update
    setTodayDone(prev => ({ ...prev, [id]: !done }))
    setHeatmapData(prev => ({
      ...prev,
      [today]: Math.max(0, (prev[today] || 0) + (done ? -1 : 1)),
    }))

    if (done) {
      const { error } = await supabase
        .from('habit_log')
        .delete()
        .eq('user_id', user.id)
        .eq('log_date', today)
        .eq('habit_id', id)
      if (error) {
        toast.error('Failed to update habit.')
        setTodayDone(prev => ({ ...prev, [id]: done })) // revert
      }
    } else {
      const { error } = await supabase
        .from('habit_log')
        .upsert({ user_id: user.id, log_date: today, habit_id: id, done: true }, { onConflict: 'user_id,log_date,habit_id' })
      if (error) {
        toast.error('Failed to update habit.')
        setTodayDone(prev => ({ ...prev, [id]: done })) // revert
      }
    }
  }

  const completedToday = HABITS.filter(h => todayDone[h.id]).length
  const dailyScore = Math.round((completedToday / HABITS.length) * 100)

  const days = lastNDays(28)

  const streak = useMemo(() => {
    let s = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (heatmapData[days[i]] > 0) s++
      else if (days[i] !== today) break
    }
    return s
  }, [heatmapData, days, today])

  const scoreColor = (p) => p >= 70 ? 'text-green-400' : p >= 40 ? 'text-yellow-400' : 'text-red-400'
  const heatColor = (count) => {
    if (!count) return 'bg-white/[0.04]'
    if (count < 2) return 'bg-indigo-500/30'
    if (count < 4) return 'bg-indigo-500/60'
    return 'bg-indigo-500'
  }

  return (
    <AppShell title="Daily Habits" subtitle="Small daily actions compound into career breakthroughs." maxWidth="max-w-3xl">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-up">
        <div className="glass rounded-2xl p-4 text-center">
          <p className={`text-3xl font-black ${scoreColor(dailyScore)}`}>{dailyScore}%</p>
          <p className="text-xs text-gray-500 mt-1">Today's score</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-orange-400">{streak}</p>
          <p className="text-xs text-gray-500 mt-1">🔥 Day streak</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-indigo-400">{completedToday}/{HABITS.length}</p>
          <p className="text-xs text-gray-500 mt-1">Done today</p>
        </div>
      </div>

      {/* Today's checklist */}
      <Panel className="mb-6 animate-fade-up delay-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold">Today — {today}</h2>
          {completedToday === HABITS.length && <StatusBadge tone="green">🎉 Perfect Day!</StatusBadge>}
        </div>

        {loading ? (
          <div className="space-y-3">{HABITS.map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {HABITS.map((h, i) => {
              const done = !!todayDone[h.id]
              return (
                <button key={h.id} onClick={() => toggle(h.id)}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={`animate-fade-up w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left group ${
                    done ? 'bg-green-500/10 border-green-500/30' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
                  }`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    done ? 'bg-green-500 border-green-500' : 'border-gray-600 group-hover:border-gray-400'
                  }`}>
                    {done && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xl shrink-0">{h.icon}</span>
                  <span className={`text-sm font-medium transition-colors flex-1 text-left ${done ? 'text-green-300' : 'text-gray-300 group-hover:text-white'}`}>
                    {h.label}
                  </span>
                  {done && <span className="text-xs text-green-500 font-semibold">Done ✓</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progress</span>
            <span className={`text-xs font-bold ${scoreColor(dailyScore)}`}>{dailyScore}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${dailyScore}%` }} />
          </div>
        </div>
      </Panel>

      {/* Heatmap */}
      <Panel className="animate-fade-up delay-200">
        <h2 className="font-bold text-sm mb-4">28-Day Activity Heatmap</h2>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map(d => (
            <div key={d} title={`${d}: ${heatmapData[d] || 0}/${HABITS.length} habits`}
              className={`aspect-square rounded-md transition-all hover:scale-110 cursor-default ${heatColor(heatmapData[d] || 0)}`} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-600">Less</span>
          {[0, 1, 3, 6].map(v => (
            <div key={v} className={`w-3 h-3 rounded-sm ${heatColor(v)}`} />
          ))}
          <span className="text-xs text-gray-600">More</span>
        </div>
      </Panel>
    </AppShell>
  )
}
