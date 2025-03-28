import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import { getColorModeScript } from "@yamada-ui/react"

function injectScript(): Plugin {
  return {
    name: "vite-plugin-inject-scripts",
    transformIndexHtml(html) {
      const content = getColorModeScript({
        initialColorMode: "system",
      })

      return html.replace("<body>", `<body><script>${content}</script>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? 'REPOSITORY_NAME' : './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png'],
      injectRegister: 'auto',
      manifest: {
        name: 'ポケポケ最適化',
        short_name: 'ポケポケ最適化',
        description: 'ポケポケの「パック開封ポイント」と「トレードメダル」の使い分けを最適化',
        theme_color: '#141414',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    }),
    injectScript(),
  ],
  server: { host: true },
})
