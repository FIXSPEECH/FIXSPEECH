import { useState } from "react";
import VoiceMetricCard from "../components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../components/VoiceQuality/MetricsVisualizer";
import useAuthStore from "../store/authStore";

// 음성 분석 메트릭 데이터 타입 정의
interface MetricData {
  value: number; // 측정값
  grade: "excellent" | "good" | "poor" | "unknown"; // 등급
  unit: string; // 단위
  reference: string; // 참조 범위
  interpretation: string; // 해석
}

// API 응답 데이터 타입 정의
interface AnalysisResponse {
  status: string;
  message?: string;
  data?: {
    metrics: {
      [key: string]: MetricData;
    };
    overall_score: number;
    recommendations: string[];
    processing_time_seconds: number;
  };
}

// 점수 구간별 시각화 스타일 정의
// 점수에 따라 색상과 그림자 효과를 반환하는 함수
const getScoreColor = (score: number) => {
  if (score >= 90)
    return { color: "#00FF88", shadow: "0 0 20px rgba(0, 255, 136, 0.5)" }; // 90점 이상: 초록색
  if (score >= 70)
    return { color: "#FFD700", shadow: "0 0 20px rgba(255, 215, 0, 0.5)" }; // 70-89점: 금색
  return { color: "#FF4D4D", shadow: "0 0 20px rgba(255, 77, 77, 0.5)" }; // 70점 미만: 빨간색
};

// 각 메트릭별 평가 기준 정의
// 각 메트릭의 excellent/good/poor 기준값과 설명을 포함
const METRIC_CRITERIA = {
  "명료도(Clarity)": {
    excellent: "20dB 이상",
    good: "10-20dB",
    poor: "10dB 미만",
    description: "음성의 선명도를 나타내며, 20dB 이상이 최적입니다.",
  },
  "억양 패턴 일관성 (Intonation Pattern Consistency)": {
    excellent: "40-60Hz",
    good: "30-40Hz 또는 60-70Hz",
    poor: "30Hz 미만 또는 70Hz 초과",
    description: "자연스러운 억양 변화를 측정하며, 40-60Hz가 최적입니다.",
  },
  "멜로디 지수(Melody Index)": {
    excellent: "-50 ~ -30 MFCC",
    good: "-60 ~ -50 또는 -30 ~ -20 MFCC",
    poor: "-60 MFCC 미만 또는 -20 MFCC 초과",
    description: "음성의 멜로디 특성을 나타내며, -50 ~ -30이 최적입니다.",
  },
  "말의 리듬(Speech Rhythm)": {
    excellent: "0.03-0.06초",
    good: "0.02-0.03초 또는 0.06-0.07초",
    poor: "0.02초 미만 또는 0.07초 초과",
    description: "발화의 리듬감을 측정하며, 0.03-0.06초가 최적입니다.",
  },
  "휴지 타이밍(Pause Timing)": {
    excellent: "0.1-0.15초",
    good: "0.08-0.1초 또는 0.15-0.18초",
    poor: "0.08초 미만 또는 0.18초 초과",
    description: "문장 간 쉼의 타이밍을 측정하며, 0.1-0.15초가 최적입니다.",
  },
  "속도 변동성(Rate Variability)": {
    excellent: "80-90",
    good: "70-80 또는 90-100",
    poor: "70 미만 또는 100 초과",
    description: "말하기 속도의 안정성을 나타내며, 80-90이 최적입니다.",
  },
  "성대 떨림(Jitter)": {
    excellent: "0.01-0.03",
    good: "0.005-0.01 또는 0.03-0.04",
    poor: "0.005 미만 또는 0.04 초과",
    description: "성대 진동의 안정성을 측정하며, 0.01-0.03이 최적입니다.",
  },
  "강도 변동성(AMR)": {
    excellent: "0.003-0.007",
    good: "0.002-0.003 또는 0.007-0.008",
    poor: "0.002 미만 또는 0.008 초과",
    description: "음성 강도의 변화를 측정하며, 0.003-0.007이 최적입니다.",
  },
  "발화의 에너지(Utterance Energy)": {
    excellent: "-25 ~ -20dB",
    good: "-30 ~ -25dB 또는 -20 ~ -15dB",
    poor: "-30dB 미만 또는 -15dB 초과",
    description: "전반적인 발화 에너지를 측정하며, -25 ~ -20dB가 최적입니다.",
  },
};

