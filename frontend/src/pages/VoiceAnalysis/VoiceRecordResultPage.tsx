import { useState, useEffect } from "react";
import VoiceMetricCard from "../../components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../../components/VoiceQuality/MetricsVisualizer";
import useAuthStore from "../../store/authStore";
import useVoiceStore from "../../store/voiceStore";
import { useNavigate, useLocation } from "react-router-dom";
import GradientCirclePlanes from "../../components/Loader/GradientCirclePlanes";

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
    excellent: "남성: 15dB 이상, 여성: 16dB 이상",
    good: "남성: 13~15dB, 여성: 14~16dB",
    poor: "남성: 13dB 미만, 여성: 14dB 미만",
    description:
      "말하는 내용이 얼마나 또렷하고 깨끗하게 들리는지를 나타냅니다. 높을수록 청자가 내용을 더 쉽게 이해할 수 있어요.",
  },
  "억양 패턴 일관성 (Intonation Pattern Consistency)": {
    excellent: "남성: 15~30Hz, 여성: 20~35Hz",
    good: "남성: 10~15Hz, 여성: 15~20Hz",
    poor: "남성: 10Hz 미만 또는 30Hz 초과, 여성: 15Hz 미만 또는 35Hz 초과",
    description:
      "말할 때 목소리의 높낮이가 얼마나 자연스럽게 변하는지 보여줍니다. 적절한 범위의 변화는 더 생동감 있고 매력적인 목소리로 들리게 해요.",
  },
  "멜로디 지수(Melody Index)": {
    excellent: "남성: -40 이상, 여성: -35 이상",
    good: "남성: -50 ~ -40, 여: -45 ~ -35",
    poor: "남성: -50 미만, 여성: -45 미만",
    description:
      "목소리의 음악적인 특성을 나타냅니다. 이 값이 높을수록 듣기 좋은 목소리 톤을 가지고 있다는 의미예요.",
  },
  "말의 리듬(Speech Rhythm)": {
    excellent: "남성: 0.06~0.1초, 여성: 0.05~0.09초",
    good: "남성: 0.05~0.06초, 여성: 0.04~0.05초",
    poor: "남성: 0.05초 미만 또는 0.1초 초과, 여성: 0.04초 미만 또는 0.09초 초과",
    description:
      "말할 때의 리듬감을 보여줍니다. 적절한 리듬은 말하는 내용을 더 인상적이고 기억하기 쉽게 만들어요.",
  },
  "휴지 타이밍(Pause Timing)": {
    excellent: "남성: 0.09~0.13초, 여성: 0.08~0.12초",
    good: "남성: 0.08~0.09초, 여성: 0.07~0.08초",
    poor: "남성: 0.08초 미만 또는 0.13초 초과, 여성: 0.07초 미만 또는 0.12초 초과",
    description:
      "문장 사이에서 얼마나 자연스럽게 쉬는지를 나타냅니다. 적절한 휴지는 청자가 내용을 더 잘 이해하고 편안하게 들을 수 있게 해줘요.",
  },
  "속도 변동성(Rate Variability)": {
    excellent: "남성: 60~75Hz, 여성: 65~80Hz",
    good: "남성: 75~85Hz, 여성: 80~90Hz",
    poor: "남성: 60Hz 미만 또는 85Hz 초과, 여성: 65Hz 미만 또는 90Hz 초과",
    description:
      "말하기 속도가 얼마나 안정적인지 보여줍니다. 적절한 속도 변화는 지루하지 않으면서도 안정감 있는 말하기를 만들어요.",
  },
  "성대 떨림(Jitter)": {
    excellent: "남성: 0.03 이하, 여성: 0.02 이하",
    good: "남성: 0.03~0.05, 여성: 0.02~0.04",
    poor: "남성: 0.05 초과, 여성: 0.04 초과",
    description:
      "목소리의 안정성을 나타냅니다. 낮을수록 떨림 없이 안정적인 목소리를 가지고 있다는 의미예요. 피로하거나 긴장하면 이 값이 높아질 수 있어요.",
  },
  "강도 변동성(AMR)": {
    excellent: "남성: 0.004~0.007, 여성: 0.003~0.006",
    good: "남성: 0.003~0.004, 여성: 0.002~0.003",
    poor: "남성: 0.003 미만 또는 0.007 초과, 여성: 0.002 미만 또는 0.006 초과",
    description:
      "말할 때 목소리의 크기가 얼마나 자연스럽게 변하는지 보여줍니다. 적절한 강도 변화는 더 생동감 있고 표현력 있는 말하기를 만들어요.",
  },
  "발화의 에너지(Utterance Energy)": {
    excellent: "남성: -24dB 이상, 여성: -23dB 이상",
    good: "남성: -26 ~ -24dB, 여성: -25 ~ -23dB",
    poor: "남성: -26dB 미만, 여성: -25dB 미만",
    description:
      "전반적인 목소리의 힘과 에너지를 나타냅니다. 적절한 에너지는 자신감 있고 설득력 있는 말하기의 핵심이에요.",
  },
};

