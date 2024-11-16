export interface VideoData {
  id: number;
  keywordId: number;
  videoTitle: string;
  videoId: string;
  videoThumbnail: string;
}

export interface SectionData {
  title: string;
  metricName: string;
  grade: "excellent" | "good" | "poor";
  value: number;
  videos: VideoData[];
}

export interface AIRecommendation {
  title: string;
  content: string;
  exercises: string[];
  keywords: string[];
}

export interface RecentAnalysis {
  metrics: Record<
    string,
    {
      value: number;
      grade: "excellent" | "good" | "poor";
    }
  >;
}
