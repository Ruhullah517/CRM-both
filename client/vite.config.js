import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {getServerUrl} from './src/config/urls';
// Centralized URL configuration
// const SERVER_URL =  'https://backendcrm.blackfostercarersalliance.co.uk';
const SERVER_URL = getServerUrl()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      '/uploads': SERVER_URL,
    },
  },
})
