import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, StatusBadge, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabaseClient'
const statuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

const emptyForm = { company: '', role: '', status: 'Saved', location: '', deadline: '', link: '', notes: '' }

export default function Applications() {
  const { user } = useAuth()
  const toast = useToast()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  useEffect(() => {
    supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to load applications from Supabase, trying localStorage:', error)
          try {
            const cached = localStorage.getItem(`job_applications_${user.id}`)
            if (cached) setApplications(JSON.parse(cached))
          } catch (e) {
            console.error('Failed to parse local applications cache:', e)
          }
        } else {
          setApplications(data || [])
        }
        setLoading(false)
      })
  }, [user.id])

  useEffect(() => {
    if (!loading && user?.id) {
      try {
        localStorage.setItem(`job_applications_${user.id}`, JSON.stringify(applications))
      } catch (e) {
        console.error('Failed to save applications to localStorage:', e)
      }
    }
  }, [applications, loading, user?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) return
    setSaving(true)

    if (editingId) {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editingId)
        .select()
        .single()
      if (error) { toast.error('Failed to update.'); setSaving(false); return }
      setApplications(prev => prev.map(a => a.id === editingId ? data : a))
      setEditingId(null)
      setShowModal(false)
      toast.success('Application updated!')
    } else {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({ ...form, user_id: user.id })
        .select()
        .single()
      if (error) { toast.error('Failed to add application.'); setSaving(false); return }
      setApplications(prev => [data, ...prev])
      setShowModal(false)
      toast.success('Application added!')
    }

    setForm(emptyForm)
    setSaving(false)
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { toast.error('Failed to update status.'); return }
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    toast.success(`Moved to ${status}`)
  }

  const editApplication = (app) => {
    setEditingId(app.id)
    setForm({ company: app.company, role: app.role, status: app.status, location: app.location || '', deadline: app.deadline || '', link: app.link || '', notes: app.notes || '' })
    setShowModal(true)
  }

  const deleteApplication = async (id) => {
    const { error } = await supabase.from('job_applications').delete().eq('id', id)
    if (error) { toast.error('Failed to delete.'); return }
    setApplications(prev => prev.filter(a => a.id !== id))
    if (editingId === id) { setEditingId(null); setForm(emptyForm); setShowModal(false) }
    toast.success('Application removed.')
  }

  return (
    <AppShell title="Applications Board" subtitle="Organize your internship and job pipeline with visual columns and drag-and-drop.">
      <div className="flex flex-col space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
          <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
            <span>Total Applications: {applications.length}</span>
            <span>Offers: {applications.filter(a => a.status === 'Offer').length} 🏆</span>
          </div>
          <button
            onClick={() => {
              setEditingId(null)
              setForm(emptyForm)
              setShowModal(true)
            }}
            className={primaryButtonClass + ' flex items-center gap-1 cursor-pointer'}
          >
            ➕ Add Job Application
          </button>
        </div>

        {/* Kanban Board Container */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-3">
                <div className="h-10 shimmer rounded-xl" />
                <div className="h-32 shimmer rounded-xl" />
                <div className="h-32 shimmer rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 items-start overflow-x-auto pb-6">
            {statuses.map(status => {
              const columnApps = applications.filter(app => app.status === status)
              const isOver = dragOverColumn === status
              
              return (
                <div
                  key={status}
                  onDragOver={e => e.preventDefault()}
                  onDragEnter={() => setDragOverColumn(status)}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={() => {
                    if (draggingId) {
                      updateStatus(draggingId, status)
                    }
                    setDragOverColumn(null)
                  }}
                  className={`flex flex-col rounded-2xl bg-white/[0.01] border transition-all duration-300 min-h-[500px] w-full p-4 ${
                    isOver ? 'border-cyan-500/50 bg-cyan-500/[0.02] shadow-[0_0_15px_rgba(6,182,212,0.05)]' : 'border-white/[0.05]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        status === 'Saved' ? 'bg-gray-400' :
                        status === 'Applied' ? 'bg-blue-400' :
                        status === 'Interview' ? 'bg-purple-400' :
                        status === 'Offer' ? 'bg-emerald-400' :
                        'bg-red-400'
                      }`} />
                      <h3 className="font-bold text-white text-sm">{status}</h3>
                    </div>
                    <span className="text-xs bg-white/[0.04] px-2 py-0.5 rounded-full text-gray-400 font-semibold">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {columnApps.length === 0 ? (
                      <div className="h-32 rounded-xl border border-dashed border-white/[0.03] flex items-center justify-center text-center p-4">
                        <p className="text-xs text-gray-600">Drag jobs here</p>
                      </div>
                    ) : (
                      columnApps.map(app => {
                        const statusIndex = statuses.indexOf(app.status)
                        return (
                          <div
                            key={app.id}
                            draggable
                            onDragStart={e => {
                              setDraggingId(app.id)
                              e.dataTransfer.effectAllowed = 'move'
                            }}
                            onDragEnd={() => setDraggingId(null)}
                            className={`group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.04] cursor-grab active:cursor-grabbing flex flex-col justify-between ${
                              draggingId === app.id ? 'opacity-30 border-dashed' : ''
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-white text-xs leading-snug group-hover:text-cyan-400 transition-colors">
                                  {app.role}
                                </h4>
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => editApplication(app)}
                                    className="text-gray-400 hover:text-white p-0.5 rounded bg-white/[0.04]"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => deleteApplication(app.id)}
                                    className="text-red-400 hover:text-red-300 p-0.5 rounded bg-white/[0.04]"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-1 font-semibold">
                                {app.company}
                              </p>
                              
                              {app.location && (
                                <span className="inline-block mt-2 text-[9px] bg-white/[0.04] border border-white/[0.06] text-gray-400 px-2 py-0.5 rounded-md font-medium">
                                  📍 {app.location}
                                </span>
                              )}

                              {app.deadline && (
                                <p className="text-[9px] text-[#a3a3a3] mt-2 flex items-center gap-1 font-medium">
                                  📅 Deadline: {app.deadline}
                                </p>
                              )}
                              
                              {app.notes && (
                                <p className="text-[9px] text-gray-500 mt-2 bg-black/10 p-2 rounded-lg border border-white/[0.02] line-clamp-2">
                                  {app.notes}
                                </p>
                              )}
                            </div>

                            {/* Card Footer actions */}
                            <div className="mt-3 pt-3 border-t border-white/[0.04] flex justify-between items-center">
                              {app.link ? (
                                <a
                                  href={app.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] text-cyan-400 hover:underline flex items-center gap-0.5 font-semibold"
                                >
                                  🔗 Job Link
                                </a>
                              ) : (
                                <span />
                              )}
                              
                              {/* Quick Move Buttons for Mobile */}
                              <div className="flex gap-1">
                                {statusIndex > 0 && (
                                  <button
                                    onClick={() => updateStatus(app.id, statuses[statusIndex - 1])}
                                    className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-gray-400 hover:text-white text-[9px] cursor-pointer"
                                    title={`Move to ${statuses[statusIndex - 1]}`}
                                  >
                                    ←
                                  </button>
                                )}
                                {statusIndex < statuses.length - 1 && (
                                  <button
                                    onClick={() => updateStatus(app.id, statuses[statusIndex + 1])}
                                    className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-gray-400 hover:text-white text-[9px] cursor-pointer"
                                    title={`Move to ${statuses[statusIndex + 1]}`}
                                  >
                                    →
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal Overlay for Add/Edit Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#020617] border border-white/10 rounded-2xl p-6 shadow-2xl relative animate-fade-in">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingId(null)
                  setForm(emptyForm)
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
              
              <h2 className="font-bold text-white text-lg mb-5">
                {editingId ? '✏️ Edit Job Application' : '💼 Add Job Application'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Company">
                  <input
                    required
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Google, Stripe, Tesla"
                  />
                </Field>
                
                <Field label="Role Title">
                  <input
                    required
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Frontend Engineer Intern"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className={inputClass + ' !py-2.5'}
                    >
                      {statuses.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  
                  <Field label="Location">
                    <input
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className={inputClass + ' !py-2.5'}
                      placeholder="e.g. Remote, NY, hybrid"
                    />
                  </Field>
                </div>

                <Field label="Application Deadline">
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className={inputClass + ' !py-2.5'}
                  />
                </Field>
                
                <Field label="Job Listing Link">
                  <input
                    type="url"
                    value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    className={inputClass}
                    placeholder="https://careers.google.com/jobs/..."
                  />
                </Field>
                
                <Field label="Personal Notes">
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className={inputClass + ' min-h-24 resize-none'}
                    placeholder="Referral name, salary range, interviews details..."
                  />
                </Field>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className={`${primaryButtonClass} flex-1`}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingId(null)
                      setForm(emptyForm)
                    }}
                    className={secondaryButtonClass}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
