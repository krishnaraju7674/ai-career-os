import { useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge } from '../components/ui'

export default function Certifications() {
  const [costFilter, setCostFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  const certifications = [
    { name: "AWS Certified Solutions Architect - Associate", provider: "Amazon Web Services", role: "devops", cost: "Paid", difficulty: "Intermediate", duration: "2 months", link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
    { name: "Google Cloud Digital Leader", provider: "Google", role: "devops", cost: "Paid", difficulty: "Beginner", duration: "3 weeks", link: "https://cloud.google.com/learn/certification/cloud-digital-leader" },
    { name: "Meta React Developer Professional Certificate", provider: "Meta (Coursera)", role: "frontend", cost: "Paid", difficulty: "Beginner", duration: "3 months", link: "https://www.coursera.org/professional-certificates/meta-front-end-developer" },
    { name: "HackerRank React Skill Certification", provider: "HackerRank", role: "frontend", cost: "Free", difficulty: "Intermediate", duration: "1 hour", link: "https://www.hackerrank.com/skills-verification/react" },
    { name: "freeCodeCamp Responsive Web Design Certificate", provider: "freeCodeCamp", role: "frontend", cost: "Free", difficulty: "Beginner", duration: "1 month", link: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
    { name: "MongoDB Associate Developer Exam", provider: "MongoDB", role: "backend", cost: "Paid", difficulty: "Intermediate", duration: "1 month", link: "https://university.mongodb.com/certification" },
    { name: "NodeJS Developer Certificate by OpenJS", provider: "Linux Foundation", role: "backend", cost: "Paid", difficulty: "Advanced", duration: "2 months", link: "https://training.linuxfoundation.org/certification/jsnad/" },
    { name: "HackerRank SQL Skill Certification", provider: "HackerRank", role: "backend", cost: "Free", difficulty: "Intermediate", duration: "1 hour", link: "https://www.hackerrank.com/skills-verification/sql_basic" },
    { name: "Google Data Analytics Professional Certificate", provider: "Google (Coursera)", role: "dataanalyst", cost: "Paid", difficulty: "Beginner", duration: "4 months", link: "https://www.coursera.org/professional-certificates/google-data-analytics" },
    { name: "Kaggle Machine Learning Course Certificate", provider: "Kaggle", role: "dataanalyst", cost: "Free", difficulty: "Intermediate", duration: "2 weeks", link: "https://www.kaggle.com/learn/intro-to-machine-learning" },
    { name: "TensorFlow Developer Certificate", provider: "Google", role: "dataanalyst", cost: "Paid", difficulty: "Advanced", duration: "3 months", link: "https://www.tensorflow.org/certificate" }
  ]

  const filtered = certifications.filter(cert => {
    const matchesCost = costFilter === 'all' || cert.cost.toLowerCase() === costFilter
    const matchesRole = roleFilter === 'all' || cert.role === roleFilter
    return matchesCost && matchesRole
  })

  return (
    <AppShell>
      <div className="relative max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1.5 rounded-full glass border border-white/[0.08]">
            Industry Recognition
          </span>
          <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight">Recommended Certifications</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Level up your resume with globally recognized, handpicked certification courses for various specializations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          {/* Role Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                roleFilter === 'all' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter('frontend')}
              className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                roleFilter === 'frontend' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]'
              }`}
            >
              Frontend
            </button>
            <button
              onClick={() => setRoleFilter('backend')}
              className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                roleFilter === 'backend' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]'
              }`}
            >
              Backend
            </button>
            <button
              onClick={() => setRoleFilter('devops')}
              className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                roleFilter === 'devops' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]'
              }`}
            >
              DevOps
            </button>
            <button
              onClick={() => setRoleFilter('dataanalyst')}
              className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                roleFilter === 'dataanalyst' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]'
              }`}
            >
              Data Science/ML
            </button>
          </div>

          {/* Cost Filter */}
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] p-1.5 rounded-2xl">
            <button
              onClick={() => setCostFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                costFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCostFilter('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                costFilter === 'free' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setCostFilter('paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                costFilter === 'paid' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              Paid
            </button>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cert, idx) => (
            <Card3D key={idx} className="flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors">
                    {cert.name}
                  </h3>
                  <StatusBadge tone={cert.cost === 'Free' ? 'emerald' : 'cyan'}>
                    {cert.cost}
                  </StatusBadge>
                </div>

                <p className="text-xs text-gray-400 font-medium">Provider: {cert.provider}</p>
                
                <div className="mt-6 flex gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Difficulty</span>
                    <span className="text-xs font-semibold text-white">{cert.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Duration</span>
                    <span className="text-xs font-semibold text-white">{cert.duration}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.05]">
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-cyan-400 hover:text-cyan-300 border border-white/[0.06] transition-all flex items-center justify-center gap-1.5"
                >
                  View Certification Program
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
