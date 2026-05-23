import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Inspector from "interactive-react-inspector"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Inspector.vite(),
    react()
  ],
})
