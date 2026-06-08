import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function LandingPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  const startJourney = () => {
    navigate(session ? '/dashboard' : '/login')
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0b1c2b] text-white overflow-hidden flex flex-col justify-between">
      {/* Fullscreen Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

      {/* Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')} 
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-3xl font-bold tracking-tight text-white cursor-pointer select-none"
        >
          AI Career OS
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button onClick={() => navigate('/')} className="text-white transition-colors cursor-pointer">
            Home
          </button>
          <button onClick={startJourney} className="text-[#a3a3a3] hover:text-white transition-colors cursor-pointer">
            Studio
          </button>
          <button onClick={startJourney} className="text-[#a3a3a3] hover:text-white transition-colors cursor-pointer">
            About
          </button>
          <button onClick={startJourney} className="text-[#a3a3a3] hover:text-white transition-colors cursor-pointer">
            Journal
          </button>
          <button onClick={startJourney} className="text-[#a3a3a3] hover:text-white transition-colors cursor-pointer">
            Reach Us
          </button>
        </nav>

        {/* CTA Button */}
        <div>
          <button
            onClick={startJourney}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            Begin Journey
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 md:py-[90px]">
        {/* Animated Heading */}
        <h1
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-5xl sm:text-7xl md:text-8xl font-normal leading-[0.95] tracking-[-2.46px] max-w-7xl text-white animate-fade-rise"
        >
          Where <em className="not-italic text-[#a3a3a3]">dreams</em> rise <br className="hidden sm:inline" />
          <em className="not-italic text-[#a3a3a3]">through the silence.</em>
        </h1>

        {/* Animated Subtext */}
        <p className="text-[#a3a3a3] text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. 
          Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        {/* Animated CTA Button */}
        <button
          onClick={startJourney}
          className="liquid-glass rounded-full px-14 py-5 text-base font-medium text-white mt-12 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer animate-fade-rise-delay-2"
        >
          Begin Journey
        </button>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#a3a3a3] gap-4">
        <p>&copy; {new Date().getFullYear()} AI Career OS. All rights reserved.</p>
        <p className="tracking-widest uppercase font-semibold">Cinematic Digital Platform</p>
      </footer>
    </div>
  )
}
