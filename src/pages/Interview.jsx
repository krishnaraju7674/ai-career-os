import { useEffect, useMemo, useRef, useState } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, StatusBadge, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'
import { createId, readUserData, todayISO, writeUserData } from '../services/localUserData'
import { getQuestionsForRole, scoreAnswer } from '../data/interviewQuestions'

const STAR_HINTS = {
  default: ['🌟 Situation — Describe the context briefly.', '⚡ Task — What was your responsibility?', '🎯 Action — What specific steps did you take?', '✅ Result — What was the measurable outcome?'],
}

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
  const color = pct > 50 ? 'text-green-400' : pct > 20 ? 'text-yellow-400' : 'text-red-400'
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
  const [targetRole, setTargetRole] = useState('General')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [sessions, setSessions] = useState(() => readUserData(user.id, 'interviewSessions', []))
  const [message, setMessage] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [timerOn, setTimerOn] = useState(false)
  const [timerKey, setTimerKey] = useState(0)

  useEffect(() => {
    supabase.from('profiles').select('roles(role_name)').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.roles?.role_name) setTargetRole(data.roles.role_name) })
  }, [user.id])

  const questions = useMemo(() => getQuestionsForRole(targetRole), [targetRole])
  const currentQuestion = questions[questionIndex]
  const currentAnswer = answers[questionIndex] || ''
  const currentScore = scoreAnswer(currentAnswer)

  const averageScore = useMemo(() => {
    const scores = Object.values(answers).filter(Boolean).map(scoreAnswer)
    return scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [answers])

  const scoreColor = (s) => s >= 70 ? 'text-green-400' : s >= 40 ? 'text-yellow-400' : 'text-red-400'
  const scoreTone = (s) => s >= 70 ? 'green' : s >= 40 ? 'yellow' : 'red'

  const saveSessions = (next) => { setSessions(next); writeUserData(user.id, 'interviewSessions', next) }

  const finishSession = () => {
    const answered = Object.values(answers).filter(Boolean).length
    if (answered === 0) { setMessage('Answer at least one question first.'); return }
    const session = { id: createId('interview'), role: targetRole, score: averageScore, answeredCount: answered, totalQuestions: questions.length, createdAt: todayISO() }
    saveSessions([session, ...sessions].slice(0, 10))
    setAnswers({}); setQuestionIndex(0); setMessage('Session saved! Well done.')
  }

  const nextQ = () => { setQuestionIndex(i => Math.min(questions.length - 1, i + 1)); setShowHint(false); setTimerKey(k => k + 1) }
  const prevQ = () => { setQuestionIndex(i => Math.max(0, i - 1)); setShowHint(false); setTimerKey(k => k + 1) }

  const barData = Object.entries(answers).filter(([, a]) => a).map(([i, a]) => ({ q: +i + 1, score: scoreAnswer(a) }))

  return (
    <AppShell title="Mock Interview" subtitle="Practice, score yourself, and review your sessions." maxWidth="max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          {/* Controls */}
          <Panel className="animate-fade-up">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Practicing as</p>
                <h2 className="text-xl font-bold">{targetRole}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Field label="Role">
                  <select value={targetRole}
                    onChange={e => { setTargetRole(e.target.value); setQuestionIndex(0); setAnswers({}) }}
                    className={inputClass + ' !py-2 !text-sm'}>
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
                    className={`text-xs rounded-full px-3 py-1.5 border transition ${timerOn ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white'}`}>
                    ⏱ Timer {timerOn ? 'ON' : 'OFF'}
                  </button>
                  {timerOn && <CountdownTimer key={timerKey} seconds={120} onEnd={nextQ} />}
                </div>
              </div>
            </div>
          </Panel>

          {/* Question */}
          <Panel className="animate-fade-up delay-100">
            <div className="flex items-center justify-between mb-5">
              <StatusBadge tone="indigo">Q {questionIndex + 1} / {questions.length}</StatusBadge>
              <StatusBadge tone={scoreTone(currentScore)}>{currentScore}% — {currentScore >= 75 ? 'Strong' : currentScore >= 45 ? 'Good Start' : 'Needs Work'}</StatusBadge>
            </div>

            <h3 className="text-xl font-bold leading-snug mb-5">{currentQuestion}</h3>

            <textarea
              value={currentAnswer}
              onChange={e => { setAnswers({ ...answers, [questionIndex]: e.target.value }); setMessage('') }}
              className={`${inputClass} min-h-52 resize-none`}
              placeholder="Type your answer using the STAR method: Situation, Task, Action, Result..."
            />

            {/* Hint */}
            <button onClick={() => setShowHint(h => !h)} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              {showHint ? 'Hide hint' : 'Show STAR hint'}
            </button>

            {showHint && (
              <div className="mt-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 p-4 animate-fade-up">
                <p className="text-xs font-semibold text-indigo-300 mb-2">STAR Method Guide</p>
                <ul className="space-y-1.5">
                  {STAR_HINTS.default.map((h, i) => (
                    <li key={i} className="text-xs text-gray-400">{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {message && <p className="mt-3 text-sm text-indigo-300 animate-fade-in">{message}</p>}

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={prevQ} disabled={questionIndex === 0} className={secondaryButtonClass + ' !py-2'}>← Previous</button>
              <button onClick={nextQ} disabled={questionIndex === questions.length - 1} className={secondaryButtonClass + ' !py-2'}>Next →</button>
              <button onClick={finishSession} className={primaryButtonClass + ' !py-2'}>💾 Save Session</button>
            </div>
          </Panel>

          {/* Score bars */}
          {barData.length > 0 && (
            <Panel className="animate-fade-up delay-200">
              <h3 className="font-bold text-sm mb-4">Session Score Breakdown</h3>
              <div className="space-y-2.5">
                {barData.map(({ q, score }) => (
                  <div key={q} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8 shrink-0">Q{q}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${scoreColor(score)}`}>{score}%</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          <Panel className="animate-fade-up delay-100">
            <h2 className="font-bold text-sm mb-3">Live Score</h2>
            <p className={`text-5xl font-black ${scoreColor(averageScore)}`}>{averageScore}%</p>
            <p className="text-xs text-gray-500 mt-1">Average across {Object.values(answers).filter(Boolean).length} answers</p>
            <div className="mt-4 h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${averageScore >= 70 ? 'bg-green-500' : averageScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${averageScore}%` }} />
            </div>
          </Panel>

          <Panel className="animate-fade-up delay-200">
            <h2 className="font-bold text-sm mb-4">Recent Sessions</h2>
            {sessions.length === 0
              ? <p className="text-xs text-gray-500">No sessions yet.</p>
              : <div className="space-y-3">
                {sessions.slice(0, 5).map(s => (
                  <div key={s.id} className="rounded-xl bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">{s.role}</p>
                      <StatusBadge tone={scoreTone(s.score)}>{s.score}%</StatusBadge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{s.answeredCount}/{s.totalQuestions} answered · {s.createdAt}</p>
                  </div>
                ))}
              </div>
            }
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
