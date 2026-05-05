import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard')
    })
  }, [navigate])

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
    <div className="relative min-h-screen bg-[#030712] flex items-center justify-center px-4 overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="orb-1 absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="orb-2 absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/40 mb-4 animate-float">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black gradient-text">AI Career OS</h1>
          <p className="mt-2 text-sm text-gray-500">Your personal placement command center</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-1">{isSignup ? 'Create account' : 'Welcome back'}</h2>
          <p className="text-sm text-gray-500 mb-6">{isSignup ? 'Start your career journey today.' : 'Log in to your dashboard.'}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
                placeholder="you@example.com"
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-white placeholder-gray-600 outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                placeholder="••••••••"
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-white placeholder-gray-600 outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
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
            className="mt-6 w-full rounded-xl px-5 py-3.5 font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Please wait...
              </span>
            ) : isSignup ? 'Create Account' : 'Login'}
          </button>

          <p className="mt-5 text-center text-sm text-gray-500">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button onClick={() => { setIsSignup(!isSignup); setMessage('') }} className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">Powered by Supabase + Gemini AI</p>
      </div>
    </div>
  )
}
