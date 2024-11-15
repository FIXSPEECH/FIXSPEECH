import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { LoadingMessage } from "../../../shared/components/Loader/LoadingMessage";
import { AIRecommendationCard } from "./AIRecommendationCard";
import { RecentVideoCard } from "./RecentVideoCard";
import { VideoSection } from "./VideoSection";
import type {
  AIRecommendation,
  YouTubeVideo,
  SectionData,
} from "../types/lecture";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lecture-tabpanel-${index}`}
      aria-labelledby={`lecture-tab-${index}`}
    >
      {value === index && <section>{children}</section>}
    </div>
  );
}

interface LectureTabsProps {
  value: number;
  onChange: (newValue: number) => void;
  sectionsLoading: {
    ai: boolean;
    videos: boolean;
    custom: boolean;
  };
  aiRecommendations: AIRecommendation[];
  recentVideos: YouTubeVideo[];
  customizedContent: SectionData[];
}

const tabStyle = {
  color: "#9CA3AF",
  "&.Mui-selected": {
    color: "#EE719E",
  },
};

export function LectureTabs({
  value,
  onChange,
  sectionsLoading,
  aiRecommendations,
  recentVideos,
  customizedContent,
}: LectureTabsProps) {
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "#EE719E", mb: 4 }}>
        <Tabs
          value={value}
          onChange={(_event, newValue) => onChange(newValue)}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#EE719E",
            },
          }}
          variant="fullWidth"
        >
          <Tab label="AI 추천" sx={tabStyle} />
          <Tab label="추천 동영상" sx={tabStyle} />
          <Tab label="맞춤형 강의" sx={tabStyle} />
        </Tabs>
      </Box>

      {/* AI 추천 탭 */}
      <TabPanel value={value} index={0}>
        {sectionsLoading.ai ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LoadingMessage />
          </div>
        ) : aiRecommendations && aiRecommendations.length > 0 ? (
          <div className="space-y-6">
            {aiRecommendations.map((recommendation, index) => (
              <AIRecommendationCard
                key={index}
                recommendation={recommendation}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            AI 추천을 불러오는 중입니다...
          </div>
        )}
      </TabPanel>

      {/* 추천 동영상 탭 */}
      <TabPanel value={value} index={1}>
        {sectionsLoading.videos ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LoadingMessage />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVideos.map((video) => (
              <RecentVideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </TabPanel>

      {/* 맞춤형 강의 탭 */}
      <TabPanel value={value} index={2}>
        {sectionsLoading.custom ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LoadingMessage />
          </div>
        ) : (
          customizedContent.map((section, index) => (
            <VideoSection key={index} section={section} />
          ))
        )}
      </TabPanel>
    </>
  );
}
