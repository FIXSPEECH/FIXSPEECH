import { useState, useEffect } from "react";
import VoiceMetricCard from "../../shared/components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../../shared/components/VoiceQuality/MetricsVisualizer";
import useAuthStore from "../../shared/stores/authStore";
import useVoiceStore from "../../shared/stores/voiceStore";
import { useNavigate, useLocation } from "react-router-dom";
import GradientCirclePlanes from "../../shared/components/Loader/GradientCirclePlanes";
import { METRIC_CRITERIA } from "../../shared/constants/voiceMetrics";
import { useLectureStore } from "../../shared/stores/lectureStore";
import axiosInstance from "../../services/axiosInstance";
import useHistoryColorStore from "../../shared/stores/historyColorStore";

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
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const userGender = useAuthStore((state) => state.userProfile?.gender); // 사용자 성별 정보
  const { audioBlob } = useVoiceStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingDots, setLoadingDots] = useState("");
  const { initializeWithAnalysis } = useLectureStore();
  const { selectedColor } = useHistoryColorStore();

  const handleReRecord = () => {
    navigate("/record"); // 녹음 페이지로 이동
  };

  const handleGoHome = () => {
    navigate("/"); // 홈으로 이동
  };

  // 컴포넌트 마운트 시 녹음된 파일 처리
  useEffect(() => {
    const processRecordedAudio = async () => {
      if (!audioBlob || !userGender) {
        setError("녹음된 음성이 없습니다. 다시 녹음해주세요.");
        setLoading(false);
        return;
      }

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
          if (response.status === 500) {
            throw new Error("음성을 분석할 수 없습니다. 다시 녹음해 주세요.");
          } else if (response.status === 400) {
            throw new Error("잘못된 요청입니다. 다시 녹음해 주세요.");
          } else if (response.status === 413) {
            throw new Error("파일 크기가 너무 큽니다. 더 짧게 녹음해 주세요.");
          } else {
            const errorData = await response.json();
            throw new Error(
              errorData.detail?.message ||
                errorData.detail ||
                `서버 에러 (${response.status})`
            );
          }
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
    };

    // location.state가 없어도 로딩 상태로 시작
    if (location.state?.fromRecordPage) {
      processRecordedAudio();
    } else {
      setLoading(false);
      setError("잘못된 접근입니다. 녹음 페이지에서 다시 시도해주세요.");
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/record/recent");
        if (response.data.status === "C000") {
          const analysis = response.data.data.analyzeResult;
          // 분석 결과를 받은 즉시 LectureStore 초기화
          await initializeWithAnalysis(analysis);
        }
      } catch (error) {
        console.error("분석 결과 로드 실패:", error);
      }
    };

    fetchData();
  }, [initializeWithAnalysis]);

  // UI 렌더링
  return (
    <div className="min-h-screen bg-transparent text-white p-8" role="main">
      <div className="max-w-7xl mx-auto">
        {/* <h1 className="text-3xl font-bold mb-8">음성 분석</h1> */}

        {/* 로딩 상태 표시 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
            <GradientCirclePlanes />
            <p className="mt-8 text-white text-lg font-medium">
              분석 중입니다{loadingDots}
            </p>
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {error && (
          <div className="bg-indigo-950/30 border border-indigo-400/30 rounded-lg" role="alert">
            <div className="flex flex-col items-center ">
              <h2 className="text-2xl font-semibold text-indigo-300 flex items-center">
                <GradientCirclePlanes />
                죄송합니다. 지금은 분석이 어려워요 🥺
              </h2>

              <div className="space-y-4 text-center mb-4 flex flex-col items-center">
                <p className="text-gray-300 mb-6">
                  다음과 같은 이유로 음성 분석이 어려울 수 있어요:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-400/20 text-gray-400 text-sm">
                    • 음성 파일이 너무 길거나 짧을 수 있어요
                  </div>
                  <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-400/20 text-gray-400 text-sm">
                    • 주변 소음이 많은 경우 지표 분석값을 얻기 어려워요
                  </div>
                  <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-400/20 text-gray-400 text-sm">
                    • 네트워크 연결이 불안정할 수 있어요
                  </div>
                  <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-400/20 text-gray-400 text-sm">
                    • 음성 크기가 너무 작거나 크면 분석이 어려워요.
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleReRecord}
                  className="px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 
                    text-indigo-300 rounded-lg border border-indigo-500/50 
                    transition-all duration-300 hover:scale-105"
                  aria-label="다시 녹음하기"
                >
                  다시 녹음하기
                </button>
                <p className="text-gray-400 text-sm">
                  잠시 후 다시 시도해 주시면 감사하겠습니다
                </p>
              </div>
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
                    role="status"
                    aria-label={`전체 점수: ${response.data.overall_score.toFixed(1)}점`}
                  >
                    {response.data.overall_score.toFixed(1)}
                  </div>
                  <p className="text-gray-400">100점 만점</p>
                </div>
              </div>

              {/* 메트릭 시각화 */}
              <div className="aspect-square w-full bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50">
                <h2 className="text-lg font-bold mb-4">메트릭 시각화</h2>
                <MetricsVisualizer
                  metrics={response.data.metrics}
                  colorScheme={selectedColor}
                  aria-label="음성 분석 메트릭 시각화"
                />
              </div>
            </div>

            {/* 상세 분석 결과 영역 */}
            <div className="lg:col-span-2">
              {/* 추천사항 카드 */}
              <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50 mb-8">
                <h2 className="text-lg font-bold mb-4">추천사항</h2>
                <div className="flex gap-6">
                  <div className="flex-1">
                    {response.data.recommendations?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2" role="list">
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
                      <div className="text-gray-300 text-center p-4 bg-emerald-500/10 rounded border border-emerald-500/30" role="status">
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
              <div className="mt-8 text-sm text-gray-400" role="status" aria-label={`처리 시간: ${response.data.processing_time_seconds.toFixed(3)}초`}>
                처리 시간: {response.data.processing_time_seconds.toFixed(3)}초
              </div>

              {/* 홈으로 가기 버튼 추가 */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50 transition-colors font-medium"
                  aria-label="학습하러 가기"
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
