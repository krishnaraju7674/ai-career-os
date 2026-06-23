import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { inputClass } from '../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get('signup') === 'true'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard')
    })
  }, [navigate])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) setMessage(error.message)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

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

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-white/[0.06]"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/[0.06]"></div>
          </div>

          <button
            onClick={handleGoogleLogin} disabled={loading}
            className="w-full rounded-full py-3.5 font-bold text-white bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 text-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
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
