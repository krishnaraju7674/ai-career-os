import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, StatusBadge, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabaseClient'
import { todayISO, addDaysISO } from '../services/localUserData'

const categories = ['Technical', 'Project', 'Resume', 'Aptitude', 'Communication', 'Application']
const priorities = ['High', 'Medium', 'Low']

const emptyTask = { title: '', category: 'Technical', priority: 'Medium', due_date: todayISO() }

const priorityTone = { High: 'red', Medium: 'yellow', Low: 'gray' }
const categoryColor = {
  Technical: 'blue', Project: 'indigo', Resume: 'purple',
  Aptitude: 'yellow', Communication: 'green', Application: 'indigo',
}

function starterTasks(userId) {
  return [
    { user_id: userId, title: 'Practice 3 DSA problems and write notes', category: 'Aptitude', priority: 'High', due_date: todayISO(), completed: false },
    { user_id: userId, title: 'Improve one project README with screenshots', category: 'Project', priority: 'High', due_date: addDaysISO(1), completed: false },
    { user_id: userId, title: 'Apply to 3 internships and update tracker', category: 'Application', priority: 'Medium', due_date: addDaysISO(2), completed: false },
    { user_id: userId, title: 'Record a 2-min self-introduction and review', category: 'Communication', priority: 'Medium', due_date: addDaysISO(3), completed: false },
  ]
}

export default function Planner() {
  const { user } = useAuth()
  const toast = useToast()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyTask)
  const [filter, setFilter] = useState('All')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('planner_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) { toast.error('Failed to load tasks.'); setLoading(false); return }

      if (data.length === 0) {
        // Seed starter tasks for new users
        const { data: inserted } = await supabase.from('planner_tasks').insert(starterTasks(user.id)).select()
        setTasks(inserted || [])
      } else {
        setTasks(data)
      }
      setLoading(false)
    }
    fetchTasks()
  }, [user.id])

  const filteredTasks = useMemo(() => {
    if (filter === 'All') return tasks
    if (filter === 'Completed') return tasks.filter(t => t.completed)
    if (filter === 'Open') return tasks.filter(t => !t.completed)
    return tasks.filter(t => t.category === filter)
  }, [filter, tasks])

  const completion = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('planner_tasks')
      .insert({ ...form, user_id: user.id })
      .select()
      .single()
    if (error) { toast.error('Failed to add task.'); setSaving(false); return }
    setTasks(prev => [data, ...prev])
    setForm(emptyTask)
    toast.success('Task added!')
    setSaving(false)
  }

  const toggleTask = async (task) => {
    const { error } = await supabase
      .from('planner_tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)
    if (error) { toast.error('Failed to update task.'); return }
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = async (id) => {
    const { error } = await supabase.from('planner_tasks').delete().eq('id', id)
    if (error) { toast.error('Failed to delete task.'); return }
    setTasks(prev => prev.filter(t => t.id !== id))
    toast.success('Task deleted.')
  }

  const addSmartPlan = async () => {
    const plan = [
      { user_id: user.id, title: 'List 10 required skills from job descriptions for your target role', category: 'Technical', priority: 'High', due_date: todayISO(), completed: false },
      { user_id: user.id, title: 'Build one small feature and push it to GitHub', category: 'Project', priority: 'High', due_date: addDaysISO(2), completed: false },
      { user_id: user.id, title: 'Update resume with measurable project impact and keywords', category: 'Resume', priority: 'Medium', due_date: addDaysISO(3), completed: false },
      { user_id: user.id, title: 'Practice 5 HR questions in mock interview mode', category: 'Communication', priority: 'Medium', due_date: addDaysISO(4), completed: false },
    ]
    const { data, error } = await supabase.from('planner_tasks').insert(plan).select()
    if (error) { toast.error('Failed to add plan.'); return }
    setTasks(prev => [...(data || []), ...prev])
    toast.success('4-step smart plan added!')
  }

  return (
    <AppShell
      title="Career Planner"
      subtitle="Turn your readiness gaps into small daily actions."
      actions={<button onClick={addSmartPlan} className={secondaryButtonClass + ' !py-2 !text-sm'}>✨ Add Smart Plan</button>}
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Panel className="animate-fade-up">
            <h2 className="font-bold mb-4">Add Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Task">
                <input name="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="What should you finish?" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass + ' !py-2'}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inputClass + ' !py-2'}>
                    {priorities.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Due Date">
                <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className={inputClass + ' !py-2'} />
              </Field>
              <button className={`${primaryButtonClass} w-full`} type="submit" disabled={saving || !form.title.trim()}>
                {saving ? 'Adding...' : '+ Add Task'}
              </button>
            </form>
          </Panel>

          <Panel className="animate-fade-up delay-100">
            <h2 className="font-bold mb-3">Progress</h2>
            <p className="text-5xl font-black text-indigo-400">{completion}%</p>
            <p className="mt-1 text-xs text-gray-500">{tasks.filter(t => t.completed).length} of {tasks.length} tasks done</p>
            <div className="mt-4 h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" style={{ width: `${completion}%` }} />
            </div>
          </Panel>
        </div>

        <Panel className="animate-fade-up delay-200">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-bold">Tasks</h2>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white outline-none">
              {['All', 'Open', 'Completed', ...categories].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center">
              <p className="text-lg font-semibold">No tasks here</p>
              <p className="text-sm text-gray-500 mt-1">Add a task or change the filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <article key={task.id}
                  className={`rounded-xl border p-4 transition-all ${task.completed ? 'border-green-900/50 bg-green-950/10' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)}
                        className="mt-1 h-4.5 w-4.5 accent-indigo-600 cursor-pointer" />
                      <div>
                        <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">Due {task.due_date}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <StatusBadge tone={categoryColor[task.category] || 'blue'}>{task.category}</StatusBadge>
                      <StatusBadge tone={priorityTone[task.priority]}>{task.priority}</StatusBadge>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="mt-3 text-xs text-red-400/60 hover:text-red-400 transition">Delete</button>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  )
}
