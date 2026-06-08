import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled exception:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 overflow-hidden relative">
          {/* Background orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
          </div>

          <div className="relative w-full max-w-md text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg shadow-red-500/10">
              ⚠️
            </div>
            
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-pink-500 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
              An unexpected client-side error crashed the current view. Don't worry, we caught it.
            </p>

            <div className="glass-strong border border-white/[0.08] p-4 rounded-2xl mb-8 text-left max-h-40 overflow-y-auto font-mono text-xs text-red-300">
              {this.state.error?.toString() || "Unknown rendering exception"}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:brightness-110 text-white shadow-lg shadow-cyan-500/15 transition-all active:scale-[0.98] cursor-pointer"
              >
                Reload Application 🔄
              </button>
              <a
                href="/dashboard"
                className="px-5 py-3 rounded-xl font-bold text-xs bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.08] transition-all flex items-center justify-center"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
