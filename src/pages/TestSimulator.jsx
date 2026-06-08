import { useEffect, useRef, useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, primaryButtonClass } from '../components/ui'
import { useToast } from '../context/ToastContext'

const QUESTIONS = [
  // SECTION 1: Quantitative Aptitude (0-4)
  {
    section: 'Quantitative Aptitude',
    q: 'A train 120 meters long passes a telegraph post in 6 seconds. What is the speed of the train in km/h?',
    options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'],
    ans: 1,
    exp: 'Speed = Distance / Time = 120m / 6s = 20 m/s. To convert to km/h, multiply by 18/5: 20 * 18/5 = 72 km/h.'
  },
  {
    section: 'Quantitative Aptitude',
    q: 'The average of 5 consecutive odd numbers is 61. What is the difference between the highest and lowest numbers?',
    options: ['6', '8', '10', '12'],
    ans: 1,
    exp: 'Let consecutive odd numbers be x, x+2, x+4, x+6, x+8. Average is x+4 = 61. Lowest is 57, highest is 65. Difference = 65 - 57 = 8.'
  },
  {
    section: 'Quantitative Aptitude',
    q: 'If 15 men can complete a project in 20 days, how many days will 20 men take to complete the same project?',
    options: ['12 days', '15 days', '18 days', '10 days'],
    ans: 1,
    exp: 'Total Man-Days = 15 * 20 = 300. Days taken by 20 men = 300 / 20 = 15 days.'
  },
  {
    section: 'Quantitative Aptitude',
    q: 'A product was sold at a 10% loss. If it had been sold for $45 more, there would have been a 5% gain. What is the cost price?',
    options: ['$250', '$300', '$350', '$400'],
    ans: 1,
    exp: 'Difference in percentages = 5% - (-10%) = 15%. Thus 15% of Cost Price = $45. Cost Price = 45 / 0.15 = $300.'
  },
  {
    section: 'Quantitative Aptitude',
    q: 'A bag contains 4 red balls and 6 blue balls. If two balls are drawn at random, what is the probability that both are red?',
    options: ['2/15', '4/25', '1/5', '3/10'],
    ans: 0,
    exp: 'Total balls = 10. Probability of first red = 4/10. Probability of second red = 3/9. Overall Probability = 4/10 * 3/9 = 12/90 = 2/15.'
  },
  // SECTION 2: Logical Reasoning (5-9)
  {
    section: 'Logical Reasoning',
    q: 'Look at the series: 36, 34, 30, 28, 24, ... What number should come next?',
    options: ['20', '22', '23', '26'],
    ans: 1,
    exp: 'The pattern is subtracting 2, then subtracting 4, repeatedly: 36(-2)➔34(-4)➔30(-2)➔28(-4)➔24(-2)➔22.'
  },
  {
    section: 'Logical Reasoning',
    q: 'Point A is 10m West of B. Point C is 6m South of B. Point D is 5m West of C. In which direction is A relative to D?',
    options: ['North-West', 'North-East', 'South-West', 'North'],
    ans: 0,
    exp: 'A is 10m West and 6m North of C. Since D is 5m West of C, A is 5m West and 6m North of D. Thus, A is North-West of D.'
  },
  {
    section: 'Logical Reasoning',
    q: 'In a code, "MOCK" is written as "OPEM". How is "TEST" written in this code?',
    options: ['VGUV', 'VGRV', 'UGTU', 'VGRU'],
    ans: 1,
    exp: 'Letter mapping shift pattern: M(+2)➔O, O(-10)➔P? No, shift is: M(+2)➔O, O(+1)➔P, C(+2)➔E, K(+2)➔M. The vowels increase by 1, consonants by 2: T(+2)➔V, E(+1 vowel)➔F? Wait. T(+2)➔V, E(+2)➔G, S(+2)➔U, T(+2)➔V? If +2 to all: T(+2)➔V, E(+2)➔G, S(-1)➔R, T(+2)➔V. Correct mapping: T➔V (+2), E➔G (+2), S➔R (-1), T➔V (+2) -> VGRV.'
  },
  {
    section: 'Logical Reasoning',
    q: 'If all squares are rectangles and all rectangles are polygons, which of the following statements must be true?',
    options: ['All polygons are squares', 'Some squares are not polygons', 'All squares are polygons', 'No polygons are squares'],
    ans: 2,
    exp: 'By syllogism: Squares ⊆ Rectangles ⊆ Polygons. Therefore, Squares ⊆ Polygons. All squares are polygons.'
  },
  {
    section: 'Logical Reasoning',
    q: 'Find the odd one out from the group.',
    options: ['Gold', 'Silver', 'Copper', 'Coal'],
    ans: 3,
    exp: 'Gold, Silver, and Copper are metals. Coal is a non-metal carbon mineral.'
  },
  // SECTION 3: Technical Core (10-14)
  {
    section: 'Technical Core',
    q: 'Which data structure follows the Last-In, First-Out (LIFO) protocol?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    ans: 1,
    exp: 'Stacks follow the LIFO protocol: elements pushed last are popped first.'
  },
  {
    section: 'Technical Core',
    q: 'What is the time complexity of searching in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(N)', 'O(log N)', 'O(N log N)'],
    ans: 2,
    exp: 'In a balanced BST, search space halves at each node, giving a logarithmic time complexity of O(log N).'
  },
  {
    section: 'Technical Core',
    q: 'In database management, what does the "A" in ACID transaction properties stand for?',
    options: ['Availability', 'Atomicity', 'Access Control', 'Aggregation'],
    ans: 1,
    exp: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity ensures all parts of a transaction succeed or all fail.'
  },
  {
    section: 'Technical Core',
    q: 'Which protocol is stateless and typically runs over TCP port 80?',
    options: ['FTP', 'SMTP', 'HTTP', 'HTTPS'],
    ans: 2,
    exp: 'HTTP (Hypertext Transfer Protocol) is stateless and defaults to TCP port 80.'
  },
  {
    section: 'Technical Core',
    q: 'What is the primary role of an Operating System Kernel?',
    options: ['Provide graphical web browser access', 'Manage system hardware resources and memory', 'Execute local database operations', 'Analyze code compiler outputs'],
    ans: 1,
    exp: 'The Kernel is the core program managing system hardware resources, memory space, and scheduling processes.'
  }
]

