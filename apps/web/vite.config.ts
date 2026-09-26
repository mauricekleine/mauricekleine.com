import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { readdirSync } from 'node:fs'

const essayPaths = readdirSync(new URL('./content/essays/', import.meta.url))
  .filter((name) => name.endsWith('.md'))
  .map((name) => `/essays/${name.slice(0, -3)}`)

export default defineConfig({
  plugins: [
    cloudflare({ configPath: '../../wrangler.jsonc', viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages: [
        { path: '/', prerender: { enabled: true } },
        { path: '/about', prerender: { enabled: true } },
        { path: '/essays', prerender: { enabled: true } },
        { path: '/404', prerender: { enabled: true } },
        ...essayPaths.map((path) => ({ path, prerender: { enabled: true } })),
      ],
    }),
    react(),
  ],
})
