import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const backendEnvDirectory = fileURLToPath(new URL('../backend', import.meta.url))
const localDevelopmentToken = 'local-task-manager-token-change-me-32'

export default defineConfig(({ mode }) => {
  const backendEnv = loadEnv(mode, backendEnvDirectory, '')
  const apiToken = backendEnv.API_TOKEN || localDevelopmentToken

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendEnv.API_URL || 'http://localhost:5000',
          changeOrigin: true,
          configure(proxy) {
            proxy.on('proxyReq', (proxyRequest) => {
              proxyRequest.setHeader('Authorization', `Bearer ${apiToken}`)
            })
          },
        },
      },
    },
  }
})
