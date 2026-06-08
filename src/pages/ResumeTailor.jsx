import { useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, inputClass, primaryButtonClass } from '../components/ui'
import { useToast } from '../context/ToastContext'

export default function ResumeTailor() {
  const toast = useToast()
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('bullets')

  const [bullets, setBullets] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [outreach, setOutreach] = useState('')

  const handleGenerate = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.warning('Please provide both your resume details and the target Job Description.')
      return
    }

    setLoading(true)
    try {
      const prompt = `You are a professional ATS resume writer and job search coach. Analyze the following Resume and Job Description.
Resume:
${resumeText}

Job Description:
${jobDescription}

Generate three distinct customized sections:
1. [TAILORED BULLETS]: Provide 4 high-impact, action-oriented, keyword-rich resume bullet points tailored to this job description. Include active verbs and metric placeholders (e.g. "[X]%").
2. [COVER LETTER]: Write a compelling, concise cover letter (under 250 words) customized for this company and role.
3. [COLD OUTREACH]: Write a short, high-conversion LinkedIn connection note or cold email (under 100 words) targeting a hiring manager.

Ensure you start each section with the exact headers: [TAILORED BULLETS], [COVER LETTER], and [COLD OUTREACH].`

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ]
        })
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error?.message || data.error || 'Failed to generate')

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // Parse output
      const bulletsPart = responseText.match(/\[TAILORED BULLETS\]([\s\S]*?)(?=\[COVER LETTER\]|$)/i)?.[1]?.trim() || ''
      const coverPart = responseText.match(/\[COVER LETTER\]([\s\S]*?)(?=\[COLD OUTREACH\]|$)/i)?.[1]?.trim() || ''
      const outreachPart = responseText.match(/\[COLD OUTREACH\]([\s\S]*?)$/i)?.[1]?.trim() || ''

      setBullets(bulletsPart || responseText)
      setCoverLetter(coverPart || 'Error generating cover letter. Try again.')
      setOutreach(outreachPart || 'Error generating outreach draft. Try again.')
      
      toast.success('AI tailored your profile successfully! Check the results.')
    } catch (err) {
      toast.error('Generation failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <AppShell title="AI Resume Tailoring Studio" subtitle="Tailor your resume bullet points for ATS systems, write cover letters, and generate cold recruiter outreach templates in seconds.">
      <div className="grid gap-6 lg:grid-cols-2 max-w-6xl mx-auto animate-fade-up">
        {/* Input Panel */}
        <div className="space-y-4">
          <Panel>
            <h2 className="text-base font-bold text-white mb-4">Input Profile & Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Your Resume Details</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your current resume content, experience history, and skills list here..."
                  className={`${inputClass} !h-44 text-xs resize-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Target Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target Job Description, requirements, and company description here..."
                  className={`${inputClass} !h-44 text-xs resize-none`}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`${primaryButtonClass} w-full py-3.5 mt-2 cursor-pointer flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Optimizing Profile...
                  </>
                ) : (
                  <>🪄 Generate AI Tailoring</>
                )}
              </button>
            </div>
          </Panel>
        </div>

        {/* Results Panel */}
        <div>
          <div className="flex bg-[#020617] rounded-t-2xl border-t border-x border-white/[0.06] overflow-hidden">
            {['bullets', 'cover', 'outreach'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-cyan-400 text-white bg-white/[0.03]'
                    : 'border-white/[0.06] text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'bullets' ? 'ATS Bullets' : tab === 'cover' ? 'Cover Letter' : 'Cold Outreach'}
              </button>
            ))}
          </div>

          <div className="glass rounded-b-2xl border-b border-x border-white/[0.06] p-6 min-h-[420px] flex flex-col justify-between">
            <div className="overflow-y-auto max-h-[380px] pr-2">
              {activeTab === 'bullets' && (
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">ATS-Tailored Bullet Points</h3>
                  {bullets ? (
                    <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line space-y-2">
                      {bullets}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-12 text-center">Your optimized bullet points will appear here. Fill out the fields and click Generate.</p>
                  )}
                </div>
              )}

              {activeTab === 'cover' && (
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">Tailored Cover Letter</h3>
                  {coverLetter ? (
                    <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                      {coverLetter}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-12 text-center">Your custom cover letter will appear here. Fill out the fields and click Generate.</p>
                  )}
                </div>
              )}

              {activeTab === 'outreach' && (
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">LinkedIn / Cold Outreach Draft</h3>
                  {outreach ? (
                    <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                      {outreach}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-12 text-center">Your recruiter outreach template will appear here. Fill out the fields and click Generate.</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {((activeTab === 'bullets' && bullets) ||
              (activeTab === 'cover' && coverLetter) ||
              (activeTab === 'outreach' && outreach)) && (
              <div className="border-t border-white/[0.06] pt-4 mt-6 flex justify-end">
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeTab === 'bullets' ? bullets : activeTab === 'cover' ? coverLetter : outreach
                    )
                  }
                  className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2 text-xs font-bold text-gray-300 transition hover:bg-white/[0.08] hover:border-white/[0.15] cursor-pointer"
                >
                  📋 Copy Content
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
