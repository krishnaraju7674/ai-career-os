import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'

// Existing pages
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Skills from './pages/Skills'
import Readiness from './pages/Readiness'
import Resume from './pages/Resume'
import Planner from './pages/Planner'
import Applications from './pages/Applications'
import Interview from './pages/Interview'
import Advisor from './pages/Advisor'
import JDAnalyzer from './pages/JDAnalyzer'
import Habits from './pages/Habits'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// New pages (Mega Upgrade)
import LandingPage from './pages/LandingPage'
import Roadmaps from './pages/Roadmaps'
import VideoHub from './pages/VideoHub'
import CompanyPrep from './pages/CompanyPrep'
import SalaryInsights from './pages/SalaryInsights'
import Certifications from './pages/Certifications'
import ResourceLibrary from './pages/ResourceLibrary'
import MockInterviewer from './pages/MockInterviewer'
import AptitudePractice from './pages/AptitudePractice'
import Pomodoro from './pages/Pomodoro'
import Goals from './pages/Goals'
import Journal from './pages/Journal'
import Achievements from './pages/Achievements'
import ResumeTailor from './pages/ResumeTailor'
import SkillTree from './pages/SkillTree'
import TestSimulator from './pages/TestSimulator'
import CodingSandbox from './pages/CodingSandbox'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse shadow-2xl shadow-cyan-500/30">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 animate-pulse">Loading AI Career OS...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return null
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      {/* Private Routes */}
      <Route path="/onboarding"     element={<PrivateRoute><Onboarding /></PrivateRoute>} />
      <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/skills"         element={<PrivateRoute><Skills /></PrivateRoute>} />
      <Route path="/readiness"      element={<PrivateRoute><Readiness /></PrivateRoute>} />
      <Route path="/resume"         element={<PrivateRoute><Resume /></PrivateRoute>} />
      <Route path="/planner"        element={<PrivateRoute><Planner /></PrivateRoute>} />
      <Route path="/applications"   element={<PrivateRoute><Applications /></PrivateRoute>} />
      <Route path="/interview"      element={<PrivateRoute><Interview /></PrivateRoute>} />
      <Route path="/advisor"        element={<PrivateRoute><Advisor /></PrivateRoute>} />
      <Route path="/jd-analyzer"    element={<PrivateRoute><JDAnalyzer /></PrivateRoute>} />
      <Route path="/habits"         element={<PrivateRoute><Habits /></PrivateRoute>} />
      <Route path="/settings"       element={<PrivateRoute><Settings /></PrivateRoute>} />
      
      {/* New private routes for mega upgrade */}
      <Route path="/roadmaps"        element={<PrivateRoute><Roadmaps /></PrivateRoute>} />
      <Route path="/videos"          element={<PrivateRoute><VideoHub /></PrivateRoute>} />
      <Route path="/company-prep"    element={<PrivateRoute><CompanyPrep /></PrivateRoute>} />
      <Route path="/salary-insights" element={<PrivateRoute><SalaryInsights /></PrivateRoute>} />
      <Route path="/certifications"  element={<PrivateRoute><Certifications /></PrivateRoute>} />
      <Route path="/resources"       element={<PrivateRoute><ResourceLibrary /></PrivateRoute>} />
      <Route path="/mock-interview"  element={<PrivateRoute><MockInterviewer /></PrivateRoute>} />
      <Route path="/aptitude"        element={<PrivateRoute><AptitudePractice /></PrivateRoute>} />
      <Route path="/pomodoro"        element={<PrivateRoute><Pomodoro /></PrivateRoute>} />
      <Route path="/goals"           element={<PrivateRoute><Goals /></PrivateRoute>} />
      <Route path="/journal"         element={<PrivateRoute><Journal /></PrivateRoute>} />
      <Route path="/achievements"    element={<PrivateRoute><Achievements /></PrivateRoute>} />
      <Route path="/resume-tailor"   element={<PrivateRoute><ResumeTailor /></PrivateRoute>} />
      <Route path="/skill-tree"      element={<PrivateRoute><SkillTree /></PrivateRoute>} />
      <Route path="/test-simulator"  element={<PrivateRoute><TestSimulator /></PrivateRoute>} />
      <Route path="/code-sandbox"    element={<PrivateRoute><CodingSandbox /></PrivateRoute>} />

      {/* 404 Catch All */}
      <Route path="*"               element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
