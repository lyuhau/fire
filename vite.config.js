import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fire/', // Change this to your repo name, or '/' if deploying to username.github.io
})
