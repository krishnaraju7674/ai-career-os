import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Panel, StatusBadge, primaryButtonClass } from '../components/ui'
import { useToast } from '../context/ToastContext'

const PRESET_PROBLEMS = [
  {
    id: 'twosum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    desc: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
    constraints: '• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9',
    templates: {
      javascript: `function twoSum(nums, target) {\n  // Write your code here\n  \n}`,
      python: `def two_sum(nums, target):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}`
    }
  },
  {
    id: 'validparentheses',
    title: '20. Valid Parentheses',
    difficulty: 'Easy',
    desc: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.',
    examples: 'Input: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
    constraints: '• 1 <= s.length <= 10^4\n• s consists of parentheses only \'()[]{}\'.',
    templates: {
      javascript: `function isValid(s) {\n  // Write your code here\n  \n}`,
      python: `def is_valid(s):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}`
    }
  },
  {
    id: 'fizzbuzz',
    title: '412. Fizz Buzz',
    difficulty: 'Easy',
    desc: 'Given an integer `n`, return a string array `answer` (1-indexed) where:\n• answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n• answer[i] == "Fizz" if i is divisible by 3.\n• answer[i] == "Buzz" if i is divisible by 5.\n• answer[i] == i (as a string) if none of the above conditions are true.',
    examples: 'Input: n = 3\nOutput: ["1","2","Fizz"]\n\nInput: n = 5\nOutput: ["1","2","Fizz","4","Buzz"]',
    constraints: '• 1 <= n <= 10^4',
    templates: {
      javascript: `function fizzBuzz(n) {\n  // Write your code here\n  \n}`,
      python: `def fizz_buzz(n):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public List<String> fizzBuzz(int n) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}`
    }
  }
]

