import { useState, useEffect, useRef } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, ProgressRing, primaryButtonClass, secondaryButtonClass } from '../components/ui'

export default function Pomodoro() {
  const [mode, setMode] = useState('work') // 'work', 'short', 'long'
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0) // in minutes
  
  const timerRef = useRef(null)

  const modeTimes = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  }

  const modeLabels = {
    work: "💻 Work Session",
    short: "☕ Short Break",
    long: "🌴 Long Break"
  }

  // Load localStorage data
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const savedSessions = localStorage.getItem(`pomo_sessions_${today}`)
    const savedTime = localStorage.getItem(`pomo_time_${today}`)
    if (savedSessions) setSessionsCompleted(Number(savedSessions))
    if (savedTime) setTotalFocusTime(Number(savedTime))
  }, [])

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }

    return () => clearInterval(timerRef.current)
  }, [isRunning, mode])

  const handleSessionComplete = () => {
    setIsRunning(false)
    playBeep()
    
    const today = new Date().toISOString().split('T')[0]
    if (mode === 'work') {
      const nextSessions = sessionsCompleted + 1
      const nextTime = totalFocusTime + 25
      setSessionsCompleted(nextSessions)
      setTotalFocusTime(nextTime)
      localStorage.setItem(`pomo_sessions_${today}`, String(nextSessions))
      localStorage.setItem(`pomo_time_${today}`, String(nextTime))
      alert("Great job! Work session completed. Take a break!")
      changeMode('short')
    } else {
      alert("Break completed! Ready to focus?")
      changeMode('work')
    }
  }

  const changeMode = (newMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(modeTimes[newMode])
  }

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.8)
    } catch (e) {
      console.log("Audio not supported or interaction blocked:", e)
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(modeTimes[mode])
  }

  // Formatting minutes/seconds
  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const s = String(timeLeft % 60).padStart(2, '0')
  const maxTime = modeTimes[mode]
  const percentage = ((maxTime - timeLeft) / maxTime) * 100

  return (
    <AppShell title="Pomodoro Focus Timer" subtitle="Boost your productivity and manage study intervals efficiently.">
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto animate-fade-up">
        
        {/* Main Timer Display */}
        <div className="md:col-span-2 flex flex-col items-center justify-center">
          <Panel className="w-full flex flex-col items-center py-12">
            
            {/* Mode selection buttons */}
            <div className="flex gap-2 mb-10 bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-2xl">
              {Object.keys(modeTimes).map((mKey) => (
                <button
                  key={mKey}
                  onClick={() => changeMode(mKey)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === mKey
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {mKey === 'work' && '💻 Work'}
                  {mKey === 'short' && '☕ Short Break'}
                  {mKey === 'long' && '🌴 Long Break'}
                </button>
              ))}
            </div>

            {/* Circular Timer Graphics */}
            <div className="relative flex items-center justify-center my-6">
              <ProgressRing 
                value={percentage} 
                size={220} 
                stroke={12} 
                color="url(#ringGrad)" 
              />
              
              {/* Absolute Time Text */}
              <div className="absolute text-center">
                <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white">
                  {m}:{s}
                </span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 mt-1">
                  {modeLabels[mode]}
                </p>
              </div>
            </div>

            {/* Control Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={primaryButtonClass + ' !px-8 !py-3 !text-sm'}
              >
                {isRunning ? 'Pause ⏸' : 'Start Focus ⏱'}
              </button>
              <button
                onClick={resetTimer}
                className={secondaryButtonClass + ' !px-6 !py-3 !text-sm'}
              >
                Reset 🔄
              </button>
            </div>
          </Panel>
        </div>

        {/* Info & Daily Progress */}
        <div className="space-y-6">
          <Panel>
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Today's Focus Metrics</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Pomodoros Finished</span>
                  <p className="text-xl font-bold text-white mt-0.5">{sessionsCompleted}</p>
                </div>
                <span className="text-2xl">🎯</span>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Total Focus Time</span>
                  <p className="text-xl font-bold text-white mt-0.5">{totalFocusTime} mins</p>
                </div>
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </Panel>

          <Panel>
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">Why use Pomodoro?</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. 
              It uses a timer to break work down into intervals, traditionally 25 minutes in length, separated by short breaks. 
              This builds mental focus and prevents fatigue during placement preparation.
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
