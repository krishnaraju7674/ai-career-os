import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { inputClass } from '../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard')
    })
    
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('signup') === 'true') {
      setIsSignup(true)
    }
  }, [navigate, location])

  const handleAuth = async () => {
    if (!email || !password) { setMessage('Please fill in all fields.'); return }
    setLoading(true)
    setMessage('')
    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else if (data.user) navigate('/onboarding')
      else setMessage('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else navigate('/dashboard')
    }
    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleAuth() }

  return (
    <div className="relative min-h-screen bg-[#0b1c2b] flex items-center justify-center px-4 overflow-hidden">
      {/* Background orbs / minimal depths */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.01] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div 
            onClick={() => navigate('/')}
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-4xl tracking-tight text-white cursor-pointer select-none font-bold mb-2"
          >
            AI Career OS
          </div>
          <p className="text-xs text-[#a3a3a3] uppercase tracking-widest font-semibold">Cinematic Placement Platform</p>
        </div>

        {/* Card */}
        <div className="liquid-glass rounded-3xl p-8 border border-white/[0.08] shadow-2xl">
          <h2 className="text-xl font-bold mb-1 text-white">{isSignup ? 'Create account' : 'Welcome back'}</h2>
          <p className="text-sm text-gray-500 mb-6">{isSignup ? 'Start your career journey today.' : 'Log in to your dashboard.'}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm text-yellow-300 animate-fade-in">
              {message}
            </p>
          )}

          <button
            onClick={handleAuth} disabled={loading}
            className="mt-6 w-full rounded-full py-3.5 font-bold text-white liquid-glass hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Please wait...
              </span>
            ) : isSignup ? 'Create Account' : 'Login'}
          </button>

          <p className="mt-5 text-center text-sm text-gray-500 font-medium">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button onClick={() => { setIsSignup(!isSignup); setMessage('') }} className="text-white font-bold hover:underline transition cursor-pointer">
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-wider font-semibold">Powered by Supabase + Gemini AI</p>
      </div>
    </div>
  )
}
