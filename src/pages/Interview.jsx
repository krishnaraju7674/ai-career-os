import { useEffect, useMemo, useRef, useState } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, Card3D, StatusBadge, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'
import { createId, readUserData, todayISO, writeUserData } from '../services/localUserData'
import { getQuestionsForRole, scoreAnswer, HR_QUESTIONS, GD_TOPICS, APTITUDE_QUESTIONS } from '../data/interviewQuestions'

const STAR_HINTS = [
  '🌟 Situation — Describe the context briefly.',
  '⚡ Task — What was your responsibility?',
  '🎯 Action — What specific steps did you take?',
  '✅ Result — What was the measurable outcome?'
]

function CountdownTimer({ seconds, onEnd }) {
  const [left, setLeft] = useState(seconds)
  const ref = useRef()
  useEffect(() => {
    setLeft(seconds)
    ref.current = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { clearInterval(ref.current); onEnd?.(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [seconds])
  const pct = (left / seconds) * 100
  const color = pct > 50 ? 'text-emerald-400' : pct > 20 ? 'text-yellow-400' : 'text-red-400'
  const m = String(Math.floor(left / 60)).padStart(2, '0')
  const s = String(left % 60).padStart(2, '0')
  return (
    <div className={`flex items-center gap-2 font-mono font-bold tabular-nums ${color}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {m}:{s}
    </div>
  )
}

export default function Interview() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('technical')
  const [targetRole, setTargetRole] = useState('General')
  
  // Technical Tab State
  const [techQIdx, setTechQIdx] = useState(0)
  const [techAnswers, setTechAnswers] = useState({})
  const [sessions, setSessions] = useState(() => readUserData(user.id, 'interviewSessions', []))
  const [techMessage, setTechMessage] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [timerOn, setTimerOn] = useState(false)
  const [timerKey, setTimerKey] = useState(0)

  // HR Tab State
  const [hrAnswers, setHrAnswers] = useState({})
  const [revealedHrAns, setRevealedHrAns] = useState({})

  // GD Tab State
  const [gdTopic, setGdTopic] = useState("AI replacing software engineering jobs - boon or bane?")
  const [gdTimerSeconds, setGdTimerSeconds] = useState(300) // 5 mins
  const [gdTimerActive, setGdTimerActive] = useState(false)

  // Aptitude Tab State
  const [aptAnswers, setAptAnswers] = useState({}) // { apt_1: '150 meters' }
  const [submittedApt, setSubmittedApt] = useState({}) // { apt_1: true }
  const [aptScore, setAptScore] = useState(0)

  useEffect(() => {
    supabase.from('profiles').select('roles(role_name)').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.roles?.role_name) setTargetRole(data.roles.role_name) })
  }, [user.id])

  // Technical Calculations
  const questions = useMemo(() => getQuestionsForRole(targetRole), [targetRole])
  const currentQuestion = questions[techQIdx] || {}
  const currentAnswer = techAnswers[techQIdx] || ''
  const currentScore = scoreAnswer(currentAnswer)

  const averageScore = useMemo(() => {
    const scores = Object.values(techAnswers).filter(Boolean).map(scoreAnswer)
    return scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [techAnswers])

  const saveSessions = (next) => { setSessions(next); writeUserData(user.id, 'interviewSessions', next) }

  const finishSession = () => {
    const answered = Object.values(techAnswers).filter(Boolean).length
    if (answered === 0) { setTechMessage('Answer at least one question first.'); return }
    const session = { id: createId('interview'), role: targetRole, score: averageScore, answeredCount: answered, totalQuestions: questions.length, createdAt: todayISO() }
    saveSessions([session, ...sessions].slice(0, 10))
    setTechAnswers({}); setTechQIdx(0); setTechMessage('Session saved! Well done.')
  }

  // GD generator
  const rollGdTopic = () => {
    const randomIdx = Math.floor(Math.random() * GD_TOPICS.length)
    setGdTopic(GD_TOPICS[randomIdx])
    setGdTimerSeconds(300)
    setGdTimerActive(false)
  }

  // Aptitude check
  const handleAptSelect = (qId, option) => {
    if (submittedApt[qId]) return
    setAptAnswers({ ...aptAnswers, [qId]: option })
  }

  const submitAptAnswer = (qId, correctVal) => {
    if (submittedApt[qId]) return
    const isCorrect = aptAnswers[qId] === correctVal
    if (isCorrect) {
      setAptScore(prev => prev + 20)
    }
    setSubmittedApt({ ...submittedApt, [qId]: true })
  }

  return (
    <AppShell title="Interview Prep Command Center" subtitle="Master technical, behavioral, aptitude, and Group Discussions." maxWidth="max-w-6xl">
      
      {/* Upper Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8 bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('technical')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'technical'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          🖥️ Technical Prep
        </button>
        <button
          onClick={() => setActiveTab('hr')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'hr'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          💬 HR & Behavioral
        </button>
        <button
          onClick={() => setActiveTab('gd')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'gd'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          📢 Group Discussion
        </button>
        <button
          onClick={() => setActiveTab('aptitude')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'aptitude'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          🧩 Aptitude Test
        </button>
      </div>

      {/* TECHNICAL PREP TAB */}
      {activeTab === 'technical' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5 animate-fade-up">
            <Panel>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Practicing as</p>
                  <h2 className="text-xl font-bold text-white">{targetRole}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Field label="Target Role">
                    <select
                      value={targetRole}
                      onChange={e => { setTargetRole(e.target.value); setTechQIdx(0); setTechAnswers({}) }}
                      className={inputClass + ' !py-2 !text-xs !w-44'}
                    >
                      <option>General</option>
                      <option>Frontend Developer</option>
                      <option>Backend Developer</option>
                      <option>Full Stack Developer</option>
                      <option>Data Analyst</option>
                    </select>
                  </Field>
                  <div className="flex items-center gap-2 mt-5">
                    <button
                      onClick={() => { setTimerOn(t => !t); setTimerKey(k => k + 1) }}
                      className={`text-xs rounded-full px-3 py-1.5 border transition cursor-pointer ${
                        timerOn ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white'
                      }`}
                    >
                      ⏱ Timer {timerOn ? 'ON' : 'OFF'}
                    </button>
                    {timerOn && <CountdownTimer key={timerKey} seconds={120} onEnd={() => setTechQIdx(i => Math.min(questions.length - 1, i + 1))} />}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center justify-between mb-5">
                <StatusBadge tone="cyan">Question {techQIdx + 1} / {questions.length}</StatusBadge>
                <StatusBadge tone={currentScore >= 70 ? 'green' : currentScore >= 40 ? 'yellow' : 'red'}>
                  Score: {currentScore}%
                </StatusBadge>
              </div>

              <h3 className="text-xl font-bold leading-snug text-white mb-5">
                {currentQuestion.question || "No question configured for this role."}
              </h3>

              <textarea
                value={currentAnswer}
                onChange={e => { setTechAnswers({ ...techAnswers, [techQIdx]: e.target.value }); setTechMessage('') }}
                className={`${inputClass} min-h-52 resize-none`}
                placeholder="Type your answer. Use structural reasoning (e.g. STAR method or explicit examples)..."
              />

              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                >
                  {showHint ? 'Hide hint' : '💡 Show hint'}
                </button>
              </div>

              {showHint && (
                <div className="mt-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-4 animate-fade-up">
                  <p className="text-xs font-semibold text-cyan-300 mb-2">Hint & STAR Guidelines</p>
                  <p className="text-xs text-gray-400 mb-3">{currentQuestion.hint}</p>
                  <ul className="space-y-1">
                    {STAR_HINTS.map((h, i) => (
                      <li key={i} className="text-xs text-gray-500">{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {techMessage && <p className="mt-3 text-sm text-cyan-300 animate-fade-in">{techMessage}</p>}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => { setTechQIdx(i => Math.max(0, i - 1)); setShowHint(false); setTimerKey(k => k + 1) }}
                  disabled={techQIdx === 0}
                  className={secondaryButtonClass + ' !py-2.5 !text-xs'}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => { setTechQIdx(i => Math.min(questions.length - 1, i + 1)); setShowHint(false); setTimerKey(k => k + 1) }}
                  disabled={techQIdx === questions.length - 1}
                  className={secondaryButtonClass + ' !py-2.5 !text-xs'}
                >
                  Next →
                </button>
                <button onClick={finishSession} className={primaryButtonClass + ' !py-2.5 !text-xs ml-auto'}>
                  💾 Save Practice Session
                </button>
              </div>
            </Panel>
          </div>

          <div className="space-y-5 animate-fade-up delay-100">
            <Panel>
              <h2 className="font-bold text-sm text-gray-400 mb-3 uppercase tracking-wider">Session Average</h2>
              <p className={`text-5xl font-black ${averageScore >= 70 ? 'text-emerald-400' : averageScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {averageScore}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Based on keywords and length criteria</p>
              <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${averageScore >= 70 ? 'bg-emerald-500' : averageScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${averageScore}%` }}
                />
              </div>
            </Panel>

            <Panel>
              <h2 className="font-bold text-sm text-gray-400 mb-4 uppercase tracking-wider">Recent Sessions</h2>
              {sessions.length === 0 ? (
                <p className="text-xs text-gray-500">No mock logs recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 4).map(s => (
                    <div key={s.id} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-white truncate">{s.role}</p>
                        <span className={`text-xs font-bold ${s.score >= 70 ? 'text-emerald-400' : s.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {s.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600 mt-1">{s.answeredCount}/{s.totalQuestions} answers · {s.createdAt}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* HR & BEHAVIORAL TAB */}
      {activeTab === 'hr' && (
        <div className="space-y-6 animate-fade-up">
          <Panel>
            <h2 className="text-xl font-bold text-white mb-2">HR & Placement Behavioral Questions</h2>
            <p className="text-sm text-gray-400">
              Prepare answers for common hiring manager questions. Draft your answers and compare with our expert responses.
            </p>
          </Panel>

          <div className="space-y-4">
            {HR_QUESTIONS.map((q, idx) => (
              <Card3D key={q.id}>
                <h3 className="text-lg font-bold text-white mb-2">Q{idx + 1}: {q.question}</h3>
                <p className="text-xs text-cyan-400 italic mb-4">💡 Tip: {q.hint}</p>

                <textarea
                  value={hrAnswers[q.id] || ''}
                  onChange={e => setHrAnswers({ ...hrAnswers, [q.id]: e.target.value })}
                  placeholder="Draft your thoughts here..."
                  className={`${inputClass} min-h-24 text-sm`}
                />

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setRevealedHrAns({ ...revealedHrAns, [q.id]: !revealedHrAns[q.id] })}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.06] cursor-pointer"
                  >
                    {revealedHrAns[q.id] ? 'Hide Expert Answer' : 'Reveal Expert Answer'}
                  </button>
                  {hrAnswers[q.id] && (
                    <StatusBadge tone={scoreAnswer(hrAnswers[q.id]) >= 70 ? 'green' : 'yellow'}>
                      Draft Quality: {scoreAnswer(hrAnswers[q.id])}%
                    </StatusBadge>
                  )}
                </div>

                {revealedHrAns[q.id] && (
                  <div className="mt-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 animate-fade-in">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Expert Sample Answer:</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{q.sampleAnswer}</p>
                  </div>
                )}
              </Card3D>
            ))}
          </div>
        </div>
      )}

      {/* GROUP DISCUSSION TAB */}
      {activeTab === 'gd' && (
        <div className="grid gap-6 md:grid-cols-3 animate-fade-up">
          <div className="md:col-span-2 space-y-5">
            <Panel>
              <h2 className="text-2xl font-bold text-white mb-4">GD Practice Dashboard</h2>
              <div className="rounded-2xl bg-[#020617] border border-cyan-500/20 p-6 text-center my-6">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">GD TOPIC OF THE DAY</span>
                <p className="text-xl font-bold text-white leading-relaxed max-w-lg mx-auto">
                  "{gdTopic}"
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={rollGdTopic}
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white transition-all cursor-pointer"
                >
                  🎲 Roll Random Topic
                </button>
                <button
                  onClick={() => setGdTimerActive(!gdTimerActive)}
                  className={`px-5 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    gdTimerActive
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  }`}
                >
                  {gdTimerActive ? 'Stop GD Timer ⏸' : 'Start 5m Timer ⏱'}
                </button>
              </div>

              {gdTimerActive && (
                <div className="mt-6 flex justify-center">
                  <CountdownTimer
                    seconds={gdTimerSeconds}
                    onEnd={() => {
                      setGdTimerActive(false)
                      alert("Group Discussion simulation time completed!")
                    }}
                  />
                </div>
              )}
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Cracking GD Tips</h3>
              <ul className="space-y-4">
                <li className="text-xs text-gray-300 leading-relaxed">
                  💡 <strong>Initiation:</strong> Try to initiate the discussion only if you know the topic well. It scores massive points.
                </li>
                <li className="text-xs text-gray-300 leading-relaxed">
                  🤝 <strong>Team Player:</strong> Do not shout or dominate. Value other opinions and use phrases like 'I agree with my friend, and would like to add...'.
                </li>
                <li className="text-xs text-gray-300 leading-relaxed">
                  📊 <strong>Facts & Data:</strong> Support your arguments with real stats and structured frameworks.
                </li>
                <li className="text-xs text-gray-300 leading-relaxed">
                  📝 <strong>Summarization:</strong> If you couldn't initiate, try to summarize the final discussion points at the end.
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      )}

      {/* APTITUDE TEST TAB */}
      {activeTab === 'aptitude' && (
        <div className="space-y-6 animate-fade-up">
          <Panel className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Quantitative & Logical Aptitude Practice</h2>
              <p className="text-sm text-gray-400 mt-1">Verify your computational and logical problem-solving speed.</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Test Score</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{aptScore} pts</span>
            </div>
          </Panel>

          <div className="space-y-6">
            {APTITUDE_QUESTIONS.map((apt, idx) => {
              const answered = aptAnswers[apt.id]
              const submitted = submittedApt[apt.id]
              return (
                <Card3D key={apt.id}>
                  <div className="flex justify-between items-center gap-3 mb-4">
                    <StatusBadge tone="blue">Q{idx + 1}: {apt.category}</StatusBadge>
                    {submitted && (
                      <span className={`text-xs font-bold ${answered === apt.answer ? 'text-emerald-400' : 'text-red-400'}`}>
                        {answered === apt.answer ? '✓ Correct (+20 pts)' : `✗ Incorrect (Correct: ${apt.answer})`}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-white font-semibold leading-relaxed mb-4">
                    {apt.question}
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {apt.options.map((opt, oIdx) => {
                      const isSelected = answered === opt
                      return (
                        <button
                          key={oIdx}
                          disabled={submitted}
                          onClick={() => handleAptSelect(apt.id, opt)}
                          className={`px-4 py-3 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-gray-300'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>

                  {!submitted && (
                    <button
                      disabled={!answered}
                      onClick={() => submitAptAnswer(apt.id, apt.answer)}
                      className={primaryButtonClass + ' !py-2 !text-xs'}
                    >
                      Check Answer
                    </button>
                  )}

                  {submitted && (
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-gray-400 leading-relaxed animate-fade-in">
                      <strong>Explanation:</strong> {apt.explanation}
                    </div>
                  )}
                </Card3D>
              )
            })}
          </div>
        </div>
      )}
    </AppShell>
  )
}
