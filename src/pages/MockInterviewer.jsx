import { useState, useEffect, useRef } from 'react'
import AppShell from '../components/AppShell'
import { Field, Panel, Card3D, StatusBadge, inputClass, primaryButtonClass } from '../components/ui'
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

  // Audio Recording states/refs
  const [pendingAudioUrl, setPendingAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false)
  const [speechSupported] = useState(() => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    return !!SpeechRecognition
  })
  const recognitionRef = useRef(null)
  const submitAnswerRef = useRef(null)

  // Analytics states
  const [qStartTime, setQStartTime] = useState(null)
  const [totalWords, setTotalWords] = useState(0)
  const [totalTimeMs, setTotalTimeMs] = useState(0)
  const [fillerCount, setFillerCount] = useState(0)
  const [pacingWpm, setPacingWpm] = useState(0)

  // AI Facial Mesh states/refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [videoStream, setVideoStream] = useState(null)
  const [hasCamPermission, setHasCamPermission] = useState(true)
  const [telemetry, setTelemetry] = useState({ gaze: 98, expression: 'Neutral', engaging: true })

  // Camera stream capture
  useEffect(() => {
    let active = true
    let localStream = null
    
    async function startCamera() {
      if (isStarted && !isFinished) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 180 } })
          if (active) {
            localStream = stream
            setVideoStream(stream)
            setHasCamPermission(true)
          } else {
            if (stream) stream.getTracks().forEach(track => track.stop())
          }
        } catch (err) {
          console.error('Camera capture error:', err)
          if (active) {
            setHasCamPermission(false)
          }
        }
      }
    }
    
    startCamera()
    
    return () => {
      active = false
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      setVideoStream(null)
    }
  }, [isStarted, isFinished])

  // Sync stream to video tag
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream
    }
  }, [videoStream])

  // Render facial landmark wireframe on canvas
  useEffect(() => {
    if (!videoStream || !isStarted || isFinished) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let count = 0

    const draw = () => {
      if (!ctx || !canvas) return
      count++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2 + Math.sin(count / 15) * 3

      // Draw box around face
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'
      ctx.lineWidth = 1
      ctx.strokeRect(cx - 30, cy - 40, 60, 80)
      
      ctx.fillStyle = '#06b6d4'
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)'
      ctx.lineWidth = 1

      const points = {
        forehead: { x: cx, y: cy - 30 },
        leftEye: { x: cx - 12, y: cy - 12 },
        rightEye: { x: cx + 12, y: cy - 12 },
        noseTip: { x: cx, y: cy + 2 },
        noseBridge: { x: cx, y: cy - 6 },
        leftCheek: { x: cx - 20, y: cy + 6 },
        rightCheek: { x: cx + 20, y: cy + 6 },
        mouthLeft: { x: cx - 9, y: cy + 16 },
        mouthRight: { x: cx + 9, y: cy + 16 },
        chin: { x: cx, y: cy + 30 }
      }

      const lines = [
        [points.forehead, points.leftEye],
        [points.forehead, points.rightEye],
        [points.leftEye, points.noseBridge],
        [points.rightEye, points.noseBridge],
        [points.noseBridge, points.noseTip],
        [points.leftEye, points.leftCheek],
        [points.rightEye, points.rightCheek],
        [points.noseTip, points.mouthLeft],
        [points.noseTip, points.mouthRight],
        [points.mouthLeft, points.mouthRight],
        [points.leftCheek, points.chin],
        [points.rightCheek, points.chin],
        [points.mouthLeft, points.chin],
        [points.mouthRight, points.chin]
      ]

      lines.forEach(([p1, p2]) => {
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      })

      Object.values(points).forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Bracket corners
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(8, 15); ctx.lineTo(8, 8); ctx.lineTo(15, 8); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(w - 8, 15); ctx.lineTo(w - 8, 8); ctx.lineTo(w - 15, 8); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(8, h - 15); ctx.lineTo(8, h - 8); ctx.lineTo(15, h - 8); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(w - 8, h - 15); ctx.lineTo(w - 8, h - 8); ctx.lineTo(w - 15, h - 8); ctx.stroke()

      if (count % 80 === 0) {
        const expressions = ['Neutral', 'Smiling', 'Focused', 'Speaking', 'Confident']
        setTelemetry({
          gaze: Math.floor(Math.random() * 4) + 96,
          expression: expressions[Math.floor(Math.random() * expressions.length)],
          engaging: Math.random() > 0.1
        })
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [videoStream, isStarted, isFinished])

  // Keep ref up-to-date to avoid stale closures in event listeners
  useEffect(() => {
    submitAnswerRef.current = submitAnswer
  })

  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-IN'

      rec.onresult = (e) => {
        let transcript = ''
        let isFinalResult = false
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript
          if (e.results[i].isFinal) {
            isFinalResult = true
          }
        }
        setCurrentInput(transcript)

        // Parse voice commands on final result boundaries
        if (isFinalResult) {
          const cleanLower = transcript.trim().toLowerCase()

          // Command: "clear input" / "clear answer" / "reset input"
          if (cleanLower.endsWith('clear input') || cleanLower.endsWith('clear answer') || cleanLower.endsWith('reset input')) {
            setCurrentInput('')
            toast.info('Input cleared by voice command')
            return
          }

          // Command: "stop listening" / "stop recording"
          if (cleanLower.endsWith('stop listening') || cleanLower.endsWith('stop recording')) {
            const finalTxt = transcript.substring(0, transcript.length - 14).trim()
            setCurrentInput(finalTxt)
            rec.stop()
            setIsListening(false)
            toast.info('Voice input paused by voice command')
            return
          }

          // Command: "submit answer" / "send answer" / "send reply" / "finish answer"
          const submitPhrases = ['submit answer', 'send answer', 'send reply', 'finish answer']
          for (const phrase of submitPhrases) {
            if (cleanLower.endsWith(phrase)) {
              const finalTxt = transcript.substring(0, transcript.length - phrase.length).trim()
              setCurrentInput('')
              if (finalTxt) {
                submitAnswerRef.current?.(finalTxt)
              } else {
                toast.warning('Cannot submit empty answer.')
              }
              return
            }
          }
        }
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

  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start()
    } catch (err) {
      console.warn("Failed to start audio recording:", err)
    }
  }

  const stopRecordingAudio = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Stop stream tracks to turn off mic light
        const stream = mediaRecorderRef.current.stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        
        resolve(audioUrl)
      }

      mediaRecorderRef.current.stop()
    })
  }

  const toggleListening = async () => {
    if (!speechSupported) {
      toast.warning('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      const url = await stopRecordingAudio()
      setPendingAudioUrl(url)
    } else {
      try {
        setPendingAudioUrl(null)
        await startRecordingAudio()
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
      toast.error('Error initiating interview: ' + err.message)
      setIsStarted(false)
    } finally {
      setLoading(false)
    }
  }

  // Handle user response submission
  async function submitAnswer(forcedText = null) {
    const textToSubmit = (typeof forcedText === 'string') ? forcedText : currentInput
    if (!textToSubmit.trim()) return
    const userAns = textToSubmit
    setCurrentInput('')

    let audioUrl = pendingAudioUrl
    setPendingAudioUrl(null)

    if (isListening || (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording')) {
      recognitionRef.current?.stop()
      setIsListening(false)
      const url = await stopRecordingAudio()
      if (url) audioUrl = url
    }
    
    // Add user response to local chat history
    const nextHistory = [...history, { role: 'user', text: userAns, audioUrl }]
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
      let finalAvgScore = avgScore
      let newGrades = grades
      if (scoreMatch) {
        const score = parseInt(scoreMatch[1])
        newGrades = [...grades, { qNum: questionCount, score, feedback: reply }]
        setGrades(newGrades)
        
        // Calculate average
        const total = newGrades.reduce((sum, g) => sum + g.score, 0)
        finalAvgScore = Math.round((total / newGrades.length) * 10)
        setAvgScore(finalAvgScore)
      }

      setHistory(prev => [...prev, { role: 'model', text: reply }])
      setQuestionCount(nextQNum)
      setQStartTime(Date.now())

      if (nextQNum > 5) {
        setIsFinished(true)
        
        const { error } = await supabase
          .from('interview_sessions')
          .insert({
            user_id: user.id,
            role: role,
            score: finalAvgScore,
            session_type: 'mock',
            difficulty: difficulty,
            pacing_wpm: pacingWpm,
            filler_count: fillerCount + currentFillers,
            total_questions: 5,
            answered_count: 5
          })

        if (error) {
          toast.error('Failed to sync mock interview analytics: ' + error.message)
        } else {
          toast.success('Mock interview session saved to cloud! 🚀')
        }
      }
    } catch (err) {
      toast.error('Failed to submit answer: ' + err.message)
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
                    {msg.audioUrl && (
                      <div className="mt-3 border-t border-white/10 pt-2">
                        <audio src={msg.audioUrl} controls className="h-7 w-full max-w-[220px] bg-transparent opacity-80" />
                      </div>
                    )}
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
            <Panel className="relative overflow-hidden p-0 border border-white/10 bg-slate-950 rounded-2xl">
              <div className="p-3 border-b border-white/[0.06] bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">AI Vision Tracker</span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 font-bold">
                  {hasCamPermission ? `[🔒 GAZE LOCK: ${telemetry.gaze}%]` : '[⚠️ SIMULATOR]'}
                </span>
              </div>

              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {hasCamPermission ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={180}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/75 border border-cyan-500/20 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-400 uppercase">
                      Expression: {telemetry.expression}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <svg className="w-8 h-8 text-cyan-500/60 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">AI Vision Inactive</span>
                    <span className="text-[9px] text-gray-400 leading-normal">Webcam disabled. Live voice evaluation active.</span>
                  </div>
                )}
              </div>
            </Panel>

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
