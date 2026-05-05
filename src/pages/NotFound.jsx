import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="orb-1 absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="orb-2 absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative text-center animate-scale-in">
        <p className="text-8xl font-black gradient-text mb-4">404</p>
        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
          This page doesn't exist or was moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-xl px-6 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl px-6 py-3 font-semibold text-gray-300 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
