import { defineConfig } from 'vite'

export default defineConfig({
  // This ensures assets load correctly on https://username.github.io/repo-name/
  base: './', 
  publicDir: 'public',
  build: {
    outDir: 'dist',
  }
})
