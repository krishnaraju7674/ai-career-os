import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5176,
      // Local dev: intercept /api/gemini and proxy to Gemini directly
      // This mirrors exactly what the Vercel function does in production
      proxy: {
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            // Strip /api/gemini — the actual model path is sent in the request body
            // We redirect to a catch-all endpoint; body handling done via custom middleware below
            return path.replace('/api/gemini', '')
          },
        }
      },
      // Custom middleware to handle /api/gemini locally like the Vercel function would
      configureServer(server) {
        server.middlewares.use('/api/gemini', async (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const { modelId = 'gemini-1.5-flash', contents } = JSON.parse(body)
              const key = env.VITE_GEMINI_API_KEY
              if (!key) {
                res.statusCode = 500
                return res.end(JSON.stringify({ error: 'No GEMINI key in .env' }))
              }
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`
              const r = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 500 } })
              })
              const data = await r.json()
              res.statusCode = r.status
              res.end(JSON.stringify(data))
            } catch (e) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        })
      }
    }
  }
})
