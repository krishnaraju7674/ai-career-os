import { useEffect, useMemo, useRef, useState } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, Card3D, StatusBadge, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'
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
    const timer = setTimeout(() => setLeft(seconds), 0)
    return () => clearTimeout(timer)
  }, [seconds])

  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { clearInterval(ref.current); onEnd?.(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [onEnd])

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
  const [sessions, setSessions] = useState([])
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

  // P2P Sandbox States
  const [p2pLogs, setP2pLogs] = useState(['[INFO] Standby. Ready to initialize WebRTC signaling...'])
  const [p2pMessages, setP2pMessages] = useState([])
  const [p2pCanvasPaths, setP2pCanvasPaths] = useState([])
  const [p2pIsDrawing, setP2pIsDrawing] = useState(false)
  const [p2pColor, setP2pColor] = useState('#06b6d4')
  const [p2pWidth, setP2pWidth] = useState(3)
  const [p2pConnecting, setP2pConnecting] = useState(false)
  const [p2pConnected, setP2pConnected] = useState(false)
  const [p2pVideoActive, setP2pVideoActive] = useState(false)
  const [p2pRemoteVideoActive, setP2pRemoteVideoActive] = useState(false)
  const [p2pMsgInput, setP2pMsgInput] = useState('')

  const p2pVideoRef = useRef(null)
  const p2pStreamRef = useRef(null)
  const p2pSvgRef = useRef(null)

  useEffect(() => {
    if (activeTab !== 'p2p') {
      if (p2pStreamRef.current) {
        p2pStreamRef.current.getTracks().forEach(track => track.stop())
        p2pStreamRef.current = null
      }
      if (p2pVideoRef.current) {
        p2pVideoRef.current.srcObject = null
      }
      setTimeout(() => {
        setP2pVideoActive(false)
      }, 0)
    }
  }, [activeTab])

  useEffect(() => {
    return () => {
      if (p2pStreamRef.current) {
        p2pStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (p2pVideoActive && p2pStreamRef.current && p2pVideoRef.current) {
      p2pVideoRef.current.srcObject = p2pStreamRef.current
    }
  }, [p2pVideoActive])

  const addP2pLog = (msg) => {
    const time = new Date().toTimeString().split(' ')[0]
    setP2pLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const startP2PSimulation = async () => {
    if (p2pConnecting || p2pConnected) return
    setP2pConnecting(true)
    addP2pLog('Initializing RTCPeerConnection (Local configuration)...')
    addP2pLog('Querying ICE Servers (STUN/TURN)...')
    addP2pLog('Resolved STUN: stun:stun1.l.google.com:19302')

    try {
      addP2pLog('Requesting webcam & microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      p2pStreamRef.current = stream
      setP2pVideoActive(true)
      addP2pLog('Local media stream bound to video channel successfully.')
    } catch (err) {
      console.warn('Webcam permission denied or error: ', err)
      addP2pLog('Warning: Webcam permission denied or camera not found. Using simulated candidate placeholder feed.')
    }

    addP2pLog('Creating local Session Description (SDP Offer)...')
    addP2pLog('ICE gathering state changed to: GATHERING')
    addP2pLog('Discovered local host candidate: candidate:3952402120 1 udp 2122260223 192.168.1.100 58712 typ host')
    addP2pLog('Discovered server-reflexive (STUN) candidate: candidate:824316982 1 udp 1686052607 203.0.113.50 58712 typ srflx')
    addP2pLog('ICE gathering state changed to: COMPLETE')
    addP2pLog('SDP Offer: type=offer, sdp=v=0\no=- 4210948572834 2 IN IP4 127.0.0.1...')

    setTimeout(() => {
      addP2pLog('SDP Offer transmitted to signaling broker.')
      addP2pLog('Waiting for peer SDP Answer...')
    }, 800)

    setTimeout(() => {
      addP2pLog('Received remote SDP Answer from peer client.')
      addP2pLog('Applying remote Session Description (SDP Answer)...')
      addP2pLog('ICE connection state changed to: CHECKING')
      addP2pLog('Selected candidate pair: 203.0.113.50:58712 <-> 198.51.100.120:3478 (RTT: 18ms)')
      addP2pLog('ICE connection state changed to: CONNECTED')
      addP2pLog('SCTP DataChannel ("whiteboard-channel") negotiated & established.')
      addP2pLog('WebRTC Peer Connection successfully completed! State: ACTIVE.')
      
      setP2pConnecting(false)
      setP2pConnected(true)
      setP2pRemoteVideoActive(true)
      
      setP2pMessages([
        { sender: 'system', text: '🔒 Encrypted P2P connection established. Room ID: career-os-sandbox-582' },
        { sender: 'peer', text: 'System: Peer interviewer (Senior Systems Engineer) has joined the discussion.' },
        { sender: 'peer', text: 'Hi! I see the connection is active. Welcome to the technical design session. Let\'s use the whiteboard to draft a fault-tolerant multi-region web architecture. Let me know when you\'re ready!' }
      ])
    }, 2200)
  }

  const handleWhiteboardStart = (e) => {
    if (!p2pConnected) return
    const rect = p2pSvgRef.current.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    if (clientX === undefined || clientY === undefined) return

    const x = clientX - rect.left
    const y = clientY - rect.top

    setP2pCanvasPaths(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        points: [{ x, y }],
        color: p2pColor,
        width: p2pWidth
      }
    ])
    setP2pIsDrawing(true)
  }

  const handleWhiteboardMove = (e) => {
    if (!p2pIsDrawing || !p2pConnected) return
    const rect = p2pSvgRef.current.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    if (clientX === undefined || clientY === undefined) return

    const x = clientX - rect.left
    const y = clientY - rect.top

    setP2pCanvasPaths(prev => {
      if (prev.length === 0) return prev
      const next = [...prev]
      const last = { ...next[next.length - 1] }
      const lastPoint = last.points[last.points.length - 1]
      const dist = lastPoint ? Math.hypot(lastPoint.x - x, lastPoint.y - y) : 999
      if (dist > 1.5) {
        last.points = [...last.points, { x, y }]
        next[next.length - 1] = last
      }
      return next
    })
  }

  const handleWhiteboardEnd = () => {
    setP2pIsDrawing(false)
  }

  const getSvgPathString = (points) => {
    if (!points || points.length === 0) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
  }

  const sendP2pMessage = (e) => {
    e.preventDefault()
    if (!p2pMsgInput.trim() || !p2pConnected) return

    const newMsg = { sender: 'user', text: p2pMsgInput.trim() }
    setP2pMessages(prev => [...prev, newMsg])
    const sentText = p2pMsgInput.trim().toLowerCase()
    setP2pMsgInput('')

    addP2pLog(`DataChannel: Transmitting packet: "${newMsg.text.slice(0, 25)}..."`)

    setTimeout(() => {
      let replyText = "Interesting points. Let's make sure we also add a database replica block in another region. Draw it or outline the recovery strategy."
      
      if (sentText.includes('ready') || sentText.includes('hi') || sentText.includes('hello')) {
        replyText = "Great! To start, let's design a system that handles 100k requests/sec. Where would you place the initial load balancer? Draw a block representing the Load Balancer (LB) and how traffic flows from the Client."
      } else if (sentText.includes('balancer') || sentText.includes('lb') || sentText.includes('traffic')) {
        replyText = "Nice. Now let's say we have three app servers behind that load balancer. Draw three servers and label them App-1, App-2, and App-3. How would you handle user session state?"
      } else if (sentText.includes('session') || sentText.includes('state') || sentText.includes('redis') || sentText.includes('database') || sentText.includes('db')) {
        replyText = "Exactly. Storing session state in Redis or a shared cache prevents inconsistencies. Let's draw a Cache block connecting to the App servers. How do you handle DB write failover?"
      } else if (sentText.includes('failover') || sentText.includes('master') || sentText.includes('replica') || sentText.includes('replication')) {
        replyText = "Excellent answer. A master-replica setup with automatic failover (like RDS Multi-AZ) keeps database writes safe. This architecture is solid! Feel free to practice more or continue testing other components."
      }

      setP2pMessages(prev => [...prev, { sender: 'peer', text: replyText }])
      addP2pLog('DataChannel: Received inbound message packet from peer.')
    }, 1500)
  }

  useEffect(() => {
    supabase.from('profiles').select('roles(role_name)').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.roles?.role_name) setTargetRole(data.roles.role_name) })
  }, [user.id])

  useEffect(() => {
    supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_type', 'technical')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to load recent sessions from Supabase, trying localStorage:', error)
          try {
            const cached = localStorage.getItem(`interview_sessions_${user.id}`)
            if (cached) setSessions(JSON.parse(cached))
          } catch (e) {
            console.error('Failed to parse local interview sessions cache:', e)
          }
        } else {
          const mapped = (data || []).map(d => ({
            id: d.id,
            role: d.role,
            score: d.score,
            answeredCount: d.answered_count,
            totalQuestions: d.total_questions,
            createdAt: new Date(d.created_at).toISOString().split('T')[0]
          }))
          setSessions(mapped)
        }
      })
  }, [user.id])

  useEffect(() => {
    if (user?.id && sessions.length > 0) {
      try {
        localStorage.setItem(`interview_sessions_${user.id}`, JSON.stringify(sessions))
      } catch (e) {
        console.error('Failed to save interview sessions to localStorage:', e)
      }
    }
  }, [sessions, user?.id])

  // Technical Calculations
  const questions = useMemo(() => getQuestionsForRole(targetRole), [targetRole])
  const currentQuestion = questions[techQIdx] || {}
  const currentAnswer = techAnswers[techQIdx] || ''
  const currentScore = scoreAnswer(currentAnswer)

  const averageScore = useMemo(() => {
    const scores = Object.values(techAnswers).filter(Boolean).map(scoreAnswer)
    return scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [techAnswers])

  const finishSession = async () => {
    const answered = Object.values(techAnswers).filter(Boolean).length
    if (answered === 0) { setTechMessage('Answer at least one question first.'); return }
    
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        role: targetRole,
        score: averageScore,
        answered_count: answered,
        total_questions: questions.length,
        session_type: 'technical'
      })
      .select()
      .single()

    if (error) {
      setTechMessage('Failed to save practice session: ' + error.message)
      return
    }

    const mapped = {
      id: data.id,
      role: data.role,
      score: data.score,
      answeredCount: data.answered_count,
      totalQuestions: data.total_questions,
      createdAt: new Date(data.created_at).toISOString().split('T')[0]
    }

    setSessions(prev => [mapped, ...prev].slice(0, 10))
    setTechAnswers({})
    setTechQIdx(0)
    setTechMessage('Session saved! Well done.')
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
        <button
          onClick={() => setActiveTab('p2p')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'p2p'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          📡 P2P Collaboration
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

      {/* P2P COLLABORATION TAB */}
      {activeTab === 'p2p' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] animate-fade-up">
          {/* Left Column: Feeds & Telemetry Logs */}
          <div className="space-y-6">
            <Panel>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">📡 P2P Sandbox & Video Feeds</h2>
                  <p className="text-xs text-gray-400 mt-1">Real-time local media capture & high-fidelity signaling telemetry</p>
                </div>
                {!p2pConnected && !p2pConnecting && (
                  <button
                    onClick={startP2PSimulation}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/15 transition cursor-pointer"
                  >
                    🔌 Connect Peer Sandbox
                  </button>
                )}
                {p2pConnecting && (
                  <span className="text-xs font-mono font-bold text-yellow-400 animate-pulse flex items-center gap-2">
                    <svg className="animate-spin h-3 w-3 text-yellow-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    SDP Signaling Active...
                  </span>
                )}
                {p2pConnected && (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    WebRTC Connected (RTT: 18ms)
                  </span>
                )}
              </div>

              {/* Video Panels */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Local Video */}
                <div className="relative aspect-video rounded-xl bg-black border border-white/5 overflow-hidden flex flex-col justify-center items-center">
                  {p2pVideoActive ? (
                    <video
                      ref={p2pVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2 text-gray-500">
                        📹
                      </div>
                      <p className="text-[11px] font-bold text-gray-400">Local Camera Standby</p>
                      <p className="text-[9px] text-gray-600 mt-0.5">Stream binds on connection</p>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur border border-white/10 text-[9px] px-2 py-0.5 rounded text-white font-mono flex items-center gap-1">
                    <span className={`w-1 h-1 rounded-full ${p2pVideoActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    Candidate (You)
                  </div>
                  {p2pVideoActive && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur border border-white/10 text-[9px] font-mono px-2 py-0.5 rounded text-cyan-300">
                      TX: 124 Kbps | Loss: 0%
                    </div>
                  )}
                </div>

                {/* Remote Video */}
                <div className="relative aspect-video rounded-xl bg-black border border-white/5 overflow-hidden flex flex-col justify-center items-center">
                  {p2pRemoteVideoActive ? (
                    <div className="w-full h-full bg-[#090d16] flex flex-col justify-center items-center relative">
                      {/* Cool Animated Graphic / Audio wave representing the Remote Interviewer */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20 text-white animate-pulse">
                        👤
                      </div>
                      <p className="text-xs font-bold text-gray-300 mt-3">Senior Interviewer (Peer)</p>
                      <div className="flex items-end gap-1.5 mt-2.5 h-6 px-4 py-1 bg-white/[0.02] border border-white/5 rounded-full">
                        <div className="w-1 bg-cyan-400 rounded-full animate-bounce h-2" style={{ animationDuration: '0.6s' }} />
                        <div className="w-1 bg-cyan-400 rounded-full animate-bounce h-4" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
                        <div className="w-1 bg-cyan-400 rounded-full animate-bounce h-3" style={{ animationDuration: '0.7s', animationDelay: '0.3s' }} />
                        <div className="w-1 bg-cyan-400 rounded-full animate-bounce h-1" style={{ animationDuration: '0.5s', animationDelay: '0.1s' }} />
                        <div className="w-1 bg-cyan-400 rounded-full animate-bounce h-2.5" style={{ animationDuration: '0.9s', animationDelay: '0.45s' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2 text-gray-500">
                        📡
                      </div>
                      <p className="text-[11px] font-bold text-gray-400">Peer Stream Offline</p>
                      <p className="text-[9px] text-gray-600 mt-0.5">Awaiting signaling match...</p>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur border border-white/10 text-[9px] px-2 py-0.5 rounded text-white font-mono flex items-center gap-1">
                    <span className={`w-1 h-1 rounded-full ${p2pRemoteVideoActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    Interviewer
                  </div>
                  {p2pRemoteVideoActive && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur border border-white/10 text-[9px] font-mono px-2 py-0.5 rounded text-cyan-300">
                      RX: 742 Kbps | RTT: 18ms
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            {/* Signaling logs console */}
            <Panel>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">📡 WebRTC Signaling Telemetry</span>
                <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                  ICE State: {p2pConnected ? 'CONNECTED' : p2pConnecting ? 'CHECKING' : 'IDLE'}
                </span>
              </div>
              <div className="bg-[#020617] border border-white/5 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-emerald-400/90 leading-tight space-y-1 scrollbar-thin select-text">
                {p2pLogs.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{log}</div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Right Column: Whiteboard & Chat */}
          <div className="space-y-6">
            {/* SVG Whiteboard Sandbox */}
            <Panel>
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">💡 Interactive Architecture Board</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setP2pCanvasPaths(prev => prev.slice(0, -1))}
                      disabled={p2pCanvasPaths.length === 0}
                      className="px-2.5 py-1 text-[10px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white rounded transition disabled:opacity-40 cursor-pointer"
                    >
                      ↩ Undo
                    </button>
                    <button
                      onClick={() => setP2pCanvasPaths([])}
                      disabled={p2pCanvasPaths.length === 0}
                      className="px-2.5 py-1 text-[10px] bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-300 rounded transition disabled:opacity-40 cursor-pointer"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>

                {/* Whiteboard Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-xl">
                  {/* Colors */}
                  <div className="flex items-center gap-1.5">
                    {['#06b6d4', '#ec4899', '#10b981', '#ffffff'].map(c => (
                      <button
                        key={c}
                        onClick={() => setP2pColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border cursor-pointer transition ${
                          p2pColor === c ? 'border-white scale-110 ring-2 ring-cyan-500/30' : 'border-transparent opacity-85 hover:opacity-100'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>

                  {/* Brush width */}
                  <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg border border-white/5">
                    {[2, 3, 5, 8].map(w => (
                      <button
                        key={w}
                        onClick={() => setP2pWidth(w)}
                        className={`px-2.5 py-0.5 text-[9px] font-bold rounded cursor-pointer transition ${
                          p2pWidth === w ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Whiteboard Drawing Canvas */}
              <div 
                className="relative border border-white/10 rounded-xl overflow-hidden cursor-crosshair bg-[#020617] h-64"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              >
                {!p2pConnected && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-center items-center text-center p-4">
                    <p className="text-xs font-bold text-gray-300">Whiteboard Locked</p>
                    <p className="text-[10px] text-gray-500 max-w-[200px] mt-1">Establish P2P WebRTC sandbox room connection to synchronize design drawings.</p>
                  </div>
                )}
                
                <svg
                  ref={p2pSvgRef}
                  onMouseDown={handleWhiteboardStart}
                  onMouseMove={handleWhiteboardMove}
                  onMouseUp={handleWhiteboardEnd}
                  onMouseLeave={handleWhiteboardEnd}
                  onTouchStart={handleWhiteboardStart}
                  onTouchMove={handleWhiteboardMove}
                  onTouchEnd={handleWhiteboardEnd}
                  className="w-full h-full touch-none select-none"
                >
                  {p2pCanvasPaths.map(path => (
                    <path
                      key={path.id}
                      d={getSvgPathString(path.points)}
                      fill="none"
                      stroke={path.color}
                      strokeWidth={path.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>
              </div>
            </Panel>

            {/* Real-time Peer Chat Console */}
            <Panel className="flex flex-col h-80">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">💬 Peer Chat Room</h3>
              
              {/* Message List */}
              <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 overflow-y-auto space-y-2 mb-3 scrollbar-thin select-text text-xs flex flex-col">
                {p2pMessages.length === 0 ? (
                  <div className="my-auto text-center text-gray-600 py-4">
                    <p className="text-[11px] font-bold">No chat packets routed yet.</p>
                    <p className="text-[9px] mt-0.5">Messages appear here once peer joins.</p>
                  </div>
                ) : (
                  p2pMessages.map((msg, idx) => {
                    if (msg.sender === 'system') {
                      return (
                        <div key={idx} className="text-center font-mono text-[9px] text-yellow-400/80 bg-yellow-500/5 border border-yellow-500/10 rounded-lg py-1 px-3 my-1">
                          {msg.text}
                        </div>
                      )
                    }
                    const isUser = msg.sender === 'user'
                    return (
                      <div
                        key={idx}
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs border ${
                          isUser
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200 self-end text-right'
                            : 'bg-white/[0.03] border-white/[0.08] text-gray-200 self-start'
                        }`}
                      >
                        <div className="text-[8px] font-mono text-gray-500 mb-0.5 uppercase tracking-wide">
                          {isUser ? 'Candidate' : 'Interviewer'}
                        </div>
                        {msg.text}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={sendP2pMessage} className="flex gap-2">
                <input
                  type="text"
                  value={p2pMsgInput}
                  onChange={e => setP2pMsgInput(e.target.value)}
                  disabled={!p2pConnected}
                  placeholder={p2pConnected ? "Type systems design response or chat..." : "Awaiting WebRTC connection..."}
                  className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition focus:border-white/40 focus:bg-white/[0.04]"
                />
                <button
                  type="submit"
                  disabled={!p2pConnected || !p2pMsgInput.trim()}
                  className="px-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center justify-center"
                >
                  Send
                </button>
              </form>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