export default function CodingSandbox() {
  const toast = useToast()
  
  const [problems, setProblems] = useState(PRESET_PROBLEMS)
  const [selectedProb, setSelectedProb] = useState(PRESET_PROBLEMS[0])
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState(PRESET_PROBLEMS[0].templates.javascript)
  
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  
  const [aiGenerating, setAiGenerating] = useState(false)

  // Reset code template when changing problem or language
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedProb.templates[lang]) {
        setCode(selectedProb.templates[lang])
      } else {
        setCode('')
      }
      setEvaluation(null)
    }, 0)
    return () => clearTimeout(timer)
  }, [selectedProb, lang])

  const selectProblem = (prob) => {
    setSelectedProb(prob)
  }

  // AI custom problem generation
  const handleGenerateAiProblem = async () => {
    setAiGenerating(true)
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
                text: `Generate a new premium algorithms coding interview question (Easy, Medium, or Hard level).
Format the output as a valid JSON object only. Do NOT include markdown blocks, backticks, or additional text.
The JSON object must have this exact structure:
{
  "id": "unique_string_id",
  "title": "Problem Number. Problem Title",
  "difficulty": "Medium", // Easy, Medium, or Hard
  "desc": "Detailed markdown problem description",
  "examples": "Input/Output example statements",
  "constraints": "Bullet points of constraints",
  "templates": {
    "javascript": "function solution() {\\n\\n}",
    "python": "def solution():\\n    pass",
    "java": "class Solution {\\n    public void solution() {\\n\\n    }\\n}"
  }
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
      if (parsed.id && parsed.title) {
        setProblems(prev => [parsed, ...prev])
        setSelectedProb(parsed)
        toast.success(`Generated new coding challenge: ${parsed.title}! 🚀`)
      } else {
        throw new Error('Invalid format returned')
      }
    } catch (e) {
      toast.error('Failed to generate AI coding challenge: ' + e.message)
    } finally {
      setAiGenerating(false)
    }
  }

  // AI Compiler evaluation
  const handleEvaluate = async () => {
    if (!code.trim()) return
    setEvaluating(true)
    setEvaluation(null)
    
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
                text: `You are an expert technical interviewer and code compiler agent.
Please evaluate the following code submission against the problem description.

Problem:
Title: ${selectedProb.title}
Description: ${selectedProb.desc}
Constraints: ${selectedProb.constraints}

Language Used: ${lang}
User Code:
${code}

Perform a rigorous evaluation. Return a valid JSON object only. Do NOT include markdown blocks, backticks, or additional text.
The JSON object must have this exact structure:
{
  "status": "Accepted", // Accepted, Wrong Answer, Compile Error, Time Limit Exceeded
  "correct": true, // boolean
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "feedback": "Detailed critical feedback outlining edge cases checked, logical soundness, and readability.",
  "optimalSolution": "The code for the most optimal solution in the requested language."
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
      setEvaluation(parsed)
      if (parsed.correct) {
        toast.success('All checks passed! Code compiled successfully. 🎉')
      } else {
        toast.warning(`Evaluation finished: ${parsed.status}`)
      }
    } catch (e) {
      toast.error('Code evaluation failed: ' + e.message)
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <AppShell title="AI Code Sandbox" subtitle="Write and compile programming challenges. Evaluate your code complexity and logic using our virtual AI compiler.">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] max-w-7xl mx-auto animate-fade-up">
        {/* Left Side: Problem List */}
        <div className="space-y-4">
          <Panel>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Coding Challenges</h3>
              <button
                onClick={handleGenerateAiProblem}
                disabled={aiGenerating}
                className="text-[10px] font-black uppercase text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded hover:bg-pink-500/20 cursor-pointer transition"
              >
                {aiGenerating ? 'Gen...' : '✨ Gen AI'}
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {problems.map(prob => {
                const isActive = prob.id === selectedProb.id
                return (
                  <button
                    key={prob.id}
                    onClick={() => selectProblem(prob)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex flex-col gap-1 ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/40 text-white' 
                        : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span>{prob.title}</span>
                    <span className={`text-[9px] font-bold uppercase w-fit px-1.5 py-0.5 rounded ${
                      prob.difficulty === 'Easy' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : prob.difficulty === 'Hard'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>

        {/* Right Side: Dual-Pane Coding Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pane 1: Problem Description */}
          <div className="space-y-5">
            <Panel className="h-[550px] flex flex-col justify-between overflow-y-auto">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-black text-white">{selectedProb.title}</h2>
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                    selectedProb.difficulty === 'Easy' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : selectedProb.difficulty === 'Hard'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {selectedProb.difficulty}
                  </span>
                </div>

                <div className="text-xs text-gray-300 leading-relaxed space-y-4">
                  <p className="whitespace-pre-line bg-white/[0.01] p-3.5 rounded-2xl border border-white/[0.04]">
                    {selectedProb.desc}
                  </p>
                  
                  {selectedProb.examples && (
                    <div>
                      <h4 className="font-bold text-white mb-1.5 uppercase text-[10px] tracking-wider">Examples:</h4>
                      <pre className="bg-black/30 p-3 rounded-xl border border-white/[0.04] text-[11px] font-mono text-gray-400 whitespace-pre-wrap">
                        {selectedProb.examples}
                      </pre>
                    </div>
                  )}

                  {selectedProb.constraints && (
                    <div>
                      <h4 className="font-bold text-white mb-1.5 uppercase text-[10px] tracking-wider">Constraints:</h4>
                      <pre className="bg-black/20 p-3 rounded-xl border border-white/[0.04] text-[11px] font-mono text-gray-400 whitespace-pre-wrap">
                        {selectedProb.constraints}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          {/* Pane 2: Code Editor & Evaluation */}
          <div className="space-y-5 flex flex-col h-[550px]">
            <Panel className="flex-1 flex flex-col justify-between overflow-hidden relative">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Interactive Editor</h3>
                  
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value)}
                    className="bg-[#020617] border border-white/[0.08] text-xs font-bold text-gray-300 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                </div>

                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="flex-1 w-full bg-black/40 border border-white/[0.08] focus:border-cyan-500/50 rounded-2xl p-4 text-[11px] font-mono text-cyan-300 outline-none resize-none"
                  rows={15}
                  placeholder="// Paste or write your solution here..."
                />
              </div>

              <div className="mt-4 flex gap-3 border-t border-white/[0.04] pt-4">
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || !code.trim()}
                  className={`${primaryButtonClass} flex-1`}
                >
                  {evaluating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Evaluating...
                    </span>
                  ) : '🚀 Compile & Submit'}
                </button>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {/* Evaluation Results */}
      {evaluation && (
        <div className="max-w-7xl mx-auto mt-6 animate-fade-up">
          <Panel className={`border ${evaluation.correct ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <StatusBadge tone={evaluation.correct ? 'green' : 'red'}>
                  {evaluation.status}
                </StatusBadge>
                <span className="text-xs text-gray-500 font-semibold font-mono">
                  Time: {evaluation.timeComplexity} | Space: {evaluation.spaceComplexity}
                </span>
              </div>
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Compiler Feedback</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <strong className="text-white text-xs block">AI Audit Review:</strong>
                <p className="text-xs text-gray-400 leading-relaxed bg-white/[0.01] p-4 rounded-2xl border border-white/[0.04] whitespace-pre-line">
                  {evaluation.feedback}
                </p>
              </div>

              <div className="space-y-2">
                <strong className="text-white text-xs block">Optimal Reference Solution:</strong>
                <pre className="bg-black/40 border border-white/[0.08] p-4 rounded-2xl text-[10px] font-mono text-emerald-400 overflow-x-auto">
                  {evaluation.optimalSolution}
                </pre>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </AppShell>
  )
}
