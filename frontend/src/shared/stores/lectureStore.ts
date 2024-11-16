import { create } from "zustand";
import {
  AIRecommendation,
  RecentAnalysis,
} from "../../pages/Lecture/types/lecture";
import { getAIRecommendations } from "../../pages/Lecture/services/aiService";
import { parseAIResponse } from "../../pages/Lecture/utils/aiResponseParser";

interface LectureState {
  aiRecommendations: AIRecommendation[];
  isLoading: boolean;
  error: string | null;
  setAiRecommendations: (recommendations: AIRecommendation[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  initializeWithAnalysis: (analysis: RecentAnalysis) => Promise<void>;
}

export const useLectureStore = create<LectureState>((set) => ({
  aiRecommendations: [],
  isLoading: false,
  error: null,
  setAiRecommendations: (recommendations) =>
    set({ aiRecommendations: recommendations }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  initializeWithAnalysis: async (analysis: RecentAnalysis) => {
    try {
      set({ isLoading: true, error: null });
      const aiResponse = await getAIRecommendations(analysis);
      if (aiResponse) {
        const recommendations = parseAIResponse(aiResponse);
        set({ aiRecommendations: recommendations });
      }
    } catch (error) {
      set({ error: "AI 추천을 생성하는 중 오류가 발생했습니다." });
      console.error("AI 추천 초기화 실패:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
