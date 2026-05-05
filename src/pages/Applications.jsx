import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, StatusBadge, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabaseClient'
import { todayISO } from '../services/localUserData'

const statuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']
const statusTone = { Saved: 'gray', Applied: 'blue', Interview: 'purple', Offer: 'green', Rejected: 'red' }

const emptyForm = { company: '', role: '', status: 'Saved', location: '', deadline: '', link: '', notes: '' }

export default function Applications() {
  const { user } = useAuth()
  const toast = useToast()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load applications.')
        else setApplications(data || [])
        setLoading(false)
      })
  }, [user.id])

  const stats = useMemo(() => statuses.map(s => ({
    status: s,
    count: applications.filter(a => a.status === s).length,
  })), [applications])

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
      toast.success('Application updated!')
    } else {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({ ...form, user_id: user.id })
        .select()
        .single()
      if (error) { toast.error('Failed to add application.'); setSaving(false); return }
      setApplications(prev => [data, ...prev])
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteApplication = async (id) => {
    const { error } = await supabase.from('job_applications').delete().eq('id', id)
    if (error) { toast.error('Failed to delete.'); return }
    setApplications(prev => prev.filter(a => a.id !== id))
    if (editingId === id) { setEditingId(null); setForm(emptyForm) }
    toast.success('Application removed.')
  }

  return (
    <AppShell title="Applications" subtitle="Track every job or internship from saved to offer.">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Panel className="animate-fade-up">
            <h2 className="font-bold mb-4">{editingId ? 'Edit Application' : 'Add Application'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Company">
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={inputClass} placeholder="Google, Amazon..." />
              </Field>
              <Field label="Role">
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputClass} placeholder="Frontend Intern" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass + ' !py-2'}>
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Location">
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputClass + ' !py-2'} placeholder="Remote" />
                </Field>
              </div>
              <Field label="Deadline">
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputClass + ' !py-2'} />
              </Field>
              <Field label="Job Link">
                <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className={inputClass} placeholder="https://..." />
              </Field>
              <Field label="Notes">
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass + ' min-h-20 resize-none'} placeholder="Referral, salary range..." />
              </Field>
              <div className="flex gap-3">
                <button className={`${primaryButtonClass} flex-1`} type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Application'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className={secondaryButtonClass}>Cancel</button>
                )}
              </div>
            </form>
          </Panel>

          {/* Pipeline stats */}
          <Panel className="animate-fade-up delay-100">
            <h2 className="font-bold mb-4">Pipeline</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(item => (
                <div key={item.status} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                  <p className="text-2xl font-black text-white">{item.count}</p>
                  <StatusBadge tone={statusTone[item.status]}>{item.status}</StatusBadge>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel className="animate-fade-up delay-100 min-h-[420px]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold">Tracked Roles</h2>
            <span className="text-xs text-gray-500">{applications.length} total</span>
          </div>

          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-xl" />)}</div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center">
              <p className="text-4xl mb-3">💼</p>
              <p className="text-lg font-semibold">No applications yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your first job or internship and track your journey.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <article key={app.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold">{app.role}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{app.company}{app.location ? ` · ${app.location}` : ''}</p>
                    </div>
                    <StatusBadge tone={statusTone[app.status]}>{app.status}</StatusBadge>
                  </div>

                  {(app.deadline || app.notes || app.link) && (
                    <div className="mt-3 space-y-1 text-sm text-gray-400">
                      {app.deadline && <p>📅 Deadline: {app.deadline}</p>}
                      {app.notes && <p className="text-gray-500 text-xs">{app.notes}</p>}
                      {app.link && <a href={app.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline text-xs">🔗 Open job link</a>}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {statuses.map(s => (
                      <button key={s} onClick={() => updateStatus(app.id, s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${app.status === s ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white'}`}>
                        {s}
                      </button>
                    ))}
                    <button onClick={() => editApplication(app)} className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-gray-300 hover:bg-white/[0.08]">Edit</button>
                    <button onClick={() => deleteApplication(app.id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  )
}
