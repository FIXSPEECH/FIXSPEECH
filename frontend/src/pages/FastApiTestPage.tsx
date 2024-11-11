import { useState } from "react";
import VoiceMetricCard from "../components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../components/VoiceQuality/MetricsVisualizer";
import useAuthStore from "../store/authStore";
import AudioRecorder from "../components/VoiceQuality/AudioRecorder";

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

// FastApiTestPage 컴포넌트 정의
const FastApiTestPage = () => {
  // 상태 관리를 위한 useState 훅 사용
  const [response, setResponse] = useState<AnalysisResponse | null>(null); // API 응답 데이터
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 선택된 파일
  const userGender = useAuthStore((state) => state.userProfile?.gender); // 사용자 성별 정보

  // 파일 시스템 권한 체크
  const checkPermissions = async () => {
    try {
      // 마이크 권한 요청
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
          console.error("Microphone permission denied:", e);
          setError(
            "마이크 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요."
          );
          return false;
        }
      }

      // 파일 시스템 접근 권한 (모바일에서는 파일 선택 API 사용)
      if ("showOpenFilePicker" in window) {
        try {
          const opts = {
            types: [
              {
                description: "Audio Files",
                accept: {
                  "audio/wav": [".wav"],
                },
              },
            ],
            multiple: false,
          };
          await (window as any).showOpenFilePicker(opts);
        } catch (e) {
          // 사용자가 취소한 경우는 무시
          if (e.name !== "AbortError") {
            console.warn("File system access not available:", e);
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Permission check failed:", error);
      setError(
        "필요한 권한을 확인할 수 없습니다. 브라우저 설정을 확인해주세요."
      );
      return false;
    }
  };

  // 파일 선택 핸들러 수정
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hasPermissions = await checkPermissions();
    if (!hasPermissions) return;

    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResponse(null);
    }
  };

  // 녹음 완료 핸들러
  const handleRecordingComplete = (audioFile: File) => {
    setSelectedFile(audioFile);
    setError(null);
    setResponse(null);
  };

  // 파일 제출 및 분석 요청 핸들러 수정
  const handleSubmit = async () => {
    if (!selectedFile || !userGender) return;

    const hasPermissions = await checkPermissions();
    if (!hasPermissions) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("gender", userGender);

    const apiUrl = `${import.meta.env.VITE_FASTAPI_URL}/analyze/full`;

    try {
      // API 요청 로깅
      console.log("[API Request]", {
        url: apiUrl,
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          file: {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
          },
          gender: userGender,
        },
        timestamp: new Date().toISOString(),
      });

      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      // 응답 로깅
      console.log("[API Response]", {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        server: res.headers.get("server"), // NGINX 서버 확인
        timestamp: new Date().toISOString(),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          status: "error",
          message: res.statusText,
          code: res.status,
        }));

        console.error("[API Error]", {
          ...errorData,
          status: res.status,
          headers: Object.fromEntries(res.headers.entries()),
          timestamp: new Date().toISOString(),
        });

        let errorMessage = "알 수 없는 오류가 발생했습니다.";

        // NGINX 관련 오류 처리
        if (res.status === 502) {
          errorMessage = "서버가 일시적으로 응답하지 않습니다. (Bad Gateway)";
        } else if (res.status === 504) {
          errorMessage = "서버 응답 시간이 초과되었습니다. (Gateway Timeout)";
        } else if (res.status === 413) {
          errorMessage = "파일 크기가 너무 큽니다. (NGINX 제한)";
        } else if (errorData.code === "INVALID_FILE_TYPE") {
          errorMessage = "올바른 WAV 파일이 아닙니다.";
        } else if (errorData.code === "PROCESSING_ERROR") {
          errorMessage = `음성 분석 중 오류가 발생했습니다: ${errorData.detail}`;
        } else if (errorData.code === "INTERNAL_SERVER_ERROR") {
          errorMessage = `서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n상세: ${
            errorData.error_details || errorData.detail
          }`;
        } else if (res.status === 403) {
          errorMessage = "접근 권한이 없습니다.";
        }

        // CORS 오류 감지
        if (
          errorData.message?.includes("CORS") ||
          !res.headers.get("access-control-allow-origin")
        ) {
          errorMessage =
            "CORS 설정 오류가 발생했습니다. 관리자에게 문의해주세요.";
          console.error("[CORS Error]", {
            headers: Object.fromEntries(res.headers.entries()),
            origin: window.location.origin,
            timestamp: new Date().toISOString(),
          });
        }

        setError(`${errorMessage}\n(상태 코드: ${res.status})`);
        return;
      }

      const data = await res.json();
      console.log("[API Success]", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      setResponse(data);
    } catch (err) {
      console.error("[Request Error]", {
        error: err,
        browser: navigator.userAgent,
        platform: navigator.platform,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        url: apiUrl,
        timestamp: new Date().toISOString(),
        networkInfo: {
          type: (navigator as any).connection?.type,
          effectiveType: (navigator as any).connection?.effectiveType,
          downlink: (navigator as any).connection?.downlink,
        },
      });

      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError(
          `요청 처리 중 오류가 발생했습니다: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // UI 렌더링
  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">음성 분석</h1>

        {/* 예시 문장 섹션 추가 */}
        <div className="mb-6 p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50">
          <h2 className="text-lg font-semibold mb-2">📢 예시 문장</h2>
          <p className="text-gray-300">
            "안녕하세요. 오늘은 날씨가 정말 좋네요. 이런 날에는 산책하기가 참
            좋습니다."
          </p>
          <p className="text-sm text-gray-400 mt-2">
            ℹ️ 위 문장을 편안한 목소리로 읽어서 녹음해주세요.
          </p>
        </div>

        {/* 파일 입력과 녹음 버튼 섹션 */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 items-center">
            <input
              type="file"
              accept=".wav"
              onChange={handleFileSelect}
              className="bg-gray-800/30 p-2 rounded"
              disabled={!userGender}
            />
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              disabled={!userGender}
            />
          </div>

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

        {/* 분석 시작 버튼 */}
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
                {/* 전체 점수를 메트릭 시각화 위로 이동 */}
                <div className="mb-4 bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50">
                  <h2 className="text-lg font-bold mb-2">전체 점수</h2>
                  <div className="flex items-center justify-center">
                    <div
                      className="text-4xl font-bold"
                      style={{
                        color: getScoreColor(response.data.overall_score).color,
                        textShadow: getScoreColor(response.data.overall_score)
                          .shadow,
                      }}
                    >
                      {response.data.overall_score}점
                    </div>
                  </div>
                </div>

                {/* 메트릭 시각화 */}
                <div className="aspect-square w-full bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50">
                  <h2 className="text-lg font-bold mb-4">메트릭 시각화</h2>
                  <MetricsVisualizer metrics={response.data.metrics} />
                </div>
              </div>
            </div>

            {/* 상세 분석 결과 영역 */}
            <div className="lg:w-2/3 ">
              {/* 전체 점수와 추천사항 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 "></div>
              {/* 개별 메트릭 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 추천사항 카드 */}
                <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50">
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
