import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 2000, // Just increase the limit and let Vite handle chunks automatically
    },
    server: {
      port: 5176,
      configureServer(server) {
        server.middlewares.use('/api/gemini', async (req, res) => {
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            res.statusCode = 200
            return res.end()
          }

          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')

          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const { modelId = 'gemini-1.5-flash', contents } = JSON.parse(body)
              const key = env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
              if (!key) {
                res.statusCode = 500
                return res.end(JSON.stringify({ error: 'GEMINI_API_KEY not found in local environment' }))
              }
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`
              const r = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  contents, 
                  generationConfig: { 
                    temperature: 0.7, 
                    maxOutputTokens: 800 
                  } 
                })
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