// FastApiTestPage 컴포넌트 정의
const FastApiTestPage = () => {
  // 상태 관리를 위한 useState 훅 사용
  const [response, setResponse] = useState<AnalysisResponse | null>(null); // API 응답 데이터
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 선택된 파일
  const userGender = useAuthStore((state) => state.userProfile?.gender); // 사용자 성별 정보

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResponse(null);
    }
  };

  // 파일 제출 및 분석 요청 핸들러
  const handleSubmit = async () => {
    if (!selectedFile || !userGender) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("gender", userGender);

    const isLocalhost = window.location.hostname === "localhost";
    const apiUrl = `${import.meta.env.VITE_FASTAPI_URL}/analyze/full`;

    try {
      // 로컬 개발 환경에서 디버깅을 위한 로그
      if (isLocalhost) {
        console.log("Request:", {
          url: apiUrl,
          method: "POST",
          formData: {
            file: selectedFile.name,
            gender: userGender,
          },
        });
      }

      // API 요청 전송
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      const data: AnalysisResponse = await res.json();

      // 응답 데이터 로깅 (로컬 환경에서만)
      if (isLocalhost) {
        console.log("Response:", data);
      }

      // 에러 처리
      if (data.status === "error") {
        throw new Error(data.message || "분석 중 오류가 발생했습니다.");
      }
      setResponse(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // UI 렌더링
  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">음성 분석</h1>

        {/* 파일 입력과 제출 버튼 섹션 */}
        <div className="mb-8 space-y-4">
          <div>
            <input
              type="file"
              accept=".wav"
              onChange={handleFileSelect}
              className="bg-gray-800/30 p-2 rounded"
              disabled={!userGender}
            />
            {selectedFile && (
              <p className="mt-2 text-gray-300">
                선택된 파일: {selectedFile.name}
              </p>
            )}
            {!userGender && (
              <p className="text-red-400 mt-2">
                성별 정보가 필요합니다. 프로필을 설정해주세요.
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || !userGender || loading}
            className={`px-6 py-2 rounded-lg transition-colors ${
              !selectedFile || !userGender || loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600"
            }`}
          >
            분석 시작
          </button>
        </div>

        {/* 에러 메시지 표시 섹션 */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            <p className="font-semibold">오류 발생</p>
            <p>{error}</p>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">분석 중...</p>
          </div>
        )}

        {/* 분석 결과 표시 섹션 */}
        {response?.data && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 메트릭 시각화 영역 */}
            <div className="lg:w-1/3">
              <div className="sticky top-8">
                <div className="aspect-square w-full bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50">
                  <h2 className="text-lg font-bold mb-4">메트릭 시각화</h2>
                  <MetricsVisualizer metrics={response.data.metrics} />
                </div>
              </div>
            </div>

            {/* 상세 분석 결과 영역 */}
            <div className="lg:w-2/3">
              {/* 전체 점수와 추천사항 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* 전체 점수 카드 */}
                <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
                  <h2 className="text-lg font-bold mb-4">전체 점수</h2>
                  <div
                    className="text-6xl font-bold text-center"
                    style={{
                      color: getScoreColor(response.data.overall_score).color,
                      textShadow: getScoreColor(response.data.overall_score)
                        .shadow,
                    }}
                  >
                    {response.data.overall_score}
                  </div>
                </div>

                {/* 추천사항 카드 */}
                <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
                  <h2 className="text-lg font-bold mb-4">추천사항</h2>
                  {response.data.recommendations?.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {response.data.recommendations.map((rec, idx) => (
                        <li
                          key={idx}
                          className="text-gray-300 p-2 rounded bg-gray-700/30 border border-gray-600/50"
                          style={{
                            textShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-300 text-center p-4 bg-emerald-500/10 rounded border border-emerald-500/30">
                      <p
                        className="mb-2 text-emerald-400"
                        style={{
                          textShadow: "0 0 10px rgba(0, 255, 136, 0.3)",
                        }}
                      >
                        ✨ 훌륭한 음성 품질을 보여주고 계십니다!
                      </p>
                      <p className="text-emerald-300">
                        현재의 좋은 발성을 유지하면서 더욱 자신감 있게
                        말씀해보세요.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 개별 메트릭 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(response.data.metrics).map(([name, data]) => (
                  <VoiceMetricCard
                    key={name}
                    name={name}
                    data={data}
                    criteria={
                      METRIC_CRITERIA[name as keyof typeof METRIC_CRITERIA]
                    }
                  />
                ))}
              </div>

              {/* 처리 시간 표시 */}
              <div className="mt-8 text-sm text-gray-400">
                처리 시간: {response.data.processing_time_seconds.toFixed(3)}초
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FastApiTestPage;
