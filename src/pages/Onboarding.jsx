import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabaseClient'

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Java Developer', 'Salesforce Developer']

const QUICK_SKILLS = [
  { name: 'JavaScript', cat: 'Frontend' }, { name: 'React', cat: 'Frontend' }, { name: 'HTML', cat: 'Frontend' },
  { name: 'CSS', cat: 'Frontend' }, { name: 'Node.js', cat: 'Backend' }, { name: 'Python', cat: 'Data' },
  { name: 'SQL', cat: 'Database' }, { name: 'Java', cat: 'Language' }, { name: 'DSA', cat: 'Core' },
  { name: 'Git', cat: 'Tools' }, { name: 'Communication', cat: 'Soft Skills' }, { name: 'Aptitude', cat: 'Core' },
]

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [saving, setSaving] = useState(false)
  const [allSkills, setAllSkills] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    supabase.from('skills').select('*').then(({ data }) => setAllSkills(data || []))
  }, [])

  const toggleSkill = (skillName) => {
    setSelectedSkills(prev =>
      prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName]
    )
  }

  const finish = async () => {
    setSaving(true)
    try {
      // Get role id
      const { data: roleData } = await supabase
        .from('roles').select('id').eq('role_name', selectedRole).maybeSingle()

      // Save profile
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: name,
        target_role_id: roleData?.id || null,
        onboarded: true,
      }, { onConflict: 'id' })

      // Save selected skills as intermediate
      if (selectedSkills.length > 0) {
        const skillRows = allSkills
          .filter(s => selectedSkills.includes(s.skill_name))
          .map(s => ({ user_id: user.id, skill_id: s.id, level: 'beginner' }))
        if (skillRows.length > 0) {
          await supabase.from('user_skills').upsert(skillRows, { onConflict: 'user_id,skill_id' })
        }
      }

      toast.success("You're all set! Welcome to AI Career OS 🎉")
      navigate('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
    setSaving(false)
  }

  const STEPS = ['Welcome', 'Your Role', 'Your Skills']
  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="orb-1 absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="orb-2 absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-scale-in">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i + 1 < step ? 'bg-indigo-500 text-white' :
                  i + 1 === step ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-300' :
                  'bg-white/[0.05] text-gray-600'
                }`}>
                  {i + 1 < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-white font-medium' : 'text-gray-600'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-8 sm:w-16 ${i + 1 < step ? 'bg-indigo-500' : 'bg-white/[0.08]'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-fade-up text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 animate-float shadow-2xl shadow-indigo-500/30">
                <span className="text-3xl">⚡</span>
              </div>
              <h1 className="text-2xl font-black mb-2 gradient-text">Welcome to AI Career OS</h1>
              <p className="text-sm text-gray-400 mb-8">Let's set up your profile in 2 quick steps so we can personalize your experience.</p>
              <div className="text-left mb-6">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Your Name (optional)</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-white placeholder-gray-600 outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <button onClick={() => setStep(2)} className="w-full rounded-xl px-5 py-3.5 font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-indigo-500/30">
                Let's Go →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h2 className="text-xl font-black mb-1">What's your target role?</h2>
              <p className="text-sm text-gray-500 mb-6">This helps us customize your skills, readiness score, and interview practice.</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {ROLES.map(role => (
                  <button key={role} onClick={() => setSelectedRole(role)}
                    className={`rounded-xl p-3 text-sm font-medium text-left border transition-all ${
                      selectedRole === role
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                        : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                    }`}>
                    {role}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="rounded-xl px-5 py-3 font-semibold text-gray-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition">← Back</button>
                <button onClick={() => setStep(3)} disabled={!selectedRole}
                  className="flex-1 rounded-xl px-5 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h2 className="text-xl font-black mb-1">Pick your current skills</h2>
              <p className="text-sm text-gray-500 mb-2">Select at least 3 you already know. You can always update later.</p>
              <p className="text-xs text-indigo-400 mb-5">{selectedSkills.length} selected</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {QUICK_SKILLS.map(skill => (
                  <button key={skill.name} onClick={() => toggleSkill(skill.name)}
                    className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                      selectedSkills.includes(skill.name)
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                        : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                    }`}>
                    {selectedSkills.includes(skill.name) ? '✓ ' : ''}{skill.name}
                  </button>
                ))}
              </div>

              {/* Custom Skill Input in Onboarding */}
              <div className="mb-8">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Don't see your skill? Add it:</label>
                <div className="flex gap-2">
                  <input 
                    id="custom-skill-onboarding"
                    placeholder="e.g. Docker, AWS..."
                    className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const name = e.target.value.trim()
                        if (!selectedSkills.includes(name)) {
                          toggleSkill(name)
                          // Also ensure it exists in global skills table
                          const { data: existing } = await supabase.from('skills').select('id').ilike('skill_name', name).maybeSingle()
                          if (!existing) {
                            await supabase.from('skills').insert({ 
                              skill_name: name, 
                              category: 'Custom',
                              user_id: user.id 
                            })
                          }
                        }
                        e.target.value = ''
                      }
                    }}
                  />
                  <button 
                    onClick={async () => {
                      const input = document.getElementById('custom-skill-onboarding')
                      const name = input.value.trim()
                      if (name && !selectedSkills.includes(name)) {
                        toggleSkill(name)
                        const { data: existing } = await supabase.from('skills').select('id').ilike('skill_name', name).maybeSingle()
                        if (!existing) {
                          await supabase.from('skills').insert({ 
                            skill_name: name, 
                            category: 'Custom',
                            user_id: user.id 
                          })
                        }
                        input.value = ''
                      }
                    }}
                    className="rounded-xl bg-white/[0.08] px-4 py-2 text-sm font-bold text-white hover:bg-white/[0.12] transition"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="rounded-xl px-5 py-3 font-semibold text-gray-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition">← Back</button>
                <button onClick={finish} disabled={saving || selectedSkills.length < 1}
                  className="flex-1 rounded-xl px-5 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30">
                  {saving ? 'Setting up...' : '🚀 Launch My Career OS'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-700 mt-5">You can update all this anytime in Settings</p>
      </div>
    </div>
  )
}
