import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BILLING_API = process.env.BILLING_API ?? 'https://multi-tenant-billing-app.duckdns.org'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/billing': { target: BILLING_API, changeOrigin: true },
    },
  },
})
