// api/gemini.js — Vercel Serverless Function
// This runs on the SERVER, keeping your API key secret from the browser.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.GEMINI_API_KEY  // ← server env var, NEVER exposed to client
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not set on server.' })

  const { modelId = 'gemini-1.5-flash', contents } = req.body
  if (!contents) return res.status(400).json({ error: 'contents required' })

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`
    const gemRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
      })
    })
    const data = await gemRes.json()
    return res.status(gemRes.status).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
