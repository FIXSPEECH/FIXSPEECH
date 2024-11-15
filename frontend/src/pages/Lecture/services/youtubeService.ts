import axios from "axios";
import { METRIC_SEARCH_TERMS } from "../constants/metricSearchTerms";
import type { RecentAnalysis } from "../types/lecture";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";
const CACHE_KEY = "youtube_search_cache";
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2시간

interface CacheData {
  timestamp: number;
  data: Record<string, VideoData[]>;
}

interface VideoData {
  id: string;
  title: string;
}

// 로컬 스토리지에서 캐시 관리
const getCache = (): CacheData | null => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const parsedCache = JSON.parse(cached) as CacheData;
  if (Date.now() - parsedCache.timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return parsedCache;
};

const setCache = (metric: string, videos: VideoData[]) => {
  const existingCache = getCache();
  const newCache: CacheData = {
    timestamp: Date.now(),
    data: {
      ...(existingCache?.data || {}),
      [metric]: videos,
    },
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
};

export const searchYoutubeVideos = async (
  analysis: Partial<RecentAnalysis>
) => {
  try {
    const cache = getCache();
    const poorMetrics = Object.entries(analysis.metrics || {}).filter(
      ([_, data]) => data.grade === "poor"
    );

    if (poorMetrics.length === 0) return [];

    const results: VideoData[] = [];

    for (const [metric, _] of poorMetrics) {
      // 캐시 확인
      if (cache?.data[metric]) {
        results.push(...cache.data[metric]);
        continue;
      }

      const searchTerms = METRIC_SEARCH_TERMS[metric];
      if (!searchTerms) continue;

      // 랜덤하게 검색어 1개 선택
      const searchTerm =
        searchTerms[Math.floor(Math.random() * searchTerms.length)];

      try {
        const response = await axios.get(YOUTUBE_API_URL, {
          params: {
            part: "snippet",
            maxResults: 2, // 메트릭당 2개만 요청
            q: `${searchTerm} 강의`,
            type: "video",
            key: YOUTUBE_API_KEY,
            relevanceLanguage: "ko",
            fields: "items(id/videoId,snippet/title)", // 필요한 필드만 요청
          },
        });

        const videos = response.data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
        }));

        // 캐시 저장
        setCache(metric, videos);
        results.push(...videos);
      } catch (error) {
        console.error(`검색어 "${searchTerm}" 처리 중 오류:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error("YouTube API 호출 실패:", error);
    return [
      {
        id: "sample1",
        title: "죄송합니다. 일시적으로 동영상을 불러올 수 없습니다.",
      },
    ];
  }
};
