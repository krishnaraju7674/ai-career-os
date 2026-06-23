import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge, inputClass, primaryButtonClass } from '../components/ui'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'

export default function Goals() {
  const { user } = useAuth()
  const toast = useToast()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [category, setCategory] = useState('Career')
  const [priority, setPriority] = useState('Medium')
  const [subGoalsInput, setSubGoalsInput] = useState('')

  useEffect(() => {
    supabase
      .from('career_goals')
      .select('id, title, desc:description, targetDate:target_date, category, priority, progress, completed, subGoals:sub_goals, createdAt:created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to load goals from Supabase, trying localStorage:', error)
          try {
            const cached = localStorage.getItem(`career_goals_${user.id}`)
            if (cached) setGoals(JSON.parse(cached))
          } catch (e) {
            console.error('Failed to parse local goals cache:', e)
          }
        } else {
          setGoals(data || [])
        }
        setLoading(false)
      })
  }, [user.id])

  useEffect(() => {
    if (!loading && user?.id) {
      try {
        localStorage.setItem(`career_goals_${user.id}`, JSON.stringify(goals))
      } catch (e) {
        console.error('Failed to save goals to localStorage:', e)
      }
    }
  }, [goals, loading, user?.id])

  const handleAddGoal = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const subGoalsList = subGoalsInput
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map((text, id) => ({ id, text, completed: false }))

    const newGoalData = {
      user_id: user.id,
      title,
      description: desc,
      target_date: targetDate || null,
      category,
      priority,
      progress: 0,
      completed: false,
      sub_goals: subGoalsList
    }

    const { data, error } = await supabase
      .from('career_goals')
      .insert(newGoalData)
      .select('id, title, desc:description, targetDate:target_date, category, priority, progress, completed, subGoals:sub_goals, createdAt:created_at')
      .single()

    if (error) {
      toast.error('Failed to add goal: ' + error.message)
      return
    }

    setGoals(prev => [data, ...prev])
    toast.success('Goal set successfully! 🎯')

    // Clear inputs
    setTitle('')
    setDesc('')
    setTargetDate('')
    setSubGoalsInput('')
  }

  const handleDeleteGoal = async (id) => {
    const { error } = await supabase
      .from('career_goals')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete goal.')
      return
    }

    setGoals(prev => prev.filter(g => g.id !== id))
    toast.success('Goal deleted.')
  }

  const handleToggleSubGoal = async (goalId, subGoalId) => {
    const goalToUpdate = goals.find(g => g.id === goalId)
    if (!goalToUpdate) return

    const nextSubGoals = goalToUpdate.subGoals.map(s => {
      if (s.id === subGoalId) return { ...s, completed: !s.completed }
      return s
    })

    const completedCount = nextSubGoals.filter(s => s.completed).length
    const nextProgress = nextSubGoals.length === 0 ? goalToUpdate.progress : Math.round((completedCount / nextSubGoals.length) * 100)
    const nextCompleted = nextProgress === 100

    const { error } = await supabase
      .from('career_goals')
      .update({
        sub_goals: nextSubGoals,
        progress: nextProgress,
        completed: nextCompleted
      })
      .eq('id', goalId)

    if (error) {
      toast.error('Failed to update milestone.')
      return
    }

    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { 
          ...g, 
          subGoals: nextSubGoals, 
          progress: nextProgress,
          completed: nextCompleted
        }
      }
      return g
    }))
  }

  const handleProgressChange = async (id, newProgress) => {
    const nextCompleted = newProgress === 100
    const { error } = await supabase
      .from('career_goals')
      .update({
        progress: newProgress,
        completed: nextCompleted
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update progress.')
      return
    }

    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return { 
          ...g, 
          progress: newProgress,
          completed: nextCompleted 
        }
      }
      return g
    }))
  }

  const handleToggleComplete = async (id) => {
    const goalToUpdate = goals.find(g => g.id === id)
    if (!goalToUpdate) return

    const nextCompleted = !goalToUpdate.completed
    const nextProgress = nextCompleted ? 100 : 0
    const nextSubGoals = goalToUpdate.subGoals.map(s => ({ ...s, completed: nextCompleted }))

    const { error } = await supabase
      .from('career_goals')
      .update({
        completed: nextCompleted,
        progress: nextProgress,
        sub_goals: nextSubGoals
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update goal completion.')
      return
    }

    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          completed: nextCompleted,
          progress: nextProgress,
          subGoals: nextSubGoals
        }
      }
      return g
    }))
  }

  return (
    <AppShell title="SMART Career Goals" subtitle="Draft your objectives, configure milestones, and track your metrics.">
      <div className="grid gap-6 lg:grid-cols-[1fr_350px] max-w-6xl mx-auto animate-fade-up">
        
        {/* Left Side: Goals List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
            <span className="text-sm font-bold text-gray-400">Total Goals Set: {goals.length}</span>
            <span className="text-sm font-bold text-emerald-400">Completed: {goals.filter(g => g.completed).length}</span>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
              <p className="text-gray-500">No career goals set yet. Use the sidebar to set a SMART goal!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {goals.map((g) => (
                <Card3D key={g.id} className={g.completed ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-white/[0.06]'}>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{g.category}</span>
                        <StatusBadge tone={g.priority === 'High' ? 'red' : g.priority === 'Medium' ? 'yellow' : 'blue'}>
                          {g.priority}
                        </StatusBadge>
                      </div>
                      <h3 className={`text-xl font-bold text-white mt-1.5 ${g.completed ? 'line-through opacity-60' : ''}`}>
                        {g.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-xs text-red-500 hover:text-red-400 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{g.desc}</p>

                  {/* Sub-goals / Milestones Checklist */}
                  {g.subGoals.length > 0 && (
                    <div className="mb-4 bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Milestones Checklist</p>
                      {g.subGoals.map((sub) => (
                        <label key={sub.id} className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => handleToggleSubGoal(g.id, sub.id)}
                            className="rounded border-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <span className={sub.completed ? 'line-through text-gray-500' : ''}>{sub.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Progress Slider */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>Progress</span>
                      <span className="text-cyan-400 font-mono">{g.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={g.progress}
                      onChange={(e) => handleProgressChange(g.id, parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <span className="text-[10px] text-gray-500 font-semibold">Target: {g.targetDate || "No Deadline"}</span>
                    <button
                      onClick={() => handleToggleComplete(g.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        g.completed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-white/[0.02] text-gray-300 border-white/[0.08] hover:bg-white/[0.05]'
                      }`}
                    >
                      {g.completed ? 'Completed ✓' : 'Mark Complete'}
                    </button>
                  </div>
                </Card3D>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Goal Form */}
        <div className="space-y-6">
          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Add SMART Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Master React Hooks"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className={inputClass + ' min-h-20'}
                  placeholder="Describe your SMART criteria..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClass + ' !py-2.5'}
                  >
                    <option value="Career">Career</option>
                    <option value="Learning">Learning</option>
                    <option value="Project">Project</option>
                    <option value="Health">Health/Habit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={inputClass + ' !py-2.5'}
                  >
                    <option value="High">High 🔴</option>
                    <option value="Medium">Medium 🟡</option>
                    <option value="Low">Low 🔵</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={inputClass + ' !py-2.5'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Milestones (Comma separated)
                </label>
                <input
                  type="text"
                  value={subGoalsInput}
                  onChange={(e) => setSubGoalsInput(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. read docs, build demo, push to git"
                />
              </div>

              <button
                type="submit"
                className={primaryButtonClass + ' w-full py-3.5 mt-2'}
              >
                Add Goal 🎯
              </button>
            </form>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