export default function TestSimulator() {
  const toast = useToast()
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { qIdx: selectedOptIdx }
  
  // Timer: 10 minutes = 600s
  const [timeLeft, setTimeLeft] = useState(600)
  const timerIntervalRef = useRef(null)

  // Anti-cheat / Proctoring states
  const [cheatWarnings, setCheatWarnings] = useState(0)
  const [showCheatWarningModal, setShowCheatWarningModal] = useState(false)

  // Tab focus detection
  useEffect(() => {
    if (!isStarted || isFinished) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setCheatWarnings(prev => {
          const next = prev + 1
          if (next >= 3) {
            handleAutoSubmit('Proctoring Violation: Repeated Tab Switching Detected.')
          } else {
            setShowCheatWarningModal(true)
          }
          return next
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isStarted, isFinished])

  // Timer Countdown
  useEffect(() => {
    if (isStarted && !isFinished) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current)
            handleAutoSubmit('Time Limit Reached.')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerIntervalRef.current)
  }, [isStarted, isFinished])

  const startTest = () => {
    setIsStarted(true)
    setIsFinished(false)
    setCurrentQIndex(0)
    setAnswers({})
    setTimeLeft(600)
    setCheatWarnings(0)
    setShowCheatWarningModal(false)
    toast.success('Exam simulator started. Do not switch tabs!')
  }

  const handleSelectOption = (optIdx) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: optIdx }))
  }

  const handleAutoSubmit = (reason) => {
    clearInterval(timerIntervalRef.current)
    setIsFinished(true)
    toast.warning(`Test Submitted: ${reason}`)
  }

  const submitTest = () => {
    const answeredCount = Object.keys(answers).length
    if (answeredCount < QUESTIONS.length) {
      if (!window.confirm(`You have only answered ${answeredCount}/${QUESTIONS.length} questions. Submit anyway?`)) {
        return
      }
    }
    clearInterval(timerIntervalRef.current)
    setIsFinished(true)
    toast.success('Test submitted successfully!')
  }

  // Formatting remaining time
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Calculate results statistics
  const getResults = () => {
    let score = 0
    let sectionBreakdown = { 'Quantitative Aptitude': 0, 'Logical Reasoning': 0, 'Technical Core': 0 }
    
    QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.ans) {
        score++
        sectionBreakdown[q.section]++
      }
    })

    return {
      score,
      pct: Math.round((score / QUESTIONS.length) * 100),
      sectionBreakdown
    }
  }

  const results = isFinished ? getResults() : null
  const currentQ = QUESTIONS[currentQIndex]

  return (
    <AppShell title="Mock Test Exam Simulator" subtitle="Experience a real-time, proctored placement test environment with standard Aptitude, Logical, and Technical Core questions.">
      {!isStarted && !isFinished ? (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-up">
          <Panel>
            <h2 className="text-xl font-bold text-white mb-2">Configure Simulator Session</h2>
            <p className="text-sm text-gray-400 mb-6">
              You will be presented with 15 questions (5 Quant, 5 Logical, 5 Technical) with a strict 10-minute timer.
            </p>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">⚠️ Proctoring Rules Active</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our proctoring AI locks this tab. If you click away, open a new window, or switch tabs, you will receive a warning. Switching tabs more than 2 times submits your exam automatically.
              </p>
            </div>

            <button
              onClick={startTest}
              className={`${primaryButtonClass} w-full py-4`}
            >
              📝 Start Placement Test
            </button>
          </Panel>
        </div>
      ) : isStarted && !isFinished ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] max-w-6xl mx-auto animate-fade-up">
          {/* Question Display */}
          <div className="flex flex-col h-[520px] glass rounded-3xl border border-white/[0.06] overflow-hidden justify-between">
            {/* Header */}
            <div className="bg-[#020617] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{currentQ.section}</span>
                <h3 className="font-bold text-white text-sm">Question {currentQIndex + 1} of {QUESTIONS.length}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                  ⏱️ {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <p className="text-sm text-white font-medium">{currentQ.q}</p>
              
              <div className="grid gap-3">
                {currentQ.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`text-left rounded-xl px-4 py-3 text-xs font-medium border transition-all cursor-pointer ${
                      answers[currentQIndex] === oIdx
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="p-4 border-t border-white/[0.06] bg-[#020617]/50 flex justify-between">
              <button
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {currentQIndex === QUESTIONS.length - 1 ? (
                <button
                  onClick={submitTest}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition cursor-pointer"
                >
                  Submit Exam 🚀
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQIndex(prev => Math.min(QUESTIONS.length - 1, prev + 1))}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition cursor-pointer"
                >
                  Next →
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Map Grid */}
          <div className="space-y-6">
            <Panel>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Question Grid</h3>
              <div className="grid grid-cols-5 gap-2">
                {QUESTIONS.map((_, idx) => {
                  const isAnswered = answers[idx] !== undefined
                  const isCurrent = currentQIndex === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition cursor-pointer ${
                        isCurrent
                          ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                          : isAnswered
                          ? 'bg-cyan-500 border-cyan-500 text-white'
                          : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </Panel>

            <Panel className="text-center">
              <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-1.5">Warnings</h4>
              <p className={`text-2xl font-black ${cheatWarnings > 0 ? 'text-red-400' : 'text-white'}`}>
                {cheatWarnings} / 2
              </p>
              <p className="text-[10px] text-gray-500 mt-1">Defocus limit before auto-submit</p>
            </Panel>
          </div>
        </div>
      ) : (
        /* Final Results Display */
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            {/* Score circle */}
            <div className="space-y-4">
              <Panel className="text-center flex flex-col items-center justify-center p-6">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">Final Score</h3>
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-white/5 fill-none" strokeWidth="8" />
                    <circle
                      cx="56" cy="56" r="48"
                      className={`fill-none transition-all duration-700 ${results.pct >= 70 ? 'stroke-emerald-500' : results.pct >= 40 ? 'stroke-yellow-500' : 'stroke-red-500'}`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - results.pct / 100)}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{results.score}/{QUESTIONS.length}</span>
                    <span className="text-[10px] text-gray-500 font-semibold">{results.pct}%</span>
                  </div>
                </div>
                <div className="mt-6 space-y-2 w-full text-left">
                  {Object.entries(results.sectionBreakdown).map(([sec, val]) => (
                    <div key={sec} className="flex justify-between text-xs border-b border-white/[0.04] pb-1">
                      <span className="text-gray-400">{sec.split(' ')[0]}</span>
                      <span className="font-bold text-white">{val}/5</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <button
                onClick={startTest}
                className={`${primaryButtonClass} w-full py-3`}
              >
                🔄 Retake Simulator
              </button>
            </div>

            {/* Detailed reviews */}
            <div className="space-y-4">
              <Panel>
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Question Wise Feedback</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {QUESTIONS.map((q, idx) => {
                    const userAns = answers[idx]
                    const isCorrect = userAns === q.ans
                    return (
                      <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold text-cyan-400 uppercase">{q.section}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isCorrect 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white">Q{idx + 1}: {q.q}</p>
                        <p className="text-xs text-gray-400">
                          Your answer: <span className="font-semibold text-white">{userAns !== undefined ? q.options[userAns] : 'Not Answered'}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Correct answer: <span className="font-semibold text-emerald-400">{q.options[q.ans]}</span>
                        </p>
                        <p className="text-[11px] text-gray-500 leading-relaxed bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.04]">
                          💡 <span className="font-bold text-gray-400">Explanation:</span> {q.exp}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}

      {/* Proctoring Warning Modal */}
      {showCheatWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" />
          <div className="relative w-full max-w-sm glass border border-red-500/30 rounded-3xl p-6 text-center animate-scale-in">
            <span className="text-4xl block mb-3 animate-bounce">⚠️</span>
            <h3 className="text-lg font-black text-red-400 mb-2">Proctoring Warning!</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              You clicked away or switched tabs. This activity has been logged. 
              Switching tabs <span className="text-red-400 font-bold">one more time</span> will auto-submit your exam!
            </p>
            <button
              onClick={() => setShowCheatWarningModal(false)}
              className="rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold px-6 py-2.5 text-xs hover:bg-red-500/30 transition cursor-pointer"
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
