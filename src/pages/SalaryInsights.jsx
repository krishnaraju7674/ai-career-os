import { useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge } from '../components/ui'

export default function SalaryInsights() {
  const [selectedCity, setSelectedCity] = useState('bangalore')

  const salaries = [
    { role: "Frontend Developer", fresher: 6.5, exp2: 12.0, exp5: 22.0, top: "Google, Razorpay, Uber" },
    { role: "Backend Developer", fresher: 7.0, exp2: 13.5, exp5: 25.0, top: "Amazon, Microsoft, PhonePe" },
    { role: "Full Stack Engineer", fresher: 7.5, exp2: 15.0, exp5: 28.0, top: "Flipkart, CRED, Razorpay" },
    { role: "DevOps & Cloud Engineer", fresher: 6.8, exp2: 13.0, exp5: 24.0, top: "Netflix, AWS, Accenture" },
    { role: "Data Analyst", fresher: 5.5, exp2: 10.0, exp5: 18.0, top: "MuSigma, Fractal, Flipkart" },
    { role: "ML / Data Scientist", fresher: 8.5, exp2: 16.5, exp5: 32.0, top: "Adobe, NVIDIA, Google" },
    { role: "Mobile App Developer", fresher: 6.0, exp2: 11.5, exp5: 20.0, top: "Swiggy, Zomato, Uber" },
    { role: "QA Automation Engineer", fresher: 5.0, exp2: 8.5, exp5: 15.0, top: "TCS, Wipro, Infosys" },
    { role: "Salesforce Developer", fresher: 5.2, exp2: 9.0, exp5: 16.5, top: "Salesforce, PwC, Deloitte" }
  ]

  const cityMultipliers = {
    bangalore: 1.0,      // Baseline
    hyderabad: 0.92,
    pune: 0.88,
    delhi: 0.95,
    chennai: 0.85
  }

  const getSalary = (base) => {
    return (base * cityMultipliers[selectedCity]).toFixed(1)
  }

  return (
    <AppShell>
      <div className="relative max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1.5 rounded-full glass border border-white/[0.08]">
              Role-Based Salary Data
            </span>
            <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight">Salary & CTC Insights</h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Compare average starting packages and mid-level salary progression in major Indian tech hubs (in LPA).
            </p>
          </div>

          {/* City Selection */}
          <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.06] p-1.5 rounded-2xl">
            <span className="text-xs font-semibold text-gray-500 pl-3">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-900 text-white border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="bangalore">Bangalore (Baseline)</option>
              <option value="hyderabad">Hyderabad (92%)</option>
              <option value="delhi">Delhi/NCR (95%)</option>
              <option value="pune">Pune (88%)</option>
              <option value="chennai">Chennai (85%)</option>
            </select>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/15 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-white text-lg">Real Market Salary Trends</h3>
            <p className="text-sm text-cyan-300 mt-1 max-w-2xl leading-relaxed">
              These CTC bands represent base packages, bonuses, and standard stock grants for product/service developers in India. Salaries are adjusted based on city standards.
            </p>
          </div>
          <div className="text-center font-mono text-xs text-gray-400 whitespace-nowrap bg-white/[0.03] px-3.5 py-2 rounded-xl border border-white/[0.06]">
            Updated: June 2026
          </div>
        </div>

        {/* Cards / Visual Chart Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salaries.map((sal, idx) => {
            const fresherCtc = parseFloat(getSalary(sal.fresher))
            const exp2Ctc = parseFloat(getSalary(sal.exp2))
            const exp5Ctc = parseFloat(getSalary(sal.exp5))
            
            // Calculate width percentages for SVG rendering (highest is 35 LPA approx)
            const getWidth = (val) => `${Math.min(100, (val / 35) * 100)}%`

            return (
              <Card3D key={idx} className="flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex justify-between items-center">
                    <span>{sal.role}</span>
                    <span className="text-xs font-mono text-cyan-400">LPA</span>
                  </h3>

                  {/* Pure CSS Bar Graph */}
                  <div className="space-y-4">
                    {/* Fresher */}
                    <div>
                      <div className="flex justify-between text-xs font-medium text-gray-400 mb-1">
                        <span>Fresher</span>
                        <span className="text-white font-bold">{fresherCtc} LPA</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: getWidth(fresherCtc) }} />
                      </div>
                    </div>

                    {/* 2 Years Exp */}
                    <div>
                      <div className="flex justify-between text-xs font-medium text-gray-400 mb-1">
                        <span>2 Years Exp</span>
                        <span className="text-white font-bold">{exp2Ctc} LPA</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: getWidth(exp2Ctc) }} />
                      </div>
                    </div>

                    {/* 5 Years Exp */}
                    <div>
                      <div className="flex justify-between text-xs font-medium text-gray-400 mb-1">
                        <span>5 Years Exp</span>
                        <span className="text-white font-bold">{exp5Ctc} LPA</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className="bg-violet-500 h-full rounded-full transition-all duration-300" style={{ width: getWidth(exp5Ctc) }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.05]">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Top Hiring Companies:</h4>
                  <p className="text-xs text-gray-300 font-medium">{sal.top}</p>
                </div>
              </Card3D>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
