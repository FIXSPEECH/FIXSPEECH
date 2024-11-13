import { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// 타입 정의
interface VideoData {
  title: string;
  videoId: string;
}

interface SectionData {
  title: string;
  videos: VideoData[];
}

interface CauseItem {
  title: string;
  description?: string;
  points: string[];
  examples?: string[];
}

// 상수 데이터
const PRONUNCIATION_SECTIONS: SectionData[] = [
  {
    title: "기초 모음/자음 발음",
    videos: [
      { title: "모음 발음", videoId: "QP8NEZFGhXs" },
      { title: "자음 발음 1탄", videoId: "mL_aThaxLUA" },
      { title: "자음 발음 2탄", videoId: "4lE-n6fmw24" },
      { title: "이중 모음", videoId: "WF88Od3jt8k" },
    ],
  },
  {
    title: "특정 자음 교정",
    videos: [
      { title: "ㄹ(리을) 발음 교정", videoId: "SzJm1zdeJXg" },
      { title: "ㅅ(시옷) 발음 교정", videoId: "IUNBPn3H8l8" },
      { title: "ㅈ,ㅊ 발음 교정", videoId: "GPYlTE0EMeA" },
      { title: "받침 발음", videoId: "Dy6l7GjcFX4" },
    ],
  },
];

const VOICE_SECTIONS: SectionData[] = [
  {
    title: "떨리는 목소리 교정",
    videos: [
      { title: "떨리는 목소리 해결법", videoId: "IRVfS0QgOLM" },
      { title: "발표 불안 극복하기", videoId: "PXsVzK6xb8c" },
    ],
  },
  {
    title: "목소리 톤 교정",
    videos: [
      { title: "목소리 톤 개선", videoId: "O2Zcs16U1vI" },
      { title: "발성과 톤 만들기", videoId: "O45w-1QbF0s" },
    ],
  },
  {
    title: "작은 목소리 교정",
    videos: [
      { title: "작은 목소리 성량 키우기", videoId: "o8TLYfxHakg" },
      { title: "목소리 크게 내는 법", videoId: "UaGOh0_trNs" },
    ],
  },
];

const PRONUNCIATION_CAUSES: CauseItem[] = [
  {
    title: "혀 짧은 소리 ('ㄷ', 'ㄹ' 발음 부정확)",
    points: [
      "선천적으로 혀의 바닥과 입의 아랫면을 연결하는 설소대가 짧은 혀 구조상의 문제",
      "더 큰 원인은 혀를 짧게 사용하는 습관",
      "혀를 끝 부분까지 충분히 활용하지 못하고, 혓바닥의 일부만 윗잇몸에 닿았다 떼거나, 또는 전혀 닿지 않게 사용하는 문제",
    ],
    examples: ["'노란색'을 '노단색'으로 발음"],
  },
  {
    title: "혀를 길게 사용하는 문제 ('ㅅ' 발음 부정확)",
    points: [
      "혀를 너무 길게 사용해 'ㅅ' 발음이 'th' 발음으로 변형",
      "'ㅅ'을 발음 할 때는 혀는 치아 뒤쪽에 위치하고, 공기를 앞으로 빼내면서 소리를 내야 함",
    ],
    examples: [
      "'사랑해'를 '싸(th)랑해'로",
      "'해주세요'를 '해주쎄(th)요'로 발음",
    ],
  },
  {
    title: "발성습관",
    points: [
      "발성습관은 특히 모음 발음에 영향을 미침 (발성에 따라 혀의 위치가 달라짐)",
      "과도한 발성이나 지나치게 작은 발성 모두 부정확한 발음의 원인",
    ],
    examples: [
      "'이' 발음 시 강한 발성: 혀가 긴장하고 혀 끝이 올라감",
      "'이' 발음 시 약한 발성: 혀의 긴장이 풀리고 혀 끝이 내려감",
    ],
  },
];

const VOICE_CAUSES = [
  {
    title: "긴장",
    points: ["발표나 면접 상황에서의 심리적 긴장으로 인한 일시적 증상"],
  },
  {
    title: "연축성 발성장애",
    points: [
      "성대 근육의 불수의적 수축으로 인한 음성 떨림",
      "일상적인 대화에서도 발생 가능",
    ],
  },
  {
    title: "근긴장성 발성장애",
    points: [
      "후두 근육의 과도한 긴장으로 인한 음성 장애",
      "지속적인 목소리 떨림과 쥐어짜는 듯한 발성",
    ],
  },
];

// 공통 컴포넌트들
const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
  <div className="aspect-video w-full">
    <iframe
      className="w-full h-full rounded-lg"
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-[#FF8C82] mb-6">{children}</h2>
);

const VideoSection = ({ section }: { section: SectionData }) => (
  <section className="mb-12">
    <SectionTitle>{section.title}</SectionTitle>
    <div className="grid md:grid-cols-2 gap-6">
      {section.videos.map((video) => (
        <div key={video.videoId} className="space-y-3">
          <h3 className="text-lg font-semibold text-white">{video.title}</h3>
          <YouTubeEmbed videoId={video.videoId} />
        </div>
      ))}
    </div>
  </section>
);

const CauseCard = ({ item }: { item: CauseItem }) => (
  <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg mb-6">
    <h3 className="text-lg font-semibold mb-4">{item.title}</h3>
    <ul className="list-disc pl-6 space-y-3">
      {item.points.map((point, idx) => (
        <li key={idx}>{point}</li>
      ))}
      {item.examples && (
        <li className="text-gray-300">
          <span className="text-white font-medium">예시: </span>
          <ul className="list-circle pl-6 mt-2 space-y-2">
            {item.examples.map((example, idx) => (
              <li key={idx}>{example}</li>
            ))}
          </ul>
        </li>
      )}
    </ul>
  </div>
);

const LecturePage = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // 커스텀 탭 스타일
  const tabStyle = {
    color: "white",
    "&.Mui-selected": {
      color: "#FF8C82",
    },
    "&:hover": {
      color: "#FF8C82",
      opacity: 0.7,
    },
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-8">
      <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "#FF8C82",
            mb: 4,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#FF8C82",
              },
            }}
            variant="fullWidth"
          >
            <Tab label="발음 교정" sx={tabStyle} />
            <Tab label="목소리 교정" sx={tabStyle} />
            <Tab label="원인 분석" sx={tabStyle} />
          </Tabs>
        </Box>

        {/* 발음 교정 탭 */}
        {value === 0 && (
          <div className="space-y-12">
            {PRONUNCIATION_SECTIONS.map((section, index) => (
              <VideoSection key={index} section={section} />
            ))}
          </div>
        )}

        {/* 목소리 교정 탭 */}
        {value === 1 && (
          <div className="space-y-12">
            {VOICE_SECTIONS.map((section, index) => (
              <VideoSection key={index} section={section} />
            ))}
          </div>
        )}

        {/* 원인 분석 탭 */}
        {value === 2 && (
          <div className="space-y-12">
            <section>
              <SectionTitle>부정확한 발음의 원인</SectionTitle>
              <div className="space-y-6">
                {PRONUNCIATION_CAUSES.map((cause, index) => (
                  <CauseCard key={index} item={cause} />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>떨리는 목소리의 원인</SectionTitle>
              <div className="space-y-6">
                {VOICE_CAUSES.map((cause, index) => (
                  <CauseCard key={index} item={cause} />
                ))}
                <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">해결 방법</h3>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>후두 근육 이완 운동</li>
                    <li>전문적인 음성 치료</li>
                    <li>호흡 훈련</li>
                    <li>스트레스 관리</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </Box>
    </div>
  );
};

export default LecturePage;
