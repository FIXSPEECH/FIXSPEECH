import { useState } from "react";
import VoiceMetricCard from "../components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../components/VoiceQuality/MetricsVisualizer";

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
  data: {
    metrics: {
      metrics: Record<string, MetricData>; // 각 메트릭별 상세 데이터
      overall_score: number; // 전체 점수
      recommendations: string[]; // 개선 추천사항 목록
    };
    processing_time_seconds: number; // 처리 소요 시간
  };
}

// 점수 구간별 시각화 스타일 정의
const getScoreColor = (score: number) => {
  // 90점 이상: 우수 (초록색)
  if (score >= 90) {
    return { color: "#00FF88", shadow: "0 0 20px rgba(0, 255, 136, 0.5)" };
  }
  // 70~89점: 양호 (노란색)
  if (score >= 70) {
    return { color: "#FFD700", shadow: "0 0 20px rgba(255, 215, 0, 0.5)" };
  }
  // 70점 미만: 개선필요 (빨간색)
  return { color: "#FF4D4D", shadow: "0 0 20px rgba(255, 77, 77, 0.5)" };
};

// 메트릭 평가 기준 정의
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

// 분석 모드 타입 정의
type AnalysisMode = "full" | "mimic" | "practice";

const FastApiTestPage = () => {
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AnalysisMode>("full");

  // 음성 파일 업로드 및 분석 요청 처리
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_FASTAPI_URL}/analyze/${mode}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">음성 분석 테스트</h1>

        {/* 분석 모드 선택 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">분석 모드 선택</h2>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === "full"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-800/30 hover:bg-gray-700/30"
              }`}
              onClick={() => setMode("full")}
            >
              전체 분석
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === "mimic"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-800/30 hover:bg-gray-700/30"
              }`}
              onClick={() => setMode("mimic")}
            >
              아나운서 음성 모방
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === "practice"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-800/30 hover:bg-gray-700/30"
              }`}
              onClick={() => setMode("practice")}
            >
              스크립트 연습
            </button>
          </div>
        </div>

        {/* 파일 입력 */}
        <div className="mb-8">
          <input
            type="file"
            accept=".wav"
            onChange={handleFileUpload}
            className="bg-gray-800/30 p-2 rounded"
          />
        </div>

        {/* 분석 모드별 설명 */}
        <div className="mb-8 p-4 bg-gray-800/30 rounded-lg">
          {mode === "full" && (
            <p>전체적인 음성 품질을 분석하여 상세한 피드백을 제공합니다.</p>
          )}
          {mode === "mimic" && (
            <p>
              아나운서의 음성과 비교하여 유사도를 분석하고 개선점을 제시합니다.
            </p>
          )}
          {mode === "practice" && (
            <p>스크립트 연습에 대한 정확도와 음성 품질을 분석합니다.</p>
          )}
        </div>

        {/* 기존 분석 결과 표시 부분 */}
        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">분석 중...</p>
          </div>
        )}

        {/* 분석 결과 표시 */}
        {response?.data && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 메트릭 시각화 영역 */}
            <div className="lg:w-1/3">
              <div className="sticky top-8">
                <div className="aspect-square w-full bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50">
                  <h2 className="text-lg font-bold mb-4">메트릭 시각화</h2>
                  <MetricsVisualizer metrics={response.data.metrics.metrics} />
                </div>
              </div>
            </div>

            {/* 상세 분석 결과 영역 */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* 전체 점수 표시 */}
                <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
                  <h2 className="text-lg font-bold mb-4">전체 점수</h2>
                  <div
                    className="text-6xl font-bold text-center"
                    style={{
                      color: getScoreColor(response.data.metrics.overall_score)
                        .color,
                      textShadow: getScoreColor(
                        response.data.metrics.overall_score
                      ).shadow,
                    }}
                  >
                    {response.data.metrics.overall_score}
                  </div>
                </div>

                {/* 추천사항 표시 */}
                <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
                  <h2 className="text-lg font-bold mb-4">추천사항</h2>
                  {response.data.metrics.recommendations?.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {response.data.metrics.recommendations.map((rec, idx) => (
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

              {/* 개별 메트릭 카드 목록 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(response.data.metrics.metrics).map(
                  ([name, data]) => (
                    <VoiceMetricCard
                      key={name}
                      name={name}
                      data={data}
                      criteria={
                        METRIC_CRITERIA[name as keyof typeof METRIC_CRITERIA]
                      }
                    />
                  )
                )}
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
