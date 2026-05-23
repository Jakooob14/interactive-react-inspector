import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Inspector from "../../packages/unplugin/src"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Inspector.vite(),
    react()
  ],
})
