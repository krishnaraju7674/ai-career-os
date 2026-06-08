import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function LandingPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('freshers')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  // 3D Tilt Hook for cards
  const TiltCard = ({ children, className = '' }) => {
    const cardRef = useRef(null)
    const handleMouseMove = (e) => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      
      // Calculate rotation based on cursor position
      const factor = 12 // Adjust sensitivity
      const rotateX = -(y / rect.height) * factor
      const rotateY = (x / rect.width) * factor
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    }

    const handleMouseLeave = () => {
      const card = cardRef.current
      if (!card) return
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }

    return (
      <div className="card-3d-wrap" style={{ perspective: '1000px' }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`card-3d glass rounded-2xl p-6 transition-all duration-200 ease-out border border-white/[0.06] hover:border-cyan-500/35 relative overflow-hidden ${className}`}
        >
          {children}
        </div>
      </div>
    )
  }

  const features = [
    {
      title: "AI Placement Advisor",
      desc: "Instant conversational guidance powered by Gemini AI. Get custom prep strategies, resume reviews, and career counseling.",
      icon: "🤖",
      color: "from-cyan-500/20 to-blue-500/10",
      badge: "Gemini AI"
    },
    {
      title: "Smart Resume Reviewer",
      desc: "Upload your resume and get immediate ratings, structural analysis, and personalized suggestions to beat applicant tracking systems.",
      icon: "📄",
      color: "from-blue-500/20 to-violet-500/10",
      badge: "Real-time"
    },
    {
      title: "Interactive Interview Coach",
      desc: "Ace coding rounds, HR questions, Group Discussions, and Aptitude tests. Track your mock sessions and build confidence.",
      icon: "🎯",
      color: "from-violet-500/20 to-pink-500/10",
      badge: "200+ Qs"
    },
    {
      title: "Interactive Roadmaps",
      desc: "Follow guided visual career paths for Frontend, Backend, Data Science, DevOps, and more. Step-by-step milestones.",
      icon: "🗺️",
      color: "from-emerald-500/20 to-cyan-500/10",
      badge: "Comprehensive"
    },
    {
      title: "Job Application Tracker",
      desc: "A clean Kanban board to organize your job pipeline, schedule follow-ups, and keep track of resume variants.",
      icon: "💼",
      color: "from-amber-500/20 to-orange-500/10",
      badge: "Analytics"
    },
    {
      title: "JD Matching & Analysis",
      desc: "Paste any job description and let the AI analyze how well your profile aligns. Identify critical skill gaps in seconds.",
      icon: "🔍",
      color: "from-pink-500/20 to-purple-500/10",
      badge: "AI-Powered"
    },
    {
      title: "Gamified Progress",
      desc: "Earn achievement badges as you prepare. Track your daily habits, study logs, and score your overall placement readiness.",
      icon: "🏆",
      color: "from-teal-500/20 to-emerald-500/10",
      badge: "Badges"
    },
    {
      title: "Resource & Video Hub",
      desc: "Get curated YouTube guide links, cheat sheets, certifications, and salary insights for major tech cities.",
      icon: "📚",
      color: "from-indigo-500/20 to-blue-500/10",
      badge: "Curated"
    }
  ]

  const steps = [
    { num: "01", title: "Build Profile & Skills", desc: "List your tech stack, projects, and target companies to compute your initial readiness score." },
    { num: "02", title: "Analyze & Optimize", desc: "Compare your resume against JDs, consult the AI Advisor, and identify crucial missing skills." },
    { num: "03", title: "Practice & Land Offers", desc: "Prepare with curated roadmaps, take mock interviews, track applications, and earn career badges." }
  ]

  const videos = {
    freshers: [
      { title: "Complete Placement Guide for College Students", channel: "CodeHelp - Babbar", duration: "18 mins", link: "https://www.youtube.com/watch?v=gfd3O61Yn7w" },
      { title: "How to Get Off-Campus Placement in 2026", channel: "Apna College", duration: "14 mins", link: "https://www.youtube.com/watch?v=H74r3z9F4O8" },
      { title: "Resume Tips for Freshers - Get Shortlisted!", channel: "Anuj Bhaiya", duration: "12 mins", link: "https://www.youtube.com/watch?v=xz7L__p8Bts" }
    ],
    experienced: [
      { title: "System Design Blueprint: Scaling Apps", channel: "ByteByteGo", duration: "22 mins", link: "https://www.youtube.com/watch?v=SqcY0GlETPk" },
      { title: "How to Transition from Service to Product Company", channel: "Striver (takeUforward)", duration: "16 mins", link: "https://www.youtube.com/watch?v=5rT8Zt9v87I" },
      { title: "Acing L3/L4 Technical Interviews", channel: "Gaurav Sen", duration: "25 mins", link: "https://www.youtube.com/watch?v=Yg5a-H_p4Z0" }
    ]
  }

  return (
    <div className="relative min-h-screen bg-[#020617] text-gray-100 dot-bg overflow-x-hidden">
      
      {/* 3D Floating Shapes (Pure CSS) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Floating Cube */}
        <div className="absolute top-[20%] left-[10%] w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-2xl animate-float-slow opacity-60 filter blur-sm"></div>
        {/* Floating Sphere */}
        <div className="absolute top-[60%] right-[10%] w-32 h-32 bg-gradient-to-bl from-violet-600/10 to-transparent rounded-full animate-float opacity-50 filter blur-md"></div>
        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 filter blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/5 filter blur-[150px] animate-pulse-glow"></div>
        
        {/* Particles */}
        <div className="particle" style={{ left: '20%', top: '80%', animationDelay: '0s' }}></div>
        <div className="particle" style={{ left: '40%', top: '90%', animationDelay: '2s' }}></div>
        <div className="particle" style={{ left: '60%', top: '70%', animationDelay: '4s' }}></div>
        <div className="particle" style={{ left: '80%', top: '60%', animationDelay: '1s' }}></div>
        <div className="particle" style={{ left: '15%', top: '40%', animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06] backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">AI CAREER OS</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">Workflow</a>
          <a href="#video-guides" className="hover:text-cyan-400 transition-colors">Guides</a>
        </nav>

        <div>
          {session ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-450 hover:to-blue-550 shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all active:scale-[0.98]"
            >
              Go to Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/login?signup=true')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/15 active:scale-[0.98]"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-24 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/[0.08] text-xs font-semibold text-cyan-400 mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          Powered by Gemini AI & Supabase
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none max-w-5xl mb-6 animate-fade-up delay-100">
          Your Personal Placement <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500">Command Center</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed animate-fade-up delay-200">
          The ultimate career guidance platform for college freshers and professionals. Hardened with 50+ features covering AI advising, interactive interview coaching, roadmaps, and portfolio builder.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up delay-300">
          <button
            onClick={() => navigate(session ? '/dashboard' : '/login?signup=true')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:brightness-110 shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            Get Started Free
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-gray-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
          >
            Explore Features
          </a>
        </div>

        {/* Floating Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mt-24 animate-fade-in delay-400">
          <div className="glass rounded-2xl p-5 border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-3xl md:text-4xl font-extrabold text-cyan-400">50+</h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">Platform Features</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-3xl md:text-4xl font-extrabold text-blue-400">200+</h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">Interview Questions</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-3xl md:text-4xl font-extrabold text-violet-400">100+</h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">Curated Skills</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-3xl md:text-4xl font-extrabold text-emerald-400">100%</h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">Secure & Free</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Engineered for Placement Success
          </h2>
          <p className="text-gray-400 mt-3">
            Every module is tailored to boost your profile, clear tech rounds, and land your dream job offer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <TiltCard key={idx} className="h-full flex flex-col justify-between cursor-default">
              <div>
                <span className="text-3xl mb-4 block">{feat.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{feat.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] text-cyan-400 border border-white/[0.06]">
                  {feat.badge}
                </span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 px-6 py-24 bg-white/[0.01] border-y border-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
            <p className="text-gray-400 mt-3">Follow our structured path to scale from a fresher to hired.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Animated line (only for md and larger) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-cyan-500/20 via-blue-500/40 to-violet-500/20 z-0" />

            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#020617] border-2 border-cyan-500/40 flex items-center justify-center text-2xl font-black text-cyan-400 shadow-xl shadow-cyan-500/10 mb-6 transition-all duration-300 hover:border-cyan-400 hover:scale-105">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 max-w-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Guides / Curated Hub */}
      <section id="video-guides" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Curated Guide Video Links</h2>
          <p className="text-gray-400 mt-3">Watch highly recommended, handpicked tutorials from tech creators.</p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('freshers')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'freshers'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
                : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            Freshers Placement Guides
          </button>
          <button
            onClick={() => setActiveTab('experienced')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'experienced'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
                : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            Experienced & Career Switch
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {videos[activeTab].map((vid, idx) => (
            <div key={idx} className="glass border border-white/[0.06] rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-200 flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold inline-block mb-3">
                  YouTube
                </span>
                <h3 className="font-bold text-white text-base leading-snug mb-2">{vid.title}</h3>
                <p className="text-xs text-gray-400">Creator: {vid.channel}</p>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="text-xs text-gray-500">{vid.duration}</span>
                <a
                  href={vid.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  Watch Video
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto text-center">
        <div className="glass-strong rounded-3xl p-10 md:p-16 border border-white/[0.08] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-blue-500/5 to-violet-500/5 pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Get instant access to AI tools, templates, roadmaps, and custom guidelines. Hardened, secured, and ready for you.
          </p>
          <button
            onClick={() => navigate(session ? '/dashboard' : '/login?signup=true')}
            className="px-8 py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#090d1f]/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">AI CAREER OS</span>
          </div>
          
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} AI Career OS. Built for Placement Excellence.
          </p>
        </div>
      </footer>
    </div>
  )
}
