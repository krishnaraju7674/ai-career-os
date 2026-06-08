import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { readUserData, writeUserData } from '../services/localUserData'

const SKILL_NODES = [
  {
    id: 1,
    title: 'HTML & CSS Foundations',
    desc: 'Semantics, layouts, and responsive design',
    concepts: ['HTML5 semantic elements', 'CSS Box Model & Flexbox/Grid', 'Media queries & responsive designs'],
    quiz: [
      { q: 'Which HTML5 element is semantic for an independent, self-contained piece of content?', options: ['<div>', '<article>', '<section>'], ans: 1 },
      { q: 'Which CSS property changes the text color of an element?', options: ['text-color', 'color', 'font-color'], ans: 1 },
      { q: 'What is the default value of the position property in CSS?', options: ['relative', 'absolute', 'static'], ans: 2 }
    ]
  },
  {
    id: 2,
    title: 'JavaScript Programming',
    desc: 'DOM, events, async execution, ES6+',
    concepts: ['Constants and scope (const, let, var)', 'Asynchronous JS (Promises, async/await)', 'DOM manipulation and events'],
    quiz: [
      { q: 'What is the correct way to declare a block-scoped constant in JS?', options: ['var x = 10', 'let x = 10', 'const x = 10'], ans: 2 },
      { q: 'Which method converts a JSON string into a JavaScript object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.object()'], ans: 1 },
      { q: 'What does `typeof []` return in JavaScript?', options: ['"array"', '"object"', '"list"'], ans: 1 }
    ]
  },
  {
    id: 3,
    title: 'React Core Framework',
    desc: 'Components, state, hooks, and virtual DOM',
    concepts: ['Functional components & JSX', 'useState and useEffect hooks', 'Virtual DOM and lifecycle execution'],
    quiz: [
      { q: 'Which React hook is used to execute side-effects in functional components?', options: ['useState', 'useEffect', 'useContext'], ans: 1 },
      { q: 'React component names MUST start with what?', options: ['A lowercase letter', 'An uppercase letter', 'Either case is fine'], ans: 1 },
      { q: 'What optimizes React rendering performance by mapping changes in memory?', options: ['Shadow DOM', 'Virtual DOM', 'Direct DOM'], ans: 1 }
    ]
  },
  {
    id: 4,
    title: 'APIs & Database Basics',
    desc: 'HTTP REST methods, status codes, and SQL queries',
    concepts: ['HTTP Methods (GET, POST, PUT, DELETE)', 'Status codes (200, 400, 404, 500)', 'SQL CRUD queries and relational structures'],
    quiz: [
      { q: 'Which HTTP method is typically used to create a new resource on a server?', options: ['GET', 'POST', 'PUT'], ans: 1 },
      { q: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Sequential Query Language'], ans: 0 },
      { q: 'Which HTTP status code represents an Internal Server Error?', options: ['404', '403', '500'], ans: 2 }
    ]
  },
  {
    id: 5,
    title: 'System Design & Scaling',
    desc: 'Horizontal/vertical scaling, caches, and load balancers',
    concepts: ['Horizontal vs. vertical scaling', 'Caching and DB indexing', 'Load balancer routing protocols'],
    quiz: [
      { q: 'What is vertical scaling?', options: ['Adding more servers to the network', 'Adding more resources (CPU/RAM) to a single server', 'Distributing traffic to multiple regions'], ans: 1 },
      { q: 'What is the primary benefit of creating a database index?', options: ['Encrypting sensitive information', 'Speeding up query lookup times', 'Compressing database storage size'], ans: 1 },
      { q: 'Which component distributes incoming network traffic across multiple servers?', options: ['Router', 'Load Balancer', 'Reverse Cache'], ans: 1 }
    ]
  }
]

