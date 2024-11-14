import { useState, useEffect } from "react";
import VoiceMetricCard from "../../shared/components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../../shared/components/VoiceQuality/MetricsVisualizer";
import useAuthStore from "../../shared/stores/authStore";
import useVoiceStore from "../../shared/stores/voiceStore";
import { useNavigate, useLocation } from "react-router-dom";
import GradientCirclePlanes from "../../shared/components/Loader/GradientCirclePlanes";
import { METRIC_CRITERIA } from "../../shared/constants/voiceMetrics";

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
