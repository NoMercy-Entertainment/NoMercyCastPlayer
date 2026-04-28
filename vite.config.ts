import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'docs',
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'cast-sdk': ['@microsoft/signalr'],
          'video-player': ['@nomercy-entertainment/nomercy-video-player'],
          'hls': ['hls.js'],
        },
      },
    },
  },
  server: {
    open: true,
    port: 5501,
    allowedHosts: ['vscode.nomercy.tv', 'cast.nomercy.tv'],
  },
})
