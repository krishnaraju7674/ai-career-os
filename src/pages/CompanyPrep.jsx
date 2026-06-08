import { useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge } from '../components/ui'

export default function CompanyPrep() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const companies = [
    {
      id: 'google',
      name: "Google",
      logo: "🌐",
      type: "product",
      difficulty: "Hard",
      avgCtc: "30 - 45 LPA",
      rounds: ["1 Online Assessment (DSA & Coding)", "4-5 Technical Rounds (DSA, System Design, Googlyness)", "1 Hiring Committee Review"],
      tips: [
        "Focus heavily on Graph Algorithms, Dynamic Programming, and Recursion.",
        "Practice talking while coding. Google interviewers value the thinking process over just syntax.",
        "Prepare 'Googlyness' answers: behavioral questions using the STAR method."
      ],
      description: "Google's interviews are standard for evaluating deep algorithmic skills, analytical reasoning, and software design capabilities."
    },
    {
      id: 'microsoft',
      name: "Microsoft",
      logo: "💻",
      type: "product",
      difficulty: "Hard",
      avgCtc: "25 - 40 LPA",
      rounds: ["1 Resume Shortlisting / Coding Test", "3 Technical Rounds (Arrays, Strings, Linked Lists, Trees)", "1 AA Round (Asappropriate Advisor - Behavioral/Tech)"],
      tips: [
        "Strong fundamentals in Trees, Arrays, and Linked Lists are essential.",
        "Microsoft focuses on writing production-ready, clean, readable code.",
        "Be ready for basic system design questions for mid-level roles."
      ],
      description: "Microsoft is renowned for focusing on core data structures, algorithms, object-oriented design, and problem-solving methodologies."
    },
    {
      id: 'amazon',
      name: "Amazon",
      logo: "📦",
      type: "product",
      difficulty: "Hard",
      avgCtc: "24 - 38 LPA",
      rounds: ["1 Online Assessment (2 Coding Qs + Work Simulation)", "3 Technical Coding Rounds", "1 Bar Raiser Round (System Design + Leadership Principles)"],
      tips: [
        "Study Amazon's 16 Leadership Principles. Over 50% of the scoring is based on behavioral alignment.",
        "Practice medium/hard LeetCode problems on Stack, Queue, HashMaps, and Graphs.",
        "Be ready for scale/architectural trade-off questions."
      ],
      description: "Amazon evaluates candidates using rigorous coding rounds, system design, and deep alignment with their Leadership Principles."
    },
    {
      id: 'flipkart',
      name: "Flipkart",
      logo: "🛒",
      type: "product",
      difficulty: "Hard",
      avgCtc: "18 - 32 LPA",
      rounds: ["1 Machine Coding Round (2 Hours)", "2 Technical DSA Rounds", "1 Hiring Manager Round (System Architecture + HR)"],
      tips: [
        "Master Machine Coding. You must write working, modular, OOP-compliant code in 2 hours.",
        "Understand design patterns (Singleton, Strategy, Factory).",
        "Clear concept of database indexing, transactions, and scaling."
      ],
      description: "Flipkart's hallmark is the 'Machine Coding' round, testing clean code practices, SOLID principles, and working prototypes."
    },
    {
      id: 'razorpay',
      name: "Razorpay",
      logo: "💳",
      type: "startup",
      difficulty: "Medium-Hard",
      avgCtc: "16 - 28 LPA",
      rounds: ["1 Initial Screening (DSA)", "1 Tech Coding Round", "1 Machine Coding Round (React/Node depending on role)", "1 Culture Fitment Round"],
      tips: [
        "Understand web fundamentals deeply: Event Loop, CORS, security headers, Promises.",
        "Razorpay values quick execution and high curiosity.",
        "Showcase open-source projects or high-impact personal deployments."
      ],
      description: "A fast-growing fintech startup that tests high technical proficiency, rapid coding capabilities, and dynamic problem-solving."
    },
    {
      id: 'tcs',
      name: "TCS (Ninja/Digital)",
      logo: "🤝",
      type: "mass",
      difficulty: "Easy-Medium",
      avgCtc: "3.6 - 7.0 LPA",
      rounds: ["1 TCS NQT (Aptitude, Verbal, Basic Coding)", "1 Combined Technical Round", "1 Managerial & HR Round"],
      tips: [
        "Prepare basic quantitative aptitude, logical reasoning, and verbal english.",
        "Learn basic SQL queries, loops, and oops concepts in Java/C++/Python.",
        "Stay confident. TCS focuses on communication, adaptability, and basics."
      ],
      description: "Tata Consultancy Services recruits freshers through their national NQT test, offering Ninja (3.6LPA) and Digital (7LPA) roles."
    },
    {
      id: 'infosys',
      name: "Infosys (SE/SP/DSE)",
      logo: "🏢",
      type: "mass",
      difficulty: "Easy-Medium",
      avgCtc: "3.6 - 9.5 LPA",
      rounds: ["1 InfyTQ or HackWithInfy Test", "1 Technical Interview", "1 HR Assessment"],
      tips: [
        "HackWithInfy questions focus on Medium-difficulty Dynamic Programming.",
        "For System Engineer (SE), practice basic puzzle questions and basic databases.",
        "Ensure your resume projects are authentic; they ask deep project detail."
      ],
      description: "Infosys offers three tiers for freshers: System Engineer (SE), Specialist Programmer (SP), and Digital Specialist Engineer (DSE)."
    },
    {
      id: 'cognizant',
      name: "Cognizant",
      logo: "💡",
      type: "mass",
      difficulty: "Easy-Medium",
      avgCtc: "4.0 - 8.5 LPA",
      rounds: ["1 Online Assessment (GenC/GenC Next)", "1 Technical Coding & Resume Interview", "1 HR Assessment"],
      tips: [
        "Prepare basic array manipulations, string operations, and basic DSA.",
        "Be ready for SQL queries, database keys, and basic cloud concepts.",
        "Cognizant's GenC Next tier focuses on React/Full-stack/Cloud basics."
      ],
      description: "Cognizant hires via GenC (Basic) and GenC Next (Advanced/Product) tracks targeting engineering freshers."
    },
    {
      id: 'accenture',
      name: "Accenture",
      logo: "🎯",
      type: "mass",
      difficulty: "Easy-Medium",
      avgCtc: "4.5 - 6.5 LPA",
      rounds: ["1 Cognitive & Technical Test", "1 Coding Assessment (2 Questions)", "1 Communication Test", "1 Final Interview"],
      tips: [
        "The Communication Test is AI-evaluated; practice speaking clearly in English.",
        "Coding questions are mostly simple (array, looping, conditions).",
        "Understand basic networking, security, and MS Office tools."
      ],
      description: "Accenture uses a multi-stage automated test evaluating cognitive reasoning, coding, and verbal communication."
    }
  ]

  const filtered = companies.filter(c => activeFilter === 'all' || c.type === activeFilter)

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <AppShell>
      <div className="relative max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1.5 rounded-full glass border border-white/[0.08]">
            Company Wise Interview Guide
          </span>
          <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight">Company Preparation Guide</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Explore recruitment rounds, difficulty ratings, salaries, and specific tricks to clear tests for top companies.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2.5 justify-center md:justify-start mb-10 bg-white/[0.02] border border-white/[0.04] p-2 rounded-2xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            All Companies
          </button>
          <button
            onClick={() => setActiveFilter('product')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
              activeFilter === 'product'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Product Giants 🌐
          </button>
          <button
            onClick={() => setActiveFilter('startup')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
              activeFilter === 'startup'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Startups 🚀
          </button>
          <button
            onClick={() => setActiveFilter('mass')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
              activeFilter === 'mass'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Mass Recruiters 🏢
          </button>
        </div>

        {/* Companies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((comp) => {
            const isExpanded = expandedId === comp.id
            return (
              <Card3D key={comp.id} className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{comp.logo}</span>
                      <h2 className="text-xl font-bold text-white">{comp.name}</h2>
                    </div>
                    <StatusBadge tone={comp.difficulty === 'Hard' ? 'red' : comp.difficulty === 'Medium-Hard' ? 'purple' : 'blue'}>
                      {comp.difficulty}
                    </StatusBadge>
                  </div>

                  <p className="text-xs text-cyan-400 font-bold bg-cyan-500/5 px-2.5 py-1 rounded-lg border border-cyan-500/10 inline-block mb-3">
                    Average Package: {comp.avgCtc}
                  </p>

                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {comp.description}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4 animate-fade-in">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recruitment Rounds:</h4>
                        <ol className="list-decimal pl-4 space-y-1">
                          {comp.rounds.map((rnd, rIdx) => (
                            <li key={rIdx} className="text-xs text-gray-300 leading-relaxed">
                              {rnd}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cracking Tips:</h4>
                        <ul className="list-disc pl-4 space-y-1 text-cyan-300">
                          {comp.tips.map((tip, tIdx) => (
                            <li key={tIdx} className="text-xs leading-relaxed">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleExpand(comp.id)}
                  className="mt-6 w-full text-center py-2.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.06] transition-all cursor-pointer"
                >
                  {isExpanded ? 'Hide Details ▲' : 'Show Rounds & Tips ▼'}
                </button>
              </Card3D>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
