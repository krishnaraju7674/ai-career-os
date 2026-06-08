import { useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge } from '../components/ui'

export default function ResourceLibrary() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'coding', label: 'Coding Platforms' },
    { id: 'jobs', label: 'Job Boards' },
    { id: 'learning', label: 'Learning Sites' },
    { id: 'tools', label: 'Developer Tools' },
    { id: 'communities', label: 'Communities' },
    { id: 'blogs', label: 'Career Blogs' }
  ]

  const resources = [
    // Coding
    { name: "LeetCode", desc: "The best platform to practice coding challenges, database schemas, and algorithms for technical interviews.", link: "https://leetcode.com", category: "coding", badge: "Free/Paid" },
    { name: "HackerRank", desc: "Practice SQL, DSA, core languages, and complete skill verification badges to showcase on your profile.", link: "https://hackerrank.com", category: "coding", badge: "Free" },
    { name: "CodeChef", desc: "Competitive programming platform hosts weekly coding contents and offers structured programming tracks.", link: "https://codechef.com", category: "coding", badge: "Free" },
    { name: "GeeksforGeeks", desc: "A massive archive of computer science tutorials, system design notes, algorithms, and company-wise prep sheets.", link: "https://geeksforgeeks.org", category: "coding", badge: "Free" },
    { name: "NeetCode", desc: "Structured roadmap for LeetCode questions, explaining key patterns like sliding window, trees, and backtracking.", link: "https://neetcode.io", category: "coding", badge: "Free/Paid" },
    
    // Jobs
    { name: "LinkedIn", desc: "The leading professional network to connect with recruiters, apply for roles, and share your projects.", link: "https://linkedin.com", category: "jobs", badge: "Free" },
    { name: "Naukri", desc: "The largest recruitment portal in India. Essential for freshers and experienced folks to upload resumes.", link: "https://naukri.com", category: "jobs", badge: "Free" },
    { name: "Wellfound (AngelList)", desc: "The absolute best platform to find remote/onsite developer jobs at high-growth startups globally.", link: "https://wellfound.com", category: "jobs", badge: "Free" },
    { name: "Indeed", desc: "Aggregator of job listings from companies worldwide. Excellent for salary reports and reviews.", link: "https://indeed.com", category: "jobs", badge: "Free" },
    { name: "Foundit (Monster)", desc: "Major job recruitment database matching candidates with corporate job opportunities in India.", link: "https://foundit.in", category: "jobs", badge: "Free" },

    // Learning
    { name: "freeCodeCamp", desc: "100% free interactive certifications in Frontend, Backend, Data Analysis, and Quality Assurance.", link: "https://freecodecamp.org", category: "learning", badge: "Free" },
    { name: "W3Schools", desc: "Simple, highly structured documentation with interactive editors. Excellent for absolute beginners.", link: "https://w3schools.com", category: "learning", badge: "Free" },
    { name: "MDN Web Docs", desc: "Official documentation from Mozilla for HTML, CSS, JavaScript, and Web APIs. Highly detailed.", link: "https://developer.mozilla.org", category: "learning", badge: "Free" },
    { name: "Coursera", desc: "Take certified courses from top institutions like Google, IBM, Stanford. Audit courses for free.", link: "https://coursera.org", category: "learning", badge: "Free/Paid" },
    { name: "Udemy", desc: "Find thousands of developer bootcamps, system design courses, and certification prep at low prices.", link: "https://udemy.com", category: "learning", badge: "Paid" },

    // Tools
    { name: "GitHub", desc: "Host your source code repositories, collaborate on open-source, and showcase your developer portfolio.", link: "https://github.com", category: "tools", badge: "Free" },
    { name: "Vercel", desc: "Deploy frontend applications, Next.js sites, and serverless functions directly from Git in 30 seconds.", link: "https://vercel.com", category: "tools", badge: "Free" },
    { name: "Figma", desc: "Design modern responsive user interfaces, wireframes, and prototypes before coding them.", link: "https://figma.com", category: "tools", badge: "Free" },
    { name: "Notion", desc: "Write documentation, track your learning notes, organize your job hunt, and schedule tasks.", link: "https://notion.so", category: "tools", badge: "Free" },
    { name: "Stack Overflow", desc: "The largest community of programmers helping each other debug, solve runtime errors, and share knowledge.", link: "https://stackoverflow.com", category: "tools", badge: "Free" },

    // Communities
    { name: "Dev.to", desc: "An open community of software developers sharing coding tips, career hacks, and technical blogs.", link: "https://dev.to", category: "communities", badge: "Free" },
    { name: "Reddit (r/cscareerquestions)", desc: "Subreddit discussing resume reviews, tech trends, salary negotiation, and advice for engineers.", link: "https://reddit.com/r/cscareerquestions", category: "communities", badge: "Free" },
    { name: "Hashnode", desc: "Start a personal developer blog on your own custom domain for free, and connect with global writers.", link: "https://hashnode.com", category: "communities", badge: "Free" },
    { name: "Showwcase", desc: "A dedicated professional network built strictly for coders to showcase projects and share code logs.", link: "https://showwcase.com", category: "communities", badge: "Free" },

    // Blogs
    { name: "ByteByteGo", desc: "System Design explanations, architectural blueprints, and simplified explanations of how real apps scale.", link: "https://blog.bytebytego.com", category: "blogs", badge: "Free/Paid" },
    { name: "Dan Abramov Overreacted", desc: "A personal blog from React Core Team member clarifying deep web dev and React principles.", link: "https://overreacted.io", category: "blogs", badge: "Free" },
    { name: "Pragmatic Engineer", desc: "The #1 technology newsletter written by Gergely Orosz discussing developer jobs, hiring, and tech trends.", link: "https://blog.pragmaticengineer.com", category: "blogs", badge: "Free/Paid" },
    { name: "Resume Worded", desc: "Excellent blog offering bullet point recommendations, structure guidelines, and ATS tips.", link: "https://resumeworded.com", category: "blogs", badge: "Free/Paid" }
  ]

  const filtered = resources.filter(res => {
    const matchesCategory = activeCategory === 'all' || res.category === activeCategory
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.desc.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <AppShell>
      <div className="relative max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1.5 rounded-full glass border border-white/[0.08]">
              Placement Resources
            </span>
            <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight">Curated Career Resources</h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Quick access to job platforms, coding practice, tools, blogs, and communities to boost your career.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/[0.01] border border-white/[0.04] p-1.5 rounded-2xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res, idx) => (
            <Card3D key={idx} className="flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors">
                    {res.name}
                  </h3>
                  <StatusBadge tone="gray">
                    {res.badge}
                  </StatusBadge>
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  {res.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.05]">
                <a
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-cyan-400 hover:text-cyan-300 border border-white/[0.06] transition-all flex items-center justify-center gap-1"
                >
                  Visit Site
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
