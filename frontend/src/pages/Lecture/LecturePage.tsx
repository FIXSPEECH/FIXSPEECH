import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { useLectureStore } from "../../shared/stores/lectureStore";
import { LectureTabs } from "./components/LectureTabs";
import { parseAIResponse } from "./utils/aiResponseParser";
import type { RecentAnalysis, SectionData } from "./types/lecture";
import axiosInstance from "../../services/axiosInstance";
import { getAIRecommendations } from "./services/aiService";
import axios from "axios";

interface ApiResponse {
  status: string;
  data: {
    analyzeResult: RecentAnalysis;
  };
}

export default function LecturePage() {
  const { aiRecommendations, setAiRecommendations, setIsLoading } =
    useLectureStore();

  const [value, setValue] = useState(0);
  const [customizedContent, setCustomizedContent] = useState<SectionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sectionsLoading, setSectionsLoading] = useState({
    ai: true,
    custom: true,
  });

  // 유튜브 데이터 로드
  const loadYoutubeData = async (analysis: RecentAnalysis) => {
    try {
      setSectionsLoading((prev) => ({ ...prev, custom: true }));
      const response = await axiosInstance.get("/youtube");

      if (response.data.status === "C000") {
        const videos = response.data.data;
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

        setCustomizedContent(
          poorMetrics
            .map(([metric, data]) => {
              const keywordId = getKeywordIdForMetric(metric);
              const metricVideos = videos.filter(
                (video: any) => video.keywordId === keywordId
              );

              return metricVideos.length > 0
                ? {
                    title: `${metric.split("(")[0]} 개선 학습`,
                    videos: metricVideos,
                    metricName: metric,
                    grade: data.grade,
                    value: data.value,
                  }
                : null;
            })
            .filter((section): section is SectionData => section !== null)
        );
      }
    } catch (error) {
      console.error("유튜브 데이터 로드 실패:", error);
      setError("추천 동영상을 불러오는데 실패했습니다.");
    } finally {
      setSectionsLoading((prev) => ({ ...prev, custom: false }));
    }
  };

  // AI 추천 처리
  const processAIRecommendations = async (analysis: RecentAnalysis) => {
    try {
      setSectionsLoading((prev) => ({ ...prev, ai: true }));
      const aiResponse = await getAIRecommendations(analysis);
      if (aiResponse) {
        const recommendations = parseAIResponse(aiResponse);
        setAiRecommendations(recommendations);
      }
    } catch (error) {
      console.error("AI 추천 처리 실패:", error);
      setError("AI 추천을 생성하는 중 오류가 발생했습니다.");
    } finally {
      setSectionsLoading((prev) => ({ ...prev, ai: false }));
    }
  };

  // 메트릭에 따른 keywordId 매핑
  const getKeywordIdForMetric = (metric: string): number => {
    const metricMap: Record<string, number> = {
      "명료도(Clarity)": 1,
      "강도 변동성(AMR)": 2,
      "성대 떨림(Jitter)": 3,
      "말의 리듬(Speech Rhythm)": 4,
      "멜로디 지수(Melody Index)": 5,
      "휴지 타이밍(Pause Timing)": 6,
      "속도 변동성(Rate Variability)": 7,
      "발화의 에너지(Utterance Energy)": 8,
      "억양 패턴 일관성(Intonation Pattern Consistency)": 9,
    };
    return metricMap[metric] || 1;
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

          // 유튜브 데이터와 AI 추천을 병렬로 로드
          await Promise.all([
            loadYoutubeData(analysis),
            processAIRecommendations(analysis),
          ]);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setError("접근 권한이 없습니다. 다시 로그인해주세요.");
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-transparent text-white">
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
          customizedContent={customizedContent}
        />
      </Box>
    </div>
  );
}
