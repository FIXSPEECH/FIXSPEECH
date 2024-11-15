import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { useLectureStore } from "../../shared/stores/lectureStore";
import { LectureTabs } from "./components/LectureTabs";
import { parseAIResponse } from "./utils/aiResponseParser";
import type { RecentAnalysis, SectionData } from "./types/lecture";
import axiosInstance from "../../services/axiosInstance";
import { getAIRecommendations } from "./services/aiService";
import { searchYoutubeVideos } from "./services/youtubeService";
import axios from "axios";
import { METRIC_SEARCH_TERMS } from "./constants/metricSearchTerms";

interface ApiResponse {
  status: string;
  data: {
    analyzeResult: RecentAnalysis;
  };
}

// 메트릭별 커스텀 섹션 데이터
const CUSTOM_SECTIONS: Record<string, SectionData> = {
  "명료도(Clarity)": {
    title: "명료도 개선 연습",
    videos: [
      { title: "발음 정확도 향상", videoId: "mL_aThaxLUA" },
      { title: "명확한 발음 훈련", videoId: "nX1VxK2T_vY" },
    ],
  },
  "휴지(Pause)": {
    title: "휴지 타이밍 연습",
    videos: [
      { title: "효과적인 휴지", videoId: "dQw4w9WgXcQ" },
      { title: "말하기 리듬 훈련", videoId: "xvFZjo5PgG0" },
    ],
  },
  "속도(Speed)": {
    title: "말하기 속도 조절",
    videos: [
      { title: "적절한 말하기 속도", videoId: "uJbDQfZcwUw" },
      { title: "속도 조절 연습", videoId: "kJQP7kiw5Fk" },
    ],
  },
};

export default function LecturePage() {
  const {
    aiRecommendations,
    recentVideos,
    isLoading,
    setAiRecommendations,
    setRecentVideos,
    setIsLoading,
  } = useLectureStore();

  const [value, setValue] = useState(0);
  const [customizedContent, setCustomizedContent] = useState<SectionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sectionsLoading, setSectionsLoading] = useState({
    ai: true,
    videos: true,
    custom: true,
  });

  // AI 추천 처리 함수
  const processAIRecommendations = async (analysis: RecentAnalysis) => {
    try {
      setSectionsLoading((prev) => ({ ...prev, ai: true, videos: true }));

      const aiResponse = await getAIRecommendations(analysis);
      if (!aiResponse) {
        throw new Error("AI 응답을 받지 못했습니다.");
      }

      const recommendations = parseAIResponse(aiResponse);
      setAiRecommendations(recommendations);
      setSectionsLoading((prev) => ({ ...prev, ai: false }));

      try {
        const videos = await searchYoutubeVideos(analysis);
        setRecentVideos(videos);
      } catch (videoError) {
        console.error("동영상 검색 실패:", videoError);
        setError("추천 동영상을 불러오는데 실패했습니다.");
      } finally {
        setSectionsLoading((prev) => ({ ...prev, videos: false }));
      }
    } catch (error) {
      console.error("AI 처리 실패:", error);
      setError("AI 추천을 생성하는 중 오류가 발생했습니다.");
      setSectionsLoading((prev) => ({ ...prev, ai: false, videos: false }));
    }
  };

  // 맞춤형 콘텐츠 생성
  const generateCustomContent = async (analysis: RecentAnalysis) => {
    try {
      setSectionsLoading((prev) => ({ ...prev, custom: true }));
      const customSections: SectionData[] = [];

      const poorMetrics = Object.entries(analysis.metrics).filter(
        ([_, data]) => data.grade === "poor"
      );

      if (poorMetrics.length === 0) {
        setCustomizedContent([
          {
            title: "모든 지표가 양호합니다",
            videos: [],
            metricName: "none",
            grade: "excellent",
            value: 0,
          },
        ]);
        return;
      }

      for (const [metric, data] of poorMetrics) {
        try {
          const videos = await searchYoutubeVideos({
            metrics: { [metric]: data },
          });

          if (videos.length > 0) {
            customSections.push({
              title: `${metric.split("(")[0]} 개선 학습`,
              videos: videos.slice(0, 2).map((video) => ({
                title: video.title,
                videoId: video.id,
              })),
              metricName: metric,
              grade: data.grade,
              value: data.value,
            });
          }
        } catch (error) {
          console.error(`${metric} 관련 동영상 검색 실패:`, error);
        }
      }

      setCustomizedContent(customSections);
    } catch (error) {
      console.error("맞춤형 콘텐츠 생성 실패:", error);
      setError("맞춤형 콘텐츠를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setSectionsLoading((prev) => ({ ...prev, custom: false }));
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axiosInstance.get<ApiResponse>("/record/recent");

        if (response.data.status === "C000") {
          const analysis = response.data.data.analyzeResult;
          await processAIRecommendations(analysis);
          generateCustomContent(analysis);
        } else {
          throw new Error("API 응답이 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setError("접근 권한이 없습니다. 다시 로그인해주세요.");
          // 로그인 페이지로 리다이렉트
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 섹션 로딩 상태 업데이트
  useEffect(() => {
    if (aiRecommendations.length > 0) {
      setSectionsLoading((prev) => ({ ...prev, ai: false }));
    }
    if (recentVideos.length > 0) {
      setSectionsLoading((prev) => ({ ...prev, videos: false }));
    }
  }, [aiRecommendations, recentVideos]);

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-8">
      <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
        {error && (
          <div className="text-red-500 mb-4 p-4 bg-red-500/10 rounded">
            {error}
          </div>
        )}

        <LectureTabs
          value={value}
          onChange={setValue}
          sectionsLoading={sectionsLoading}
          aiRecommendations={aiRecommendations}
          recentVideos={recentVideos}
          customizedContent={customizedContent}
        />
      </Box>
    </div>
  );
}
