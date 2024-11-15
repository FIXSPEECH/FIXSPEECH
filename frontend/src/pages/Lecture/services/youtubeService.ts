import axios from "axios";
import { METRIC_SEARCH_TERMS } from "../constants/metricSearchTerms";
import type { RecentAnalysis } from "../types/lecture";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

// 캐시 구현
const searchCache = new Map<string, any>();
const CACHE_DURATION = 1000 * 60 * 60; // 1시간

interface SearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { high: { url: string } };
    channelTitle: string;
    publishedAt: string;
  };
}

export const searchYoutubeVideos = async (
  analysis: Partial<RecentAnalysis>
) => {
  try {
    let searchQueries: string[] = [];

    // 분석 결과에서 "poor" 등급의 메트릭을 찾아 관련 검색어 추가
    Object.entries(analysis.metrics || {}).forEach(([metric, data]) => {
      if (data.grade === "poor" && METRIC_SEARCH_TERMS[metric]) {
        // 각 메트릭당 하나의 랜덤 검색어만 선택
        const randomIndex = Math.floor(
          Math.random() * METRIC_SEARCH_TERMS[metric].length
        );
        searchQueries.push(METRIC_SEARCH_TERMS[metric][randomIndex]);
      }
    });

    // 검색어가 없으면 기본 검색어 사용
    if (searchQueries.length === 0) {
      searchQueries = ["말하기 개선 방법", "스피치 훈련"];
    }

    // 중복 제거
    searchQueries = [...new Set(searchQueries)];

    const results = await Promise.all(
      searchQueries.map(async (query) => {
        // 캐시 확인
        const cacheKey = `youtube_${query}`;
        const cachedResult = searchCache.get(cacheKey);

        if (
          cachedResult &&
          cachedResult.timestamp > Date.now() - CACHE_DURATION
        ) {
          return cachedResult.data;
        }

        try {
          const response = await axios.get(YOUTUBE_API_URL, {
            params: {
              part: "snippet",
              maxResults: 2, // 각 쿼리당 결과 수 제한
              q: `${query} 강의`,
              type: "video",
              key: YOUTUBE_API_KEY,
              relevanceLanguage: "ko",
              videoEmbeddable: true,
              videoDuration: "medium",
            },
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          const videos = response.data.items.map((item: SearchResult) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            searchTerm: query,
          }));

          // 결과 캐싱
          searchCache.set(cacheKey, {
            timestamp: Date.now(),
            data: videos,
          });

          return videos;
        } catch (error) {
          console.error(`검색어 "${query}" 처리 중 오류:`, error);
          return []; // 개별 쿼리 실패 시 빈 배열 반환
        }
      })
    );

    // 결과 병합 및 중복 제거
    const allVideos = results.flat();
    const uniqueVideos = Array.from(
      new Map(allVideos.map((video) => [video.id, video])).values()
    );

    // 최신순 정렬
    return uniqueVideos.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error("YouTube API 호출 실패:", error);

    // 폴백 데이터 반환
    return [
      {
        id: "sample1",
        title: "죄송합니다. 일시적으로 동영상을 불러올 수 없습니다.",
        thumbnail: "/fallback-thumbnail.jpg",
        channelTitle: "System",
        publishedAt: new Date().toISOString(),
        searchTerm: "error",
      },
    ];
  }
};
