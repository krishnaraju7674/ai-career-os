import { useState, useEffect, useRef } from 'react'
import AppShell from '../components/AppShell'
import { Panel, StatusBadge, primaryButtonClass } from '../components/ui'
import { useToast } from '../context/ToastContext'

export default function AptitudePractice() {
  const toast = useToast()
  const [activeCategory, setActiveCategory] = useState('Quantitative')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [totalAttempted, setTotalAttempted] = useState(0)

  // AI-generated states
  const [aiMode, setAiMode] = useState(false)
  const [aiQuestions, setAiQuestions] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(60)
  const [timerActive] = useState(true)
  const timerRef = useRef(null)

  const database = {
    Quantitative: [
      {
        question: "A person crosses a 600m long street in 5 minutes. What is his speed in km/hr?",
        options: ["3.6 km/hr", "7.2 km/hr", "8.4 km/hr", "10 km/hr"],
        answer: "7.2 km/hr",
        explanation: "Distance = 600 meters, Time = 5 minutes = 300 seconds. Speed = 600 / 300 = 2 m/s. To convert to km/hr, multiply by 18/5: 2 * 18/5 = 36/5 = 7.2 km/hr."
      },
      {
        question: "A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. The sum is:",
        options: ["$650", "$690", "$698", "$700"],
        answer: "$698",
        explanation: "Interest for 1 year = $854 - $815 = $39. Interest for 3 years = $39 * 3 = $117. Principal = $815 - $117 = $698."
      },
      {
        question: "The average of 20 numbers is zero. Of them, at most, how many may be greater than zero?",
        options: ["0", "1", "10", "19"],
        answer: "19",
        explanation: "If the sum is 0, at most 19 numbers can be positive (greater than 0), with the 20th number being equal to the negative sum of the other 19 numbers."
      },
      {
        question: "What is the probability of getting a sum of 9 from two throws of a dice?",
        options: ["1/6", "1/9", "1/12", "1/18"],
        answer: "1/9",
        explanation: "Total outcomes = 6 * 6 = 36. Favorable outcomes (sum = 9) are: (3,6), (4,5), (5,4), (6,3). Total favorable = 4. Probability = 4/36 = 1/9."
      }
    ],
    Logical: [
      {
        question: "SCD, TEF, UGH, ____, WKL. Choose the correct set of letters to fill the blank.",
        options: ["VIJ", "VJI", "UJI", "IJT"],
        answer: "VIJ",
        explanation: "There are two alphabetical series here. The first letter is S, T, U, V, W. The second and third letters are CD, EF, GH, IJ, KL. So, the missing letters are VIJ."
      },
      {
        question: "If in a certain language, MADRAS is coded as NBESBT, how is BOMBAY coded in that code?",
        options: ["CPNCBX", "CPNCBZ", "CPOCBZ", "CQOCBZ"],
        answer: "CPNCBZ",
        explanation: "Each letter in the word is replaced by the next letter in the alphabetical order. B->C, O->P, M->N, B->C, A->B, Y->Z. So, BOMBAY becomes CPNCBZ."
      },
      {
        question: "A is B's sister. C is B's mother. D is C's father. E is D's mother. Then, how is A related to D?",
        options: ["Grandmother", "Grandfather", "Daughter", "Granddaughter"],
        answer: "Granddaughter",
        explanation: "A is the sister of B. C is B's mother (so C is A's mother). D is C's father. Therefore, D is the grandfather of A, making A the granddaughter of D."
      }
    ],
    Verbal: [
      {
        question: "Choose the word which is most nearly opposite in meaning to: 'AMICABLE'",
        options: ["Hostile", "Friendly", "Harmonious", "Pleasant"],
        answer: "Hostile",
        explanation: "'Amicable' means having a spirit of friendliness; without serious disagreement. Its opposite is 'Hostile'."
      },
      {
        question: "Fill in the blank: 'He went ____ the room to get his keys.'",
        options: ["into", "in", "to", "inside of"],
        answer: "into",
        explanation: "'Into' is used to show movement toward the inside of a location. 'He went into the room...'"
      }
    ]
  }

  const currentQuestions = aiMode && aiQuestions.length > 0 ? aiQuestions : database[activeCategory]
  const q = currentQuestions[currentIdx] || {}

  // Fetch AI generated questions
  const fetchAiQuestions = async (category) => {
    setAiLoading(true)
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'gemini-2.0-flash',
          contents: [
            {
              role: 'user',
              parts: [{
                text: `Generate exactly 4 different premium multiple-choice aptitude questions for the category "${category}" (Quantitative, Logical, or Verbal).
Format the output as a valid JSON array only. Do NOT include markdown blocks, backticks, or additional text.
Each element in the array must be an object with this exact structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Option B", // Must EXACTLY match one of the options
  "explanation": "Detailed explanation of the solution"
}`
              }]
            }
          ]
        })
      })

      const data = await response.json()
      if (!response.ok || data.error) throw new Error(data.error?.message || data.error || 'Gemini error')

      let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      rawText = rawText.trim()
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim()
      }

      const parsed = JSON.parse(rawText)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAiQuestions(parsed)
        setCurrentIdx(0)
        setSelectedOpt(null)
        setSubmitted(false)
        toast.success(`Generated 4 fresh AI ${category} questions! 🚀`)
      } else {
        throw new Error('Invalid format returned')
      }
    } catch (e) {
      toast.error('Failed to generate AI questions: ' + e.message + '. Using local questions.')
      setAiMode(false)
    } finally {
      setAiLoading(false)
    }
  }

  // Handle mode toggle
  const toggleAiMode = (enabled) => {
    if (enabled) {
      setAiMode(true)
      fetchAiQuestions(activeCategory)
    } else {
      setAiMode(false)
      setAiQuestions([])
      setCurrentIdx(0)
      setSelectedOpt(null)
      setSubmitted(false)
    }
  }

  function handleTimeOut() {
    setSubmitted(true)
    setTotalAttempted(prev => prev + 1)
  }

  // Timer effect
  useEffect(() => {
    if (!timerActive || submitted || aiLoading) return
    
    const timer = setTimeout(() => {
      setTimeLeft(60)
    }, 0)
    clearInterval(timerRef.current)
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(timerRef.current)
    }
  }, [currentIdx, activeCategory, submitted, timerActive, aiMode, aiLoading])

  const handleSelect = (opt) => {
    if (submitted) return
    setSelectedOpt(opt)
  }

  const handleSubmit = () => {
    if (submitted || !selectedOpt) return
    setSubmitted(true)
    setTotalAttempted(prev => prev + 1)
    if (selectedOpt === q.answer) {
      setScore(prev => prev + 10)
    }
  }

  const handleNext = () => {
    setSelectedOpt(null)
    setSubmitted(false)
    if (currentIdx < currentQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      if (aiMode) {
        // Regenerate when wrapped around
        fetchAiQuestions(activeCategory)
      } else {
        setCurrentIdx(0) // Wrap around
      }
    }
  }

  return (
    <AppShell title="Aptitude Practice Hub" subtitle="Crack quantitative, logical reasoning, and verbal placement rounds.">
      
      {/* Category Tabs & AI Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2.5 bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-2xl max-w-lg">
          {Object.keys(database).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat)
                setCurrentIdx(0)
                setSelectedOpt(null)
                setSubmitted(false)
                if (aiMode) {
                  fetchAiQuestions(cat)
                }
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {cat} Aptitude
            </button>
          ))}
        </div>

        {/* AI Toggle */}
        <div className="flex gap-2 bg-white/[0.02] border border-white/[0.04] p-1 rounded-xl">
          <button
            onClick={() => toggleAiMode(true)}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              aiMode ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ✨ AI Endless Mode
          </button>
          <button
            onClick={() => toggleAiMode(false)}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !aiMode ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            📚 Static Bank
          </button>
        </div>
      </div>

      {aiLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center animate-spin">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 animate-pulse font-bold">Generating customized {activeCategory} questions using Gemini...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_300px] max-w-5xl">
          {/* Question Panel */}
          <div className="space-y-6">
            <Panel>
              <div className="flex justify-between items-center mb-5">
                <StatusBadge tone="cyan">Question {currentIdx + 1} / {currentQuestions.length}</StatusBadge>
                
                {/* Circular or pill-based timer */}
                <div className={`flex items-center gap-2 font-mono font-bold text-sm ${timeLeft > 15 ? 'text-cyan-400' : 'text-red-400'}`}>
                  ⏱ {timeLeft}s left
                </div>
              </div>

              <h3 className="text-lg font-bold text-white leading-relaxed mb-6">
                {q.question}
              </h3>

              {/* Options List */}
              <div className="grid gap-3 mb-6">
                {q.options?.map((opt, oIdx) => {
                  const isSelected = selectedOpt === opt
                  const isCorrect = opt === q.answer
                  let style = 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-gray-300'
                  
                  if (isSelected) {
                    style = aiMode
                      ? 'bg-purple-500/10 border-purple-500 text-purple-300'
                      : 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  }
                  
                  if (submitted) {
                    if (isCorrect) {
                      style = 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    } else if (isSelected) {
                      style = 'bg-red-500/15 border-red-500 text-red-300'
                    } else {
                      style = 'bg-white/[0.01] border-white/[0.04] text-gray-600 opacity-60'
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={submitted}
                      onClick={() => handleSelect(opt)}
                      className={`px-4 py-3.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${style}`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedOpt}
                    className={primaryButtonClass + ' !py-2.5 !text-xs'}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className={primaryButtonClass + ' !py-2.5 !text-xs'}
                  >
                    {currentIdx < currentQuestions.length - 1 ? 'Next Question →' : aiMode ? 'Generate More ✨' : 'Restart Bank 🔄'}
                  </button>
                )}
              </div>

              {/* Explanation box */}
              {submitted && (
                <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-gray-400 leading-relaxed animate-fade-in">
                  <strong className="text-white block mb-1">Explanation:</strong>
                  {q.explanation}
                </div>
              )}
            </Panel>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            <Panel>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-3">Aptitude Score</h3>
              <p className={`text-5xl font-black font-mono ${aiMode ? 'text-purple-400' : 'text-cyan-400'}`}>{score} <span className="text-xs text-gray-500">pts</span></p>
              <p className="text-xs text-gray-500 mt-1">Questions Answered: {totalAttempted}</p>
            </Panel>

            <Panel>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Aptitude Tips</h3>
              <ul className="space-y-3.5">
                <li className="text-xs text-gray-400 leading-relaxed">
                  ⏱ <strong>Time Management:</strong> Never spend more than 1 minute on a single math question. Skip and return.
                </li>
                <li className="text-xs text-gray-400 leading-relaxed">
                  ✏️ <strong>Rough Sheets:</strong> Write down formulas and intermediate calculations systematically.
                </li>
                <li className="text-xs text-gray-400 leading-relaxed">
                  🧩 <strong>Verbal Rules:</strong> Eliminate options by looking for grammatical consistency first.
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
