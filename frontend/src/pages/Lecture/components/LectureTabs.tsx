import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { LoadingMessage } from "../../../shared/components/Loader/LoadingMessage";
import { AIRecommendationCard } from "./AIRecommendationCard";
import { VideoSection } from "./VideoSection";
import type { AIRecommendation, SectionData } from "../types/lecture";

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
      {value === index && <section aria-live="polite">{children}</section>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `lecture-tab-${index}`,
    "aria-controls": `lecture-tabpanel-${index}`,
  };
}

interface LectureTabsProps {
  value: number;
  onChange: (newValue: number) => void;
  sectionsLoading: {
    ai: boolean;
    custom: boolean;
  };
  aiRecommendations: AIRecommendation[];
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
  customizedContent,
}: LectureTabsProps) {
  const renderAIRecommendations = () => {
    if (sectionsLoading.ai) {
      return <LoadingMessage />;
    }

    return (
      <div className="space-y-6" role="list">
        {aiRecommendations.map((recommendation, index) => (
          <div key={`ai-recommendation-${index}`} role="listitem">
            <AIRecommendationCard recommendation={recommendation} />
          </div>
        ))}
      </div>
    );
  };

  const renderCustomContent = () => {
    if (sectionsLoading.custom) {
      return <LoadingMessage />;
    }

    return (
      <div role="list">
        {customizedContent.map((section, index) => (
          <div key={`video-section-${index}`} role="listitem">
            <VideoSection section={section} />
          </div>
        ))}
      </div>
    );
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    onChange(newValue);
  };

  return (
    <div role="region" aria-label="강의 콘텐츠">
      <Box sx={{ borderBottom: 1, borderColor: "#EE719E", mb: 4 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#EE719E",
            },
          }}
          variant="fullWidth"
          aria-label="강의 탭"
        >
          <Tab
            label="AI 추천"
            sx={tabStyle}
            {...a11yProps(0)}
            aria-selected={value === 0}
          />
          <Tab
            label="맞춤형 강의"
            sx={tabStyle}
            {...a11yProps(1)}
            aria-selected={value === 1}
          />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        {renderAIRecommendations()}
      </TabPanel>

      <TabPanel value={value} index={1}>
        {renderCustomContent()}
      </TabPanel>
    </div>
  );
}
