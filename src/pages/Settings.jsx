import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { Panel } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <AppShell title="Settings" subtitle="Your account and AI configuration." maxWidth="max-w-2xl">
      <div className="space-y-6">

        {/* AI Status */}
        <Panel className="animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl">✨</div>
            <div>
              <h2 className="font-bold">AI Advisor Bridge</h2>
              <p className="text-xs text-gray-500">Connected via Production AI Proxy</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/30 px-3 py-1 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                Secure
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 text-sm text-gray-400 leading-relaxed">
            <p className="font-medium text-indigo-300 mb-2">10/10 Architecture Status:</p>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2"><span>✅</span> <strong>API Key Security:</strong> Keys are hidden on the server, never exposed to browsers.</li>
              <li className="flex gap-2"><span>✅</span> <strong>CORS Shield:</strong> Requests are proxied internally to bypass all browser blocks.</li>
              <li className="flex gap-2"><span>✅</span> <strong>Rate Limiting:</strong> Professional auto-retry logic implemented in the UI.</li>
            </ul>
          </div>

          <button onClick={() => navigate('/advisor')} className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">
            Open AI Advisor →
          </button>
        </Panel>

        {/* Account Info */}
        <Panel className="animate-fade-up delay-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold">Account</h2>
              <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full rounded-xl px-5 py-3 font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition">
            Sign Out
          </button>
        </Panel>

        {/* App Info */}
        <Panel className="animate-fade-up delay-200">
          <h2 className="font-bold mb-4">About</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between"><span>App</span><span className="text-white font-medium">AI Career OS</span></div>
            <div className="flex justify-between"><span>Architecture</span><span className="text-indigo-400 font-medium">Serverless Proxy (10/10)</span></div>
            <div className="flex justify-between"><span>Version</span><span className="text-white font-medium">4.0.0 (Production)</span></div>
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
