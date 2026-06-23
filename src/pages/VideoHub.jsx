import { useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge } from '../components/ui'

export default function VideoHub() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [watchedVideos, setWatchedVideos] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('watched_videos') : null
    try {
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to parse watched videos local cache:', e)
      return []
    }
  })

  const toggleWatched = (id) => {
    let updated = [...watchedVideos]
    if (updated.includes(id)) {
      updated = updated.filter(vId => vId !== id)
    } else {
      updated.push(id)
    }
    setWatchedVideos(updated)
    localStorage.setItem('watched_videos', JSON.stringify(updated))
  }

  const categories = [
    { id: 'all', label: '🎬 All Videos' },
    { id: 'dsa', label: '💻 Data Structures & Algorithms' },
    { id: 'frontend', label: '🖥️ Frontend Development' },
    { id: 'backend', label: '⚙️ Backend & DB' },
    { id: 'system', label: '🏗️ System Design' },
    { id: 'interview', label: '🎯 Interview Preparation' },
    { id: 'softskills', label: '💬 Soft Skills & HR' }
  ]

  const videoList = [
    // DSA
    { id: 'dsa_1', category: 'dsa', title: "DSA Complete Course for Placements", creator: "Striver (takeUforward)", duration: "Playlist (120+ videos)", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_OmI", difficulty: "All Levels" },
    { id: 'dsa_2', category: 'dsa', title: "NeetCode All LeetCode Solutions & Patterns", creator: "NeetCode", duration: "Playlist (100+ videos)", link: "https://www.youtube.com/@NeetCode/playlists", difficulty: "All Levels" },
    { id: 'dsa_3', category: 'dsa', title: "Data Structures & Algorithms Course", creator: "Abdul Bari", duration: "Playlist (45 videos)", link: "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZurVyY_j-6mFYUSo-1VwY", difficulty: "Intermediate" },
    { id: 'dsa_4', category: 'dsa', title: "Graph Algorithms Course for Beginners", creator: "freeCodeCamp", duration: "2h 15m", link: "https://www.youtube.com/watch?v=tWVWeAqZ0WU", difficulty: "Intermediate" },
    { id: 'dsa_5', category: 'dsa', title: "Dynamic Programming Masterclass", creator: "Aditya Verma", duration: "Playlist (30 videos)", link: "https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqHOzfOhPISIJGyHdvJDt", difficulty: "Advanced" },

    // Frontend
    { id: 'fe_1', category: 'frontend', title: "React JS Crash Course for Beginners", creator: "Traversy Media", duration: "1h 45m", link: "https://www.youtube.com/watch?v=w7ejDZ8SWv8", difficulty: "Beginner" },
    { id: 'fe_2', category: 'frontend', title: "JavaScript Mastery Complete Course", creator: "JavaScript Mastery", duration: "4h 30m", link: "https://www.youtube.com/watch?v=F3z7T6L5z9c", difficulty: "All Levels" },
    { id: 'fe_3', category: 'frontend', title: "Next.js App Router Masterclass", creator: "Fireship", duration: "12 mins", link: "https://www.youtube.com/watch?v=Sklc_fSGryY", difficulty: "Intermediate" },
    { id: 'fe_4', category: 'frontend', title: "Tailwind CSS Tutorial for Beginners", creator: "Net Ninja", duration: "Playlist (12 videos)", link: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9gpXORlEHjc5bgnIi5HEGgQ", difficulty: "Beginner" },
    { id: 'fe_5', category: 'frontend', title: "TypeScript Full Tutorial for Beginners", creator: "Dave Gray", duration: "3h 40m", link: "https://www.youtube.com/watch?v=gpg3yRHyUrM", difficulty: "Intermediate" },

    // Backend
    { id: 'be_1', category: 'backend', title: "Node.js & Express.js Course", creator: "FreeCodeCamp", duration: "8h 15m", link: "https://www.youtube.com/watch?v=Oe421EPjeBE", difficulty: "Intermediate" },
    { id: 'be_2', category: 'backend', title: "SQL & Relational Databases Basics", creator: "Programming with Mosh", duration: "3h 10m", link: "https://www.youtube.com/watch?v=7S_tz1z_5bA", difficulty: "Beginner" },
    { id: 'be_3', category: 'backend', title: "MongoDB Complete Tutorial", creator: "Net Ninja", duration: "Playlist (15 videos)", link: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9h77dJ-ykFMlxhvKLDgnCdr", difficulty: "Intermediate" },
    { id: 'be_4', category: 'backend', title: "PostgreSQL Tutorial for Beginners", creator: "Amigoscode", duration: "4h 20m", link: "https://www.youtube.com/watch?v=qw--VYLpxG4", difficulty: "Beginner" },
    { id: 'be_5', category: 'backend', title: "Docker & Containerization Tutorial", creator: "TechWorld with Nana", duration: "2h 45m", link: "https://www.youtube.com/watch?v=3c-iKn5qMo0", difficulty: "Intermediate" },

    // System Design
    { id: 'sys_1', category: 'system', title: "System Design for Beginners", creator: "Gaurav Sen", duration: "Playlist (25 videos)", link: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnucEUDeQlh4694KclV3vV8W", difficulty: "Intermediate" },
    { id: 'sys_2', category: 'system', title: "Scale from 0 to 10 Million Users", creator: "ByteByteGo", duration: "15 mins", link: "https://www.youtube.com/watch?v=SqcY0GlETPk", difficulty: "All Levels" },
    { id: 'sys_3', category: 'system', title: "Microservices Architecture Explained", creator: "Coding with John", duration: "18 mins", link: "https://www.youtube.com/watch?v=CdBtFQd9v8I", difficulty: "Intermediate" },
    { id: 'sys_4', category: 'system', title: "System Design Primer - API Design", creator: "Hussein Nasser", duration: "25 mins", link: "https://www.youtube.com/watch?v=f2c0_y9g354", difficulty: "Advanced" },

    // Interview Prep
    { id: 'int_1', category: 'interview', title: "How to Prepare for Technical Interviews", creator: "Love Babbar", duration: "15 mins", link: "https://www.youtube.com/watch?v=p0Z3tQeA7pA", difficulty: "Beginner" },
    { id: 'int_2', category: 'interview', title: "Top 10 Coding Interview Questions", creator: "Clément Mihailescu", duration: "45 mins", link: "https://www.youtube.com/watch?v=KzF4Z1hGq34", difficulty: "Intermediate" },
    { id: 'int_3', category: 'interview', title: "Behavioral Interview Prep (STAR Method)", creator: "Dan Croitor", duration: "Playlist (20 videos)", link: "https://www.youtube.com/@DanCroitor/videos", difficulty: "All Levels" },
    { id: 'int_4', category: 'interview', title: "TCS / Infosys / Wipro Interview Preparation", creator: "Online Study 4 U", duration: "Playlist", link: "https://www.youtube.com/@OnlineStudy4U/playlists", difficulty: "Beginner" },

    // Soft Skills
    { id: 'ss_1', category: 'softskills', title: "Tell Me About Yourself - Perfect Answer", creator: "Self Made Millennial", duration: "10 mins", link: "https://www.youtube.com/watch?v=pb7_yZ5b7tY", difficulty: "All Levels" },
    { id: 'ss_2', category: 'softskills', title: "English Speaking Practice for Placements", creator: "Learnex", duration: "18 mins", link: "https://www.youtube.com/watch?v=r0X9q9p7r-k", difficulty: "Beginner" },
    { id: 'ss_3', category: 'softskills', title: "Salary Negotiation Tips - Don't Say This", creator: "Career Contessa", duration: "12 mins", link: "https://www.youtube.com/watch?v=gT8Tz6P0S9M", difficulty: "Intermediate" }
  ]

  const filteredVideos = videoList.filter(vid => {
    const matchesCategory = activeCategory === 'all' || vid.category === activeCategory
    const matchesSearch = vid.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vid.creator.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <AppShell>
      <div className="relative max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1.5 rounded-full glass border border-white/[0.08]">
              Curated Video Hub
            </span>
            <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight font-sans">Curated Learning Hub</h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Handpicked video guides, courses, and channel resources from leading software developers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500">
              Progress: {watchedVideos.length} / {videoList.length} Watched
            </span>
            <div className="w-24 bg-white/5 rounded-full h-2 overflow-hidden border border-white/[0.06]">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${(watchedVideos.length / videoList.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
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

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search videos or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>

        {/* Video Cards Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
            <p className="text-gray-500">No videos found matching your query.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((vid) => {
              const isWatched = watchedVideos.includes(vid.id)
              return (
                <Card3D 
                  key={vid.id} 
                  className={`flex flex-col justify-between h-full border ${
                    isWatched ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-white/[0.06]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                        YouTube
                      </span>
                      <StatusBadge tone={vid.difficulty === 'Advanced' ? 'purple' : vid.difficulty === 'Intermediate' ? 'blue' : 'green'}>
                        {vid.difficulty}
                      </StatusBadge>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Channel: {vid.creator}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-semibold">{vid.duration}</span>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleWatched(vid.id)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          isWatched 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                            : 'bg-white/[0.02] text-gray-400 border-white/[0.08] hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        {isWatched ? '✓ Watched' : 'Mark Watched'}
                      </button>

                      <a
                        href={vid.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        Open
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </Card3D>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
