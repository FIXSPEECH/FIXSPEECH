import { create } from "zustand";
import { devtools } from "zustand/middleware";

// 타입 정의
interface AIRecommendation {
  title: string;
  content: string;
  exercises: string[];
  keywords: string[];
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface LectureState {
  aiRecommendations: AIRecommendation[];
  recentVideos: YouTubeVideo[];
  isLoading: boolean;
  setAiRecommendations: (recommendations: AIRecommendation[]) => void;
  setRecentVideos: (videos: YouTubeVideo[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useLectureStore = create<LectureState>()(
  devtools(
    (set) => ({
      aiRecommendations: [],
      recentVideos: [],
      isLoading: false,
      setAiRecommendations: (recommendations) =>
        set({ aiRecommendations: recommendations }),
      setRecentVideos: (videos) => set({ recentVideos: videos }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "lecture-store" }
  )
);
