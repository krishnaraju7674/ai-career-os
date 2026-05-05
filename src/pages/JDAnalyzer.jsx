import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, StatusBadge, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'

const SKILL_KEYWORDS = [
  'javascript', 'react', 'node', 'express', 'sql', 'python', 'java', 'html', 'css', 'git',
  'mongodb', 'typescript', 'redux', 'tailwind', 'rest', 'api', 'agile', 'docker', 'aws',
  'figma', 'graphql', 'next', 'vue', 'angular', 'spring', 'django', 'flask', 'linux',
  'dsa', 'data structures', 'algorithms', 'problem solving', 'teamwork', 'communication',
  'leadership', 'machine learning', 'deep learning', 'tensorflow', 'pandas', 'numpy',
]

function extractFromJD(text) {
  const lower = text.toLowerCase()
  const found = SKILL_KEYWORDS.filter(k => lower.includes(k))

  // Extract experience mentions
  const expMatch = lower.match(/(\d+)\+?\s*(?:year|yr)s?\s*(?:of\s*)?experience/i)
  const exp = expMatch ? `${expMatch[1]}+ years` : null

  // Extract degree mentions
  const degree = lower.includes('bachelor') || lower.includes('b.tech') || lower.includes('b.e') ? 'Bachelor\'s Degree' : null

  // Extract role type
  let roleType = 'Full-time'
  if (lower.includes('intern')) roleType = 'Internship'
  if (lower.includes('contract')) roleType = 'Contract'
  if (lower.includes('freelance')) roleType = 'Freelance'

  return { found, exp, degree, roleType }
}

export default function JDAnalyzer() {
  const { user } = useAuth()
  const [jdText, setJdText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [userSkillNames, setUserSkillNames] = useState([])

  useEffect(() => {
    supabase
      .from('user_skills')
      .select('skills(skill_name)')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setUserSkillNames((data || []).map(s => s.skills?.skill_name?.toLowerCase()).filter(Boolean))
      })
  }, [user.id])

  const analyze = () => {
    if (!jdText.trim()) return
    setAnalyzing(true)
    setTimeout(() => {
      const { found, exp, degree, roleType } = extractFromJD(jdText)
      const matched = found.filter(k => userSkillNames.some(u => u.includes(k) || k.includes(u)))
      const missing = found.filter(k => !matched.includes(k))
      const matchPct = found.length === 0 ? 0 : Math.round((matched.length / found.length) * 100)
      setResult({ found, matched, missing, matchPct, exp, degree, roleType, wordCount: jdText.split(/\s+/).length })
      setAnalyzing(false)
    }, 800)
  }

  const scoreColor = (p) => p >= 70 ? 'text-green-400' : p >= 40 ? 'text-yellow-400' : 'text-red-400'
  const scoreLabel = (p) => p >= 70 ? 'Strong Match' : p >= 40 ? 'Partial Match' : 'Skill Gap'

  return (
    <AppShell
      title="JD Analyzer"
      subtitle="Paste a job description to see how well your skills match and what to upskill next."
      maxWidth="max-w-4xl"
    >
      <Panel className="mb-6 animate-fade-up">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Job Description</label>
        <textarea
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={8}
          className={`${inputClass} resize-none`}
        />
        <div className="mt-4 flex items-center gap-3">
          <button onClick={analyze} disabled={!jdText.trim() || analyzing} className={primaryButtonClass}>
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </span>
            ) : '🔍 Analyze JD'}
          </button>
          {jdText && (
            <button onClick={() => { setJdText(''); setResult(null) }} className={secondaryButtonClass}>Clear</button>
          )}
        </div>
      </Panel>

      {result && (
        <div className="space-y-5 animate-fade-up">
          {/* Match score */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Panel className="text-center col-span-2 md:col-span-1">
              <p className={`text-5xl font-black ${scoreColor(result.matchPct)}`}>{result.matchPct}%</p>
              <p className={`text-sm font-semibold mt-1 ${scoreColor(result.matchPct)}`}>{scoreLabel(result.matchPct)}</p>
              <p className="text-xs text-gray-500 mt-1">Skill Match</p>
            </Panel>
            <Panel className="text-center">
              <p className="text-3xl font-black text-green-400">{result.matched.length}</p>
              <p className="text-xs text-gray-500 mt-1">Skills Matched</p>
            </Panel>
            <Panel className="text-center">
              <p className="text-3xl font-black text-red-400">{result.missing.length}</p>
              <p className="text-xs text-gray-500 mt-1">Skills Missing</p>
            </Panel>
            <Panel className="text-center">
              <StatusBadge tone="blue">{result.roleType}</StatusBadge>
              {result.exp && <p className="text-xs text-gray-400 mt-2">{result.exp}</p>}
              {result.degree && <p className="text-xs text-gray-500 mt-1">{result.degree}</p>}
            </Panel>
          </div>

          {/* Match bar */}
          <Panel>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Match Breakdown</h3>
              <span className={`text-sm font-bold ${scoreColor(result.matchPct)}`}>{result.matchPct}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${result.matchPct >= 70 ? 'bg-green-500' : result.matchPct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${result.matchPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You have {result.matched.length} of {result.found.length} required skills. {result.missing.length > 0 ? `Learn ${result.missing.slice(0, 3).join(', ')} to improve your match.` : 'Excellent coverage!'}
            </p>
          </Panel>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Matched skills */}
            <Panel>
              <h3 className="font-bold text-sm mb-4 text-green-400">✅ Matched Skills ({result.matched.length})</h3>
              {result.matched.length === 0
                ? <p className="text-xs text-gray-500">No skills matched. Make sure you've saved skills in the Skills page.</p>
                : <div className="flex flex-wrap gap-2">
                  {result.matched.map(k => (
                    <span key={k} className="rounded-full bg-green-500/10 border border-green-500/30 px-3 py-1 text-xs text-green-300 capitalize">{k}</span>
                  ))}
                </div>
              }
            </Panel>

            {/* Missing skills */}
            <Panel>
              <h3 className="font-bold text-sm mb-4 text-red-400">❌ Missing Skills ({result.missing.length})</h3>
              {result.missing.length === 0
                ? <p className="text-xs text-gray-400">🎉 You have all detected skills!</p>
                : <div className="flex flex-wrap gap-2">
                  {result.missing.map(k => (
                    <span key={k} className="rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs text-red-300 capitalize">{k}</span>
                  ))}
                </div>
              }
            </Panel>
          </div>

          {/* Action plan */}
          {result.missing.length > 0 && (
            <Panel>
              <h3 className="font-bold text-sm mb-3">📋 Suggested Action Plan</h3>
              <ul className="space-y-2">
                {result.missing.slice(0, 5).map(k => (
                  <li key={k} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-indigo-400 mt-0.5">→</span>
                    Learn <strong className="text-white capitalize mx-1">{k}</strong> — add it to your Planner as a weekly goal.
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </AppShell>
  )
}