// VoiceRecordResultPage 컴포넌트 정의
const VoiceRecordResultPage = () => {
  // 상태 관리를 위한 useState 훅 사용
  const [response, setResponse] = useState<AnalysisResponse | null>(null); // API 응답 데이터
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const userGender = useAuthStore((state) => state.userProfile?.gender); // 사용자 성별 정보
  const { audioBlob } = useVoiceStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingDots, setLoadingDots] = useState("");

  const handleReRecord = () => {
    navigate("/record"); // 녹음 페이지로 이동
  };

  const handleGoHome = () => {
    navigate("/"); // 홈으로 이동
  };

  // 컴포넌트 마운트 시 녹음된 파일 처리
  useEffect(() => {
    const processRecordedAudio = async () => {
      if (audioBlob && userGender) {
        setLoading(true);
        try {
          const file = new File([audioBlob], "recorded_audio.wav", {
            type: "audio/wav",
          });
          const formData = new FormData();
          formData.append("file", file);
          formData.append("gender", userGender);

          const response = await fetch(
            `${import.meta.env.VITE_FASTAPI_URL}/analyze/full`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 500) {
              throw new Error("음성을 분석할 수 없습니다. 다시 녹음해 주세요.");
            }
            throw new Error(
              errorData.detail?.message ||
                errorData.detail ||
                `서버 에러 (${response.status})`
            );
          }

          const data = await response.json();
          setResponse(data);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("알 수 없는 에러가 발생했습니다.");
          }
        } finally {
          setLoading(false);
        }
      }
    };

    if (location.state?.fromRecordPage) {
      processRecordedAudio();
    }
  }, [audioBlob, userGender, location.state]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => {
          if (prev === "....") return "";
          return prev + ".";
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [loading]);

  // UI 렌더링
  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">음성 분석</h1>

        {/* 로딩 상태 표시 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <GradientCirclePlanes />
            <p className="mt-8 text-white text-lg font-medium">
              분석 중입니다{loadingDots}
            </p>
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-400">{error}</p>
              <button
                onClick={handleReRecord}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/50 transition-colors"
              >
                다시 녹음하기
              </button>
            </div>
          </div>
        )}

        {/* 분석 결과 표시 */}
        {response?.data && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 왼쪽 사이드바 */}
            <div className="lg:col-span-1 space-y-8">
              {/* 전체 점수 카드 */}
              <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50">
                <h2 className="text-lg font-bold mb-4">전체 점수</h2>
                <div className="text-center">
                  <div
                    className="text-6xl font-bold mb-2"
                    style={{
                      color: getScoreColor(response.data.overall_score).color,
                      textShadow: getScoreColor(response.data.overall_score)
                        .shadow,
                    }}
                  >
                    {response.data.overall_score.toFixed(1)}
                  </div>
                  <p className="text-gray-400">100점 만점</p>
                </div>
              </div>

              {/* 메트릭 시각화 */}
              <div className="aspect-square w-full bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50">
                <h2 className="text-lg font-bold mb-4">메트릭 시각화</h2>
                <MetricsVisualizer metrics={response.data.metrics} />
              </div>
            </div>

            {/* 상세 분석 결과 영역 */}
            <div className="lg:col-span-2">
              {/* 추천사항 카드 */}
              <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50 mb-8">
                <h2 className="text-lg font-bold mb-4">추천사항</h2>
                {response.data.recommendations?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {response.data.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="text-gray-300 p-2 rounded bg-gray-700/30 border border-gray-600/50"
                      >
                        {rec}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-300 text-center p-4 bg-emerald-500/10 rounded border border-emerald-500/30">
                    <p className="mb-2 text-emerald-400">
                      ✨ 훌륭한 음성 품질을 보여주고 계십니다!
                    </p>
                    <p className="text-emerald-300">
                      현재의 좋은 발성을 유지하면서 더욱 자신감 있게
                      말씀해보세요.
                    </p>
                  </div>
                )}
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

              {/* 홈으로 가기 버튼 추가 */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50 transition-colors font-medium"
                >
                  학습하러 가기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecordResultPage;