export default function SkillTree() {
  const { user } = useAuth()
  const toast = useToast()
  
  // Read completed nodes from local storage
  const [completedNodeIds, setCompletedNodeIds] = useState([])
  const [activeNode, setActiveNode] = useState(null)
  
  // Quiz states
  const [answers, setAnswers] = useState({}) // { qIdx: selectedOptIdx }
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizSuccess, setQuizSuccess] = useState(false)

  useEffect(() => {
    const completed = readUserData(user.id, 'completedSkillNodes', [])
    setCompletedNodeIds(completed)
  }, [user.id])

  const openNode = (node) => {
    // Check if locked
    const isLocked = node.id > 1 && !completedNodeIds.includes(node.id - 1)
    if (isLocked) {
      toast.show('This node is locked. Please complete the previous node first!', 'warning')
      return
    }
    setActiveNode(node)
    setAnswers({})
    setQuizSubmitted(false)
    setQuizSuccess(false)
  }

  const handleSelectOption = (qIdx, optIdx) => {
    if (quizSubmitted) return
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  const submitQuiz = () => {
    const qCount = activeNode.quiz.length
    if (Object.keys(answers).length < qCount) {
      toast.show('Please answer all questions before submitting.', 'warning')
      return
    }

    setQuizSubmitted(true)
    let correct = true
    activeNode.quiz.forEach((q, idx) => {
      if (answers[idx] !== q.ans) correct = false
    })

    setQuizSuccess(correct)

    if (correct) {
      toast.show('All answers correct! Node unlocked! 🎉', 'success')
      if (!completedNodeIds.includes(activeNode.id)) {
        const updated = [...completedNodeIds, activeNode.id]
        setCompletedNodeIds(updated)
        writeUserData(user.id, 'completedSkillNodes', updated)
      }
    } else {
      toast.show('Some answers were incorrect. Review and try again!', 'error')
    }
  }

  const progressPct = Math.round((completedNodeIds.length / SKILL_NODES.length) * 100)

  return (
    <AppShell title="RPG Skill Tree" subtitle="Track your career progress, learn core concepts, and complete mini-quizzes to level up your engineering skills.">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] max-w-5xl mx-auto animate-fade-up">
        {/* Left Side: Stats */}
        <div className="space-y-5">
          <Panel className="text-center">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-3">Your Progress</h3>
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-white/5 fill-none" strokeWidth="8" />
                <circle
                  cx="56" cy="56" r="48"
                  className="stroke-cyan-500 fill-none transition-all duration-700"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - progressPct / 100)}
                />
              </svg>
              <span className="absolute text-2xl font-black text-white">{progressPct}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-4 font-semibold">
              {completedNodeIds.length} of {SKILL_NODES.length} nodes completed
            </p>
          </Panel>

          <Panel>
            <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-3">Tree Rules</h4>
            <ul className="text-xs text-gray-400 space-y-2 leading-relaxed list-disc list-inside">
              <li>Complete quizzes to unlock nodes in sequence.</li>
              <li>Must score 100% on the quiz to unlock the next level.</li>
              <li>You can retake quizzes as many times as needed.</li>
            </ul>
          </Panel>
        </div>

        {/* Right Side: Visual Tree Map */}
        <Panel className="relative overflow-hidden min-h-[600px] flex flex-col items-center justify-center py-10">
          <div className="absolute inset-0 pointer-events-none flex justify-center">
            {/* Draw a vertical connection line */}
            <div className="w-[3px] bg-gradient-to-b from-cyan-500/80 via-blue-500/40 to-white/5 h-full opacity-60" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-md">
            {SKILL_NODES.map((node, idx) => {
              const isCompleted = completedNodeIds.includes(node.id)
              const isUnlocked = node.id === 1 || completedNodeIds.includes(node.id - 1)
              const isLocked = !isUnlocked && !isCompleted

              return (
                <button
                  key={node.id}
                  onClick={() => openNode(node)}
                  className={`w-full flex items-center gap-4 text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10 hover:scale-[1.02]'
                      : isUnlocked 
                      ? 'bg-white/[0.03] border-cyan-400/40 text-white hover:scale-[1.02] hover:border-cyan-400/60'
                      : 'bg-white/[0.01] border-white/5 text-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Node Badge/Level */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-colors ${
                    isCompleted 
                      ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/30'
                      : isUnlocked 
                      ? 'bg-white/[0.04] border-cyan-400/30 text-cyan-400'
                      : 'bg-white/[0.02] border-white/5 text-gray-600'
                  }`}>
                    {isCompleted ? '✓' : `Lvl ${node.id}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm transition-colors ${isLocked ? 'text-gray-600' : 'text-white'}`}>{node.title}</h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{node.desc}</p>
                  </div>

                  {isLocked && (
                    <span className="text-xs text-gray-600 bg-white/[0.02] px-2 py-0.5 rounded-md border border-white/5 font-semibold">Locked 🔒</span>
                  )}
                </button>
              )
            })}
          </div>
        </Panel>
      </div>

      {/* Quiz Overlay Modal */}
      {activeNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setActiveNode(null)} />
          
          <div className="relative w-full max-w-xl glass rounded-3xl border border-white/[0.08] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            {/* Header */}
            <div className="bg-[#020617] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Level {activeNode.id} Challenge</span>
                <h3 className="font-bold text-white text-base">{activeNode.title}</h3>
              </div>
              <button
                onClick={() => setActiveNode(null)}
                className="text-gray-400 hover:text-white transition cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content Drawer */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Concepts */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">Key Concepts to Master</h4>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                  {activeNode.concepts.map((concept, cIdx) => (
                    <li key={cIdx}>{concept}</li>
                  ))}
                </ul>
              </div>

              {/* Quiz section */}
              <div className="space-y-5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verify Your Knowledge</h4>
                {activeNode.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2">
                    <p className="text-xs font-semibold text-white">Q{qIdx + 1}: {q.q}</p>
                    <div className="grid gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = answers[qIdx] === oIdx
                        const isCorrect = q.ans === oIdx
                        const showCorrect = quizSubmitted && isCorrect
                        const showWrong = quizSubmitted && isSelected && !isCorrect

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(qIdx, oIdx)}
                            className={`text-left rounded-xl px-4 py-2.5 text-xs font-medium border transition-all cursor-pointer ${
                              showCorrect
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : showWrong
                                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                                : isSelected
                                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06] bg-[#020617]/50 flex justify-between items-center">
              {quizSubmitted ? (
                <>
                  <p className={`text-xs font-bold ${quizSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                    {quizSuccess ? '🎉 Passed! Node Unlocked!' : '❌ Incorrect answers. Try again.'}
                  </p>
                  <button
                    onClick={quizSuccess ? () => setActiveNode(null) : () => { setQuizSubmitted(false); setAnswers({}); }}
                    className={`${primaryButtonClass} !py-2 !px-4 text-xs cursor-pointer`}
                  >
                    {quizSuccess ? 'Close Drawer' : 'Retry Quiz'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500">Must get 3/3 correct answers</p>
                  <button
                    onClick={submitQuiz}
                    className={`${primaryButtonClass} !py-2 !px-4 text-xs cursor-pointer`}
                  >
                    Submit Quiz
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
