export interface VideoData {
  title: string;
  videoId: string;
}

export interface SectionData {
  title: string;
  videos: VideoData[];
}

export interface AIRecommendation {
  title: string;
  content: string;
  exercises: string[];
  keywords: string[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export interface RecentAnalysis {
  metrics: {
    [key: string]: {
      grade: "excellent" | "good" | "poor";
      value: number;
      interpretation: string;
    };
  };
}
