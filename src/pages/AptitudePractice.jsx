import { useState, useEffect, useRef } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge, primaryButtonClass, secondaryButtonClass } from '../components/ui'

export default function AptitudePractice() {
  const [activeCategory, setActiveCategory] = useState('Quantitative')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [totalAttempted, setTotalAttempted] = useState(0)
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(60)
  const [timerActive, setTimerActive] = useState(true)
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
        answer: "CPOBjZ? Wait, CPNCBZ",
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

  const currentQuestions = database[activeCategory]
  const q = currentQuestions[currentIdx] || {}

  // Timer effect
  useEffect(() => {
    if (!timerActive || submitted) return
    
    setTimeLeft(60)
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

    return () => clearInterval(timerRef.current)
  }, [currentIdx, activeCategory, submitted, timerActive])

  const handleTimeOut = () => {
    setSubmitted(true)
    setTotalAttempted(prev => prev + 1)
  }

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
      setCurrentIdx(0) // Wrap around
    }
  }

  return (
    <AppShell title="Aptitude Practice Hub" subtitle="Crack quantitative, logical reasoning, and verbal placement rounds.">
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8 bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-2xl max-w-lg">
        {Object.keys(database).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat)
              setCurrentIdx(0)
              setSelectedOpt(null)
              setSubmitted(false)
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
                  style = 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
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
                  Next Question →
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
            <p className="text-5xl font-black text-cyan-400 font-mono">{score} <span className="text-xs text-gray-500">pts</span></p>
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
    </AppShell>
  )
}
