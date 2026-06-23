import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, inputClass, primaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabaseClient'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({
    full_name: '',
    college_name: '',
    branch: '',
    current_year: '',
    graduation_year: '',
    city: '',
    github_url: '',
    linkedin_url: '',
    target_role_id: '',
  })

  const [portfolio, setPortfolio] = useState({
    skills: [],
    resume: null,
    tests: [],
    focusHours: 0,
    readinessScore: 0
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)

      try {
        const [
          { data: rolesData },
          { data: profileData },
          { data: skillsData },
          { data: resumeData },
          { data: testsData },
          { data: pomosData }
        ] = await Promise.all([
          supabase.from('roles').select('*'),
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('user_skills')
            .select('level, skills(skill_name, category)')
            .eq('user_id', user.id),
          supabase
            .from('resumes')
            .select('ats_score, feedback')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('test_submissions')
            .select('score, correct_count, total_questions, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('pomodoro_sessions')
            .select('minutes_focused')
            .eq('user_id', user.id)
        ])

        if (rolesData) setRoles(rolesData)
        if (profileData) setForm(profileData)

        // Calculate readiness score
        const skillsList = skillsData || []
        const levelScore = { beginner: 33, intermediate: 66, advanced: 100 }
        const avgSkill = skillsList.length ? Math.round(skillsList.reduce((s, sk) => s + (levelScore[sk.level] || 0), 0) / skillsList.length) : 0
        const atsVal = resumeData?.ats_score ?? 0
        const completionScore = (profileData?.full_name ? 30 : 0) + 
                               (profileData?.github_url ? 20 : 0) + 
                               (profileData?.linkedin_url ? 20 : 0) + 
                               (profileData?.college_name ? 30 : 0)
        const rScore = Math.round(0.5 * avgSkill + 0.3 * atsVal + 0.2 * completionScore)

        // Focus hours
        const totalMinutes = (pomosData || []).reduce((acc, curr) => acc + (curr.minutes_focused || 0), 0)
        const focusHours = Math.round((totalMinutes / 60) * 10) / 10

        setPortfolio({
          skills: skillsList,
          resume: resumeData,
          tests: testsData || [],
          focusHours,
          readinessScore: rScore
        })
      } catch (err) {
        console.warn('Failed to load profile analytics:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user.id])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSave = async () => {
    setSaving(true)

    const payload = {
      ...form,
      id: user.id,
      email: user.email,
      current_year: form.current_year ? parseInt(form.current_year) : null,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })

    if (error) toast.error(error.message)
    else toast.success('Profile saved successfully! ✓')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <div className="print:hidden">
        <AppShell
          title="My Profile"
          subtitle="Tell the app who you are and what role you are preparing for."
          maxWidth="max-w-3xl"
          showPremiumActions={true}
        >
          <Panel className="space-y-5">
        <Field label="Full Name">
          <input name="full_name" value={form.full_name || ''} onChange={handleChange} placeholder="Krishna Raju" className={inputClass} />
        </Field>

        <Field label="College Name">
          <input name="college_name" value={form.college_name || ''} onChange={handleChange} placeholder="Your college name" className={inputClass} />
        </Field>

        <Field label="Branch">
          <select 
            name="branch" 
            value={form.branch || ''} 
            onChange={handleChange} 
            className={inputClass + " bg-[#111827] text-white"}
          >
            <option value="" className="bg-[#111827]">Select Branch</option>
            <option value="CSE" className="bg-[#111827]">CSE</option>
            <option value="IT" className="bg-[#111827]">IT</option>
            <option value="ECE" className="bg-[#111827]">ECE</option>
            <option value="EEE" className="bg-[#111827]">EEE</option>
            <option value="MECH" className="bg-[#111827]">MECH</option>
            <option value="CIVIL" className="bg-[#111827]">CIVIL</option>
            <option value="OTHER" className="bg-[#111827]">Other</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Current Year">
            <select 
              name="current_year" 
              value={form.current_year || ''} 
              onChange={handleChange} 
              className={inputClass + " bg-[#111827] text-white"}
            >
              <option value="" className="bg-[#111827]">Select Year</option>
              <option value="1" className="bg-[#111827]">1st Year</option>
              <option value="2" className="bg-[#111827]">2nd Year</option>
              <option value="3" className="bg-[#111827]">3rd Year</option>
              <option value="4" className="bg-[#111827]">4th Year</option>
            </select>
          </Field>
          <Field label="Graduation Year">
            <select 
              name="graduation_year" 
              value={form.graduation_year || ''} 
              onChange={handleChange} 
              className={inputClass + " bg-[#111827] text-white"}
            >
              <option value="" className="bg-[#111827]">Select Year</option>
              <option value="2024" className="bg-[#111827]">2024</option>
              <option value="2025" className="bg-[#111827]">2025</option>
              <option value="2026" className="bg-[#111827]">2026</option>
              <option value="2027" className="bg-[#111827]">2027</option>
              <option value="2028" className="bg-[#111827]">2028</option>
              <option value="2029" className="bg-[#111827]">2029</option>
            </select>
          </Field>
        </div>

        <Field label="City">
          <input name="city" value={form.city || ''} onChange={handleChange} placeholder="Hyderabad" className={inputClass} />
        </Field>

        <Field label="Primary Tech Stack / Target Role">
          <select 
            name="target_role_id" 
            value={form.target_role_id || ''} 
            onChange={handleChange} 
            className={inputClass + " bg-[#111827] text-white"}
          >
            <option value="" className="bg-[#111827]">Select Target Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id} className="bg-[#111827]">{role.role_name}</option>
            ))}
          </select>
        </Field>

        <Field label="GitHub URL">
          <input name="github_url" value={form.github_url || ''} onChange={handleChange} placeholder="https://github.com/yourusername" className={inputClass} />
        </Field>

        <Field label="LinkedIn URL">
          <input name="linkedin_url" value={form.linkedin_url || ''} onChange={handleChange} placeholder="https://linkedin.com/in/yourusername" className={inputClass} />
        </Field>


        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            type="button" 
            onClick={() => window.print()} 
            className="flex-1 rounded-xl bg-slate-800 border border-white/[0.08] hover:bg-slate-700 text-white font-bold text-xs py-3.5 px-4 cursor-pointer transition flex items-center justify-center gap-2"
          >
            📄 Export Placement Portfolio
          </button>
          <button onClick={handleSave} disabled={saving} className={`${primaryButtonClass} flex-1 py-3.5`}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Panel>
    </AppShell>
  </div>

  {/* Printable Sheet */}
  <div className="hidden print:block bg-white text-slate-900 p-10 font-sans min-h-screen text-sm leading-relaxed select-text">
    <style dangerouslySetInnerHTML={{ __html: `
      @page {
        size: A4 portrait;
        margin: 15mm 15mm 15mm 15mm;
      }
      @media print {
        body {
          background: white !important;
          color: #0f172a !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-card {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
        }
        .print-badge {
          background-color: #f1f5f9 !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
        }
        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    `}} />
    {/* Header */}
    <div className="border-b-4 border-slate-900 pb-5 mb-6 flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{form.full_name || 'Krishna Raju'}</h1>
        <p className="text-md font-bold text-slate-600 mt-1 uppercase tracking-wider">
          {roles.find(r => r.id === form.target_role_id)?.role_name || 'Candidate Portfolio'}
        </p>
        <div className="flex gap-4 text-xs text-slate-500 mt-2">
          {form.city && <span>📍 {form.city}</span>}
          {user.email && <span>✉️ {user.email}</span>}
          {form.github_url && <span>🐙 github.com/{form.github_url.split('/').pop()}</span>}
          {form.linkedin_url && <span>🔗 linkedin.com/in/{form.linkedin_url.split('/').pop()}</span>}
        </div>
      </div>
      <div className="text-right">
        <div className="inline-block border-2 border-slate-950 p-2.5 rounded-lg text-center bg-slate-50 print-card">
          <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Readiness Score</div>
          <div className="text-3xl font-black text-slate-900 mt-0.5">{portfolio.readinessScore}%</div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-[1fr_2fr] gap-8">
      {/* Left Column: Stats & Education */}
      <div className="space-y-6">
        <div className="no-break">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Academic Info</h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-bold text-slate-600">College:</span>
              <div className="text-slate-800 font-medium">{form.college_name || 'N/A'}</div>
            </div>
            <div>
              <span className="font-bold text-slate-600">Branch & Year:</span>
              <div className="text-slate-800 font-medium">
                {form.branch || 'N/A'} {form.current_year ? `— Year ${form.current_year}` : ''}
              </div>
            </div>
            {form.graduation_year && (
              <div>
                <span className="font-bold text-slate-600">Graduation Year:</span>
                <div className="text-slate-800 font-medium">{form.graduation_year}</div>
              </div>
            )}
          </div>
        </div>

        <div className="no-break">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Placement Key Metrics</h3>
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center print-card">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ATS Resume Grade</div>
                <div className="text-sm font-black text-slate-800 mt-0.5">{portfolio.resume?.ats_score ? `${portfolio.resume.ats_score}/100` : 'N/A'}</div>
              </div>
              <span className="text-2xl">📄</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center print-card">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Focus Duration</div>
                <div className="text-sm font-black text-slate-800 mt-0.5">{portfolio.focusHours} Hours</div>
              </div>
              <span className="text-2xl">⏱️</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center print-card">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mock Exam Submissions</div>
                <div className="text-sm font-black text-slate-800 mt-0.5">{portfolio.tests.length} tests</div>
              </div>
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        {portfolio.tests.length > 0 && (
          <div className="no-break">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Mock Test Scores</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Highest Score:</span>
                <span className="font-bold text-slate-900">
                  {Math.max(...portfolio.tests.map(t => t.score))}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Average Score:</span>
                <span className="font-bold text-slate-900">
                  {Math.round(portfolio.tests.reduce((acc, curr) => acc + curr.score, 0) / portfolio.tests.length)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Skills & Breakdown */}
      <div className="space-y-6 border-l border-slate-200 pl-8">
        <div className="no-break">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Technical Skills Breakdown</h3>
          {portfolio.skills.length > 0 ? (
            <div className="space-y-4">
              {['Frontend', 'Backend', 'Database', 'DevOps', 'Language'].map(cat => {
                const catSkills = portfolio.skills.filter(s => s.skills?.category === cat)
                if (catSkills.length === 0) return null
                return (
                  <div key={cat} className="no-break">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{cat}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {catSkills.map((s, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium capitalize print-badge">
                          {s.skills?.skill_name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No skills listed in profile tracker.</p>
          )}
        </div>

        {portfolio.resume?.feedback && (
          <div className="no-break">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Resume Analysis Summary</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 leading-normal print-card">
              {portfolio.resume.feedback}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono no-break">
          <div>VERIFICATION CODE: AI-OS-{user.id.slice(0, 8).toUpperCase()}</div>
          <div>AI CAREER OS VERIFIED PORTFOLIO</div>
        </div>
      </div>
    </div>
  </div>
</>
)
}
