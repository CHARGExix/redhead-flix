import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const localTmdbProxy = (apiKey) => ({
  name: 'local-tmdb-key-proxy',
  configureServer(server) {
    server.middlewares.use('/api/tmdb', async (request, response) => {
      if (request.method !== 'GET') {
        response.statusCode = 405
        response.end('Method not allowed')
        return
      }
      if (!apiKey) {
        response.statusCode = 503
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'TMDB_API_KEY is missing from .env.local' }))
        return
      }

      try {
        const requestUrl = new URL(request.url || '/', 'http://localhost')
        const upstreamUrl = new URL(requestUrl.pathname.replace(/^\/+/, ''), 'https://api.themoviedb.org/3/')
        requestUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value))
        upstreamUrl.searchParams.set('api_key', apiKey)

        const upstream = await fetch(upstreamUrl)
        response.statusCode = upstream.status
        response.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
        response.end(Buffer.from(await upstream.arrayBuffer()))
      } catch {
        response.statusCode = 502
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'TMDB request failed' }))
      }
    })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      localTmdbProxy(env.TMDB_API_KEY),
    ],
    server: {
      host: true,
    },
  }
})
