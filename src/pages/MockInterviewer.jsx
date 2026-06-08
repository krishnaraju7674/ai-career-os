import { useState, useEffect, useRef } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, Card3D, StatusBadge, inputClass, primaryButtonClass, secondaryButtonClass } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabaseClient'
import { MicrophoneIcon } from '../components/icons'

export default function MockInterviewer() {
  const { user } = useAuth()
  const toast = useToast()
  
  // Setup state
  const [role, setRole] = useState('Frontend Developer')
  const [difficulty, setDifficulty] = useState('Junior')
  const [isStarted, setIsStarted] = useState(false)
  
  // Chat state
  const [history, setHistory] = useState([]) // [{ role: 'user' | 'model', text: '' }]
  const [currentInput, setCurrentInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState(0) // Tracks how many questions asked
  const [grades, setGrades] = useState([]) // [{ qNum: 1, score: 7, feedback: '' }]
  const [isFinished, setIsFinished] = useState(false)
  const [avgScore, setAvgScore] = useState(0)

  const messagesEndRef = useRef(null)

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef(null)

  // Analytics states
  const [qStartTime, setQStartTime] = useState(null)
  const [totalWords, setTotalWords] = useState(0)
  const [totalTimeMs, setTotalTimeMs] = useState(0)
  const [fillerCount, setFillerCount] = useState(0)
  const [pacingWpm, setPacingWpm] = useState(0)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-IN'

      rec.onresult = (e) => {
        let transcript = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript
        }
        setCurrentInput(transcript)
      }

      rec.onerror = (err) => {
        console.error("Speech recognition error:", err)
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
  }, [])

  const toggleListening = () => {
    if (!speechSupported) {
      toast.show('Speech recognition is not supported in this browser.', 'warning')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error(err)
      }
    }
  }

  useEffect(() => {
    // Fetch profile role if any
    supabase.from('profiles').select('roles(role_name)').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.roles?.role_name) setRole(data.roles.role_name)
      })
  }, [user.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  // Starts the interview session
  const startInterview = async () => {
    setIsStarted(true)
    setLoading(true)
    setHistory([])
    setGrades([])
    setQuestionCount(1)
    setIsFinished(false)
    setTotalWords(0)
    setTotalTimeMs(0)
    setFillerCount(0)
    setPacingWpm(0)
    
    const initialSystemPrompt = `You are a professional technical interviewer for a ${role} position (${difficulty} level). 
First, introduce yourself briefly, and then ask ONLY the first technical question. 
Do not write out the entire interview, and do not provide the answer. Wait for the candidate's response.`;

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: initialSystemPrompt }] }
          ]
        })
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to connect to AI')
      
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Let's begin! What is your experience with this tech stack?"
      setHistory([{ role: 'model', text: reply }])
      setQStartTime(Date.now())
    } catch (err) {
      toast.show('Error initiating interview: ' + err.message, 'error')
      setIsStarted(false)
    } finally {
      setLoading(false)
    }
  }

  // Handle user response submission
  const submitAnswer = async () => {
    if (!currentInput.trim()) return
    const userAns = currentInput
    setCurrentInput('')

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
    
    // Add user response to local chat history
    const nextHistory = [...history, { role: 'user', text: userAns }]
    setHistory(nextHistory)
    setLoading(true)

    // Analyze filler words
    const fillers = ['um', 'uh', 'like', 'so', 'basically', 'actually', 'literally', 'you know', 'mean']
    const words = userAns.toLowerCase().split(/\s+/).filter(Boolean)
    const currentFillers = words.filter(w => fillers.includes(w)).length
    setFillerCount(prev => prev + currentFillers)

    // Calculate pacing WPM
    let nextWords = totalWords + words.length
    let nextTimeMs = totalTimeMs
    if (qStartTime) {
      const elapsed = Date.now() - qStartTime
      nextTimeMs += elapsed
      setTotalWords(nextWords)
      setTotalTimeMs(nextTimeMs)
      
      const totalTimeMin = nextTimeMs / 60000
      const calculatedWpm = Math.round(nextWords / Math.max(totalTimeMin, 0.05))
      setPacingWpm(calculatedWpm)
    }

    // Formulate prompt for Gemini
    // If we've asked 5 questions, ask for final wrap-up
    const nextQNum = questionCount + 1
    const promptInstructions = nextQNum <= 5
      ? `Rate my previous answer out of 10 in this exact format: "[Score: X/10]". Provide 2 bullet points of improvement feedback. Then, ask question #${nextQNum}.`
      : `Rate my final answer out of 10 in this exact format: "[Score: X/10]". Provide 2 bullet points of improvement feedback. Finally, summarize the entire interview performance, calculate the overall average score, and end the session.`;

    try {
      const apiContents = [
        { 
          role: 'user', 
          parts: [{ text: `You are a strict technical interviewer for a ${role} position (${difficulty} level). You evaluate answers using industry standards.` }] 
        },
        ...nextHistory.map(h => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        { 
          role: 'user', 
          parts: [{ text: promptInstructions }] 
        }
      ]

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'gemini-2.5-flash',
          contents: apiContents
        })
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to get grading')

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error processing answer."
      
      // Parse score from reply if possible
      const scoreMatch = reply.match(/\[Score:\s*(\d+)\/10\]/)
      if (scoreMatch) {
        const score = parseInt(scoreMatch[1])
        const newGrades = [...grades, { qNum: questionCount, score, feedback: reply }]
        setGrades(newGrades)
        
        // Calculate average
        const total = newGrades.reduce((sum, g) => sum + g.score, 0)
        setAvgScore(Math.round((total / newGrades.length) * 10))
      }

      setHistory(prev => [...prev, { role: 'model', text: reply }])
      setQuestionCount(nextQNum)
      setQStartTime(Date.now())

      if (nextQNum > 5) {
        setIsFinished(true)
      }
    } catch (err) {
      toast.show('Failed to submit answer: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitAnswer()
    }
  }

  return (
    <AppShell title="AI Mock Interview Coach" subtitle="Engage in a live, turn-based technical interview graded in real time.">
      {!isStarted ? (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-up">
          <Panel>
            <h2 className="text-xl font-bold text-white mb-2">Configure Mock Interview</h2>
            <p className="text-sm text-gray-400 mb-6">
              Our AI interviewer will ask 5 questions based on your role and target level, grading your responses in real time.
            </p>

            <div className="space-y-4">
              <Field label="Target Role/Skill">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. React Developer, Node.js Engineer"
                />
              </Field>

              <Field label="Difficulty Level">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={inputClass}
                >
                  <option value="Junior">Junior (Core basics & syntax)</option>
                  <option value="Mid">Mid Level (Frameworks, databases, scale)</option>
                  <option value="Senior">Senior (System design, performance, security)</option>
                </select>
              </Field>

              <button
                onClick={startInterview}
                className={primaryButtonClass + ' w-full py-4 mt-4'}
              >
                🚀 Start Mock Session
              </button>
            </div>
          </Panel>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] max-w-6xl mx-auto animate-fade-up">
          {/* Chat Window */}
          <div className="flex flex-col h-[600px] glass rounded-3xl border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="bg-[#020617] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">AI Interviewer</h3>
                <p className="text-xs text-cyan-400 font-semibold">{role} ({difficulty})</p>
              </div>
              <StatusBadge tone={isFinished ? 'green' : 'blue'}>
                {isFinished ? 'Finished' : `Question ${Math.min(5, questionCount)} / 5`}
              </StatusBadge>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                        : 'bg-white/[0.04] border border-white/[0.08] text-gray-200'
                    }`}
                  >
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className={lIdx > 0 ? 'mt-1.5' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center gap-3 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl w-32 animate-pulse">
                  <span className="text-xs text-gray-400 font-semibold">AI thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-white/[0.06] bg-[#020617]/50 flex gap-3 items-center">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isListening 
                      ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse scale-95' 
                      : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
              )}
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading || isFinished}
                placeholder={isFinished ? "Interview complete! Check your stats on the right." : (isListening ? "Listening... Speak clearly" : "Type or speak your technical answer...")}
                className={`${inputClass} !py-2.5 !px-4 text-sm flex-1 resize-none h-12`}
              />
              <button
                onClick={submitAnswer}
                disabled={loading || isFinished || !currentInput.trim()}
                className={`${primaryButtonClass} !py-2.5 !px-4 shrink-0 flex items-center justify-center`}
              >
                Send 📤
              </button>
            </div>
          </div>

          {/* Side Panel: Live Stats & Scores */}
          <div className="space-y-6">
            <Panel>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-3">Overall Performance</h3>
              <p className={`text-5xl font-black ${avgScore >= 70 ? 'text-emerald-400' : avgScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {avgScore}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Average rating graded by Gemini</p>
              <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    avgScore >= 70 ? 'bg-emerald-500' : avgScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </Panel>

            <Panel>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Communication Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                  <span className="text-[10px] font-bold text-cyan-400 block uppercase">Speech Pacing</span>
                  <p className="text-2xl font-black text-white mt-1">{pacingWpm || '—'} <span className="text-[10px] font-normal text-gray-500">WPM</span></p>
                  <span className="text-[9px] text-gray-500 block mt-1 leading-tight">
                    {pacingWpm === 0 ? 'Speak to measure' : pacingWpm < 110 ? 'Slow (Ideal: 110-150)' : pacingWpm > 160 ? 'Fast (Ideal: 110-150)' : 'Ideal Pacing'}
                  </span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                  <span className="text-[10px] font-bold text-cyan-400 block uppercase">Filler Words</span>
                  <p className={`text-2xl font-black mt-1 ${fillerCount > 5 ? 'text-yellow-400' : 'text-white'}`}>{fillerCount}</p>
                  <span className="text-[9px] text-gray-500 block mt-1 leading-tight">
                    {fillerCount === 0 ? 'Excellent clarity' : fillerCount > 8 ? 'Try to use pauses' : 'Moderate usage'}
                  </span>
                </div>
              </div>
            </Panel>

            <Panel className="max-h-[300px] overflow-y-auto">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Question Wise Grades</h3>
              {grades.length === 0 ? (
                <p className="text-xs text-gray-500">Grades will appear after you answer.</p>
              ) : (
                <div className="space-y-3">
                  {grades.map((g) => (
                    <div key={g.qNum} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase">Question #{g.qNum}</span>
                        <p className="text-xs text-gray-400 mt-0.5">Graded Answer</p>
                      </div>
                      <span className={`text-sm font-black font-mono ${g.score >= 7 ? 'text-emerald-400' : g.score >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {g.score}/10
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {isFinished && (
              <button
                onClick={() => setIsStarted(false)}
                className="w-full py-3 rounded-xl font-bold text-xs bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-all cursor-pointer text-center block"
              >
                🔄 Restart Interview
              </button>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
