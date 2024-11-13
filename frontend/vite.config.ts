import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "tailwindcss";

// Vite 프로젝트 설정
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // PWA 서비스 워커 자동 업데이트 설정
      includeAssets: ["favicon.ico", "apple-touch-icon.png"], // PWA에 포함될 정적 에셋
      manifest: {
        name: "FIXSPEECH 픽스피치", // 앱의 전체 이름
        short_name: "FIXSPEECH", // 앱의 짧은 이름
        description: "나만의 목소리 트레이너 픽스피치입니다", // 앱 설명
        theme_color: "#2C2C2E", // 테마 색상
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
            purpose: "maskable", // 다양한 디바이스 형태에 맞춰 조정 가능한 아이콘
          },
        ],
      },
      // Service Worker 상세 설정
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 캐시할 파일 최대 크기 설정
        navigateFallback: "/index.html", // SPA를 위한 폴백 페이지 설정
        // API 요청에 대한 캐싱 전략 설정
        runtimeCaching: [
          {
            // 스프링 부트 API 요청 처리
            urlPattern: /^https?:\/\/.*\/api\/.*/, // API 엔드포인트 패턴
            handler: "NetworkFirst", // 네트워크 우선 전략 사용
            options: {
              cacheName: "api-cache", // 캐시 저장소 이름
              networkTimeoutSeconds: 600, // 네트워크 타임아웃 시간 10분으로 설정
              cacheableResponse: {
                statuses: [0, 200], // 캐시할 HTTP 상태 코드
              },
            },
          },
          {
            // FastAPI 요청 처리
            urlPattern: /^https?:\/\/.*\/fastapi\/.*/, // FastAPI 엔드포인트 패턴
            handler: "NetworkFirst", // 네트워크 우선 전략 사용
            options: {
              cacheName: "fastapi-cache", // FastAPI 전용 캐시 저장소
              networkTimeoutSeconds: 600, // 네트워크 타임아웃 시간 10분으로 설정
              cacheableResponse: {
                statuses: [0, 200], // 캐시할 HTTP 상태 코드
              },
            },
          },
        ],
        // API 요청 경로는 navigateFallback에서 제외
        navigateFallbackDenylist: [/^\/api\//, /^\/fastapi\//],
      },
    }),
  ],

  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
