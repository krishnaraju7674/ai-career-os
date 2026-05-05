import { useEffect, useRef, useState } from 'react'
import AppShell from '../components/AppShell'
import { primaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabaseClient'

const CATEGORY_ICONS = {
  'Frontend':     '🎨',
  'Backend':      '⚙️',
  'Mobile':       '📱',
  'Database':     '🗄️',
  'DevOps':       '🚀',
  'Cloud':        '☁️',
  'Language':     '💻',
  'Core CS':      '📐',
  'Data Science': '🤖',
  'Design':       '✏️',
  'Tools':        '🛠️',
  'Soft Skills':  '🗣️',
  'Custom':       '⭐',
}

const LEVEL_COLOR = {
  beginner:     'bg-red-500',
  intermediate: 'bg-yellow-500',
  advanced:     'bg-green-500',
}

export default function Skills() {
  const { user } = useAuth()
  const toast = useToast()
  const [skills, setSkills]           = useState([])
  const [userSkills, setUserSkills]   = useState({})
  const [saving, setSaving]           = useState(false)
  const [categories, setCategories]   = useState([])
  const [openCats, setOpenCats]       = useState({})   // which panels are open
  const [search, setSearch]           = useState('')
  const [customSkill, setCustomSkill] = useState('')
  const [adding, setAdding]           = useState(false)
  const addInputRef = useRef()

  /* ── Fetch ── */
  const fetchSkillsData = async () => {
    const [{ data: skillsData }, { data: userSkillsData }] = await Promise.all([
      supabase.from('skills').select('*').order('skill_name'),
      supabase.from('user_skills').select('*').eq('user_id', user.id),
    ])

    if (skillsData) {
      setSkills(skillsData)
      const rawCats = [...new Set(skillsData.map(s => s.category))]
      const sorted  = rawCats.filter(c => c !== 'Custom' && c !== null).sort()
      if (rawCats.includes('Custom')) sorted.push('Custom')
      setCategories(sorted)

      // Auto-open the first category on first load
      setOpenCats(prev => Object.keys(prev).length ? prev : { [sorted[0]]: true })
    }

    if (userSkillsData) {
      const map = {}
      userSkillsData.forEach(s => { map[s.skill_id] = s.level })
      setUserSkills(map)
    }
  }

  useEffect(() => { fetchSkillsData() }, [user.id])

  /* ── Toggle category panel ── */
  const toggleCat = (cat) => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }))

  /* ── Add custom skill ── */
  const handleAddCustomSkill = async () => {
    const name = customSkill.trim()
    if (!name) return
    setAdding(true)
    try {
      let { data: existing } = await supabase
        .from('skills').select('*').ilike('skill_name', name).maybeSingle()

      if (!existing) {
        const { data: created, error } = await supabase
          .from('skills')
          .insert({ skill_name: name, category: 'Custom', user_id: user.id })
          .select().single()
        if (error) throw error
        existing = created
      }

      if (!skills.find(s => s.id === existing.id)) {
        setSkills(prev => [...prev, existing])
        if (!categories.includes('Custom')) setCategories(prev => [...prev, 'Custom'])
      }
      handleSkillChange(existing.id, 'beginner')
      setOpenCats(prev => ({ ...prev, Custom: true }))
      setCustomSkill('')
      toast.success(`"${name}" added! Set your level below.`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAdding(false)
    }
  }

  /* ── Add custom skill with category ── */
  const handleAddCustomSkillWithCat = async (name, cat = 'Custom') => {
    setAdding(true)
    try {
      let { data: existing } = await supabase
        .from('skills').select('*').ilike('skill_name', name).maybeSingle()

      if (!existing) {
        const { data: created, error } = await supabase
          .from('skills')
          .insert({ skill_name: name, category: cat, user_id: user.id })
          .select().single()
        if (error) throw error
        existing = created
      }

      if (!skills.find(s => s.id === existing.id)) {
        setSkills(prev => [...prev, existing])
        if (!categories.includes(cat)) setCategories(prev => [...prev, cat])
      }
      handleSkillChange(existing.id, 'beginner')
      setOpenCats(prev => ({ ...prev, [cat]: true }))
      toast.success(`"${name}" added to ${cat}!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAdding(false)
    }
  }

  /* ── Rename Category ── */
  const handleRenameCategory = async (oldCat, newCat) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({ category: newCat })
        .eq('category', oldCat)
        .eq('user_id', user.id) // Only rename skills the user owns

      if (error) throw error
      toast.success(`Category renamed to ${newCat}!`)
      fetchSkillsData()
    } catch (e) {
      toast.error(e.message)
    }
  }

  /* ── Level toggle ── */
  const handleSkillChange = (skillId, level) => {
    setUserSkills(prev => ({ ...prev, [skillId]: level }))
  }

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true)
    const entries = Object.entries(userSkills).map(([skill_id, level]) => ({
      user_id: user.id, skill_id, level,
    }))
    if (entries.length === 0) {
      toast.warning('Select at least one skill before saving.')
      setSaving(false)
      return
    }
    await supabase.from('user_skills').delete().eq('user_id', user.id)
    const { error } = await supabase.from('user_skills').insert(entries)
    if (error) toast.error(error.message)
    else toast.success(`${entries.length} skills saved! ✓`)
    setSaving(false)
  }

  /* ── Filtered skills ── */
  const filtered = search.trim()
    ? skills.filter(s => s.skill_name.toLowerCase().includes(search.toLowerCase()))
    : null   // null = no filter applied

  const savedCount = Object.keys(userSkills).length

  return (
    <AppShell title="My Skills" subtitle="Click any category to expand it and set your level." maxWidth="max-w-4xl">
      <div className="space-y-4">

        {/* Search + Add bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search any skill..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <input
              ref={addInputRef}
              value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustomSkill()}
              placeholder="Add your own skill..."
              className="flex-1 sm:w-48 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 text-sm"
            />
            <button
              onClick={handleAddCustomSkill}
              disabled={adding || !customSkill.trim()}
              className="rounded-xl bg-indigo-600 px-4 font-bold text-white text-sm transition hover:bg-indigo-500 disabled:opacity-40 whitespace-nowrap"
            >
              {adding ? '...' : '+ Add'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-500">
            {savedCount > 0
              ? <span><span className="text-indigo-400 font-bold">{savedCount}</span> skills selected</span>
              : 'No skills selected yet'}
          </p>
          <button
            onClick={handleSave}
            disabled={saving || savedCount === 0}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition"
          >
            {saving ? 'Saving...' : `Save ${savedCount} skills →`}
          </button>
        </div>

        {/* Search Results */}
        {filtered && (
          <div className="rounded-2xl glass p-5 border border-indigo-500/20">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">
              Search results for "{search}" ({filtered.length} found)
            </p>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500">No skills found. Try adding it as a custom skill above.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map(skill => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    level={userSkills[skill.id]}
                    onChange={handleSkillChange}
                    onClear={() => { const u = {...userSkills}; delete u[skill.id]; setUserSkills(u) }}
                    onRename={async () => {
                      const n = prompt('Rename skill:', skill.skill_name)
                      if (n && n !== skill.skill_name) {
                        await supabase.from('skills').update({ skill_name: n }).eq('id', skill.id)
                        toast.success('Renamed!'); fetchSkillsData()
                      }
                    }}
                    onDelete={async () => {
                      if (confirm(`Delete "${skill.skill_name}"?`)) {
                        await supabase.from('skills').delete().eq('id', skill.id)
                        toast.success('Deleted!'); fetchSkillsData()
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Accordion Panels */}
        {!filtered && categories.map(category => {
          const catSkills   = skills.filter(s => s.category === category)
          const catSaved    = catSkills.filter(s => userSkills[s.id]).length
          const isOpen      = !!openCats[category]
          const icon        = CATEGORY_ICONS[category] || '📦'

          return (
            <div key={category} className="rounded-2xl glass border border-white/[0.06] overflow-hidden transition-all duration-200">
              {/* Header — click to open/close */}
              <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors group">
                <button
                  onClick={() => toggleCat(category)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{category}</p>
                    <p className="text-xs text-gray-500">{catSkills.length} skills</p>
                  </div>
                </button>
                
                <div className="flex items-center gap-3">
                  {catSaved > 0 && (
                    <span className="text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full px-2.5 py-0.5">
                      {catSaved} saved
                    </span>
                  )}
                  
                  {/* Category Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const skillName = prompt(`Add new skill to ${category}:`);
                        if (skillName) {
                          setCustomSkill(skillName);
                          // We'll slightly modify handleAddCustomSkill to accept a category
                          handleAddCustomSkillWithCat(skillName, category);
                        }
                      }}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20"
                    >
                      + Add
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newCat = prompt(`Rename category "${category}" to:`, category);
                        if (newCat && newCat !== category) {
                          handleRenameCategory(category, newCat);
                        }
                      }}
                      className="text-[10px] font-bold text-gray-500 hover:text-white bg-white/[0.05] px-2 py-1 rounded border border-white/[0.1]"
                    >
                      Edit
                    </button>
                  </div>

                  <button onClick={() => toggleCat(category)} className="p-1">
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Collapsible body */}
              {isOpen && (
                <div className="px-6 pb-5 border-t border-white/[0.04] space-y-2 pt-4 animate-fade-up">
                  {catSkills.map(skill => (
                    <SkillRow
                      key={skill.id}
                      skill={skill}
                      level={userSkills[skill.id]}
                      onChange={handleSkillChange}
                      onClear={() => { const u = {...userSkills}; delete u[skill.id]; setUserSkills(u) }}
                      onRename={async () => {
                        const n = prompt('Rename skill:', skill.skill_name)
                        if (n && n !== skill.skill_name) {
                          await supabase.from('skills').update({ skill_name: n }).eq('id', skill.id)
                          toast.success('Renamed!'); fetchSkillsData()
                        }
                      }}
                      onDelete={async () => {
                        if (confirm(`Delete "${skill.skill_name}"?`)) {
                          await supabase.from('skills').delete().eq('id', skill.id)
                          toast.success('Deleted!'); fetchSkillsData()
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Sticky Save Button */}
        <div className="sticky bottom-4 pt-2">
          <button onClick={handleSave} disabled={saving || savedCount === 0} className={`${primaryButtonClass} w-full`}>
            {saving ? 'Saving...' : `Save All ${savedCount} Selected Skills`}
          </button>
        </div>

      </div>
    </AppShell>
  )
}

/* ── Reusable Skill Row ── */
function SkillRow({ skill, level, onChange, onClear, onRename, onDelete }) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl px-3 py-2.5 transition-colors ${level ? 'bg-white/[0.04] border border-white/[0.07]' : 'hover:bg-white/[0.02]'}`}>
      <div className="flex items-center gap-2 min-w-0">
        {level && <span className={`w-2 h-2 rounded-full shrink-0 ${LEVEL_COLOR[level] || 'bg-gray-600'}`} />}
        <span className="font-semibold text-sm text-white truncate">{skill.skill_name}</span>
        {skill.user_id && (
          <span className="text-[9px] font-bold uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded px-1">custom</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {['beginner', 'intermediate', 'advanced'].map(lvl => (
          <button
            key={lvl}
            onClick={() => onChange(skill.id, lvl)}
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition-all ${
              level === lvl
                ? `${LEVEL_COLOR[lvl]} text-white shadow-sm`
                : 'bg-white/[0.06] text-gray-500 hover:bg-white/[0.1] hover:text-white'
            }`}
          >
            {lvl}
          </button>
        ))}
        {level && (
          <button onClick={onClear} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-gray-600 hover:text-red-400 transition">✕</button>
        )}
        {skill.user_id && (
          <>
            <button onClick={onRename} className="text-[10px] font-bold text-gray-600 hover:text-indigo-400 transition px-1">rename</button>
            <button onClick={onDelete} className="text-[10px] font-bold text-gray-600 hover:text-red-400 transition px-1">delete</button>
          </>
        )}
      </div>
    </div>
  )
}
