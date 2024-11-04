import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "tailwindcss";
// import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "FIXSPEECH 픽스피치",
        short_name: "FIXSPEECH",
        description: "나만의 목소리 트레이너 픽스피치입니다",
        theme_color: "#000000",
        icons: [
          {
            src: "icons/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // Service Worker 설정
      workbox: {
        navigateFallback: "/index.html",
        // API 요청을 네트워크 우선으로 처리
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // API 요청 경로는 React Router에서 제외
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],

  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
