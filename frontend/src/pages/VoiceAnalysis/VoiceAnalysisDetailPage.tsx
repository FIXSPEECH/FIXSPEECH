import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import VoiceMetricCard from "../../shared/components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../../shared/components/VoiceQuality/MetricsVisualizer";
import { METRIC_CRITERIA } from "../../shared/constants/voiceMetrics";
import GradientCirclePlanes from "../../shared/components/Loader/GradientCirclePlanes";
import useHistoryColorStore from "../../shared/stores/historyColorStore";
import { Canvas } from "@react-three/fiber";
import AudioCubeVisualizer from "../../shared/components/Visualizer/AudioCubeVisualizer";

interface AnalysisDetailResponse {
  analyzeResult: {
    metrics: {
      [key: string]: {
        unit: string;
        grade: "excellent" | "good" | "poor";
        value: number;
        reference: string;
        interpretation: string;
      };
    };
  };
  title: string;
  recordAddress: string;
  recordId: number;
  createdAt: string;
}

const VoiceAnalysisDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] =
    useState<AnalysisDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { selectedColor } = useHistoryColorStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchAnalysisDetail = async () => {
      try {
        const response = await axiosInstance.get(`/record/${id}`);
        setAnalysisData(response.data.data);

        // 오디오 객체 생성 및 설정
        const audioObj = new Audio(response.data.data.recordAddress);
        audioObj.crossOrigin = "anonymous"; // CORS 설정
        setAudio(audioObj);
        audioRef.current = audioObj;

        // AudioContext 설정
        const context = new AudioContext();
        const audioSource = context.createMediaElementSource(audioObj);
        const audioAnalyser = context.createAnalyser();

        audioSource.connect(audioAnalyser);
        audioAnalyser.connect(context.destination);

        setAudioContext(context);
        setAnalyser(audioAnalyser);
      } catch (error) {
        setError("분석 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisDetail();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [id]);

  const handlePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 점수에 따른 색상 및 그림자 효과
  const getScoreColor = (score: number) => {
    if (score >= 80)
      return { color: "#00FF88", shadow: "0 0 20px rgba(0, 255, 136, 0.5)" };
    if (score >= 60)
      return { color: "#FFD700", shadow: "0 0 20px rgba(255, 215, 0, 0.5)" };
    return { color: "#FF4D4D", shadow: "0 0 20px rgba(255, 77, 77, 0.5)" };
  };

  // 점수 계산 함수 추가
  const calculateOverallScore = (
    metrics: AnalysisDetailResponse["analyzeResult"]["metrics"]
  ) => {
    const grades = Object.values(metrics).map((m) => m.grade);
    const excellent = grades.filter((g) => g === "excellent").length;
    const good = grades.filter((g) => g === "good").length;

    return (excellent * 100 + good * 70) / grades.length;
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <GradientCirclePlanes />
        <p className="mt-8 text-white text-lg">분석 데이터를 불러오는 중...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/analysis")}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );

  if (!analysisData) return null;

  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{analysisData.title}</h1>
          <span className="text-gray-400">{analysisData.createdAt}</span>
        </div>

        {/* 오디오 플레이어 섹션에 Visualizer 추가 */}
        <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50 transition-colors"
            >
              {isPlaying ? "일시정지" : "음성 재생"}
            </button>

            {/* Visualizer 캔버스 */}
            <div className="h-12 w-12 bg-gray-900/30 rounded-lg overflow-hidden">
              <Canvas>
                <AudioCubeVisualizer
                  analyser={analyser}
                  isPlaying={isPlaying}
                />
              </Canvas>
            </div>

            <button
              onClick={() => navigate("/analysis")}
              className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50 transition-colors ml-auto"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽 사이드바 */}
          <div className="lg:col-span-1 space-y-8">
            {/* 전체 평가 카드 */}
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
              <h2 className="text-lg font-bold mb-4">전체 점수</h2>
              <div className="text-center">
                <div
                  className="text-6xl font-bold mb-2"
                  style={{
                    color: getScoreColor(
                      calculateOverallScore(analysisData.analyzeResult.metrics)
                    ).color,
                    textShadow: getScoreColor(
                      calculateOverallScore(analysisData.analyzeResult.metrics)
                    ).shadow,
                  }}
                >
                  {calculateOverallScore(
                    analysisData.analyzeResult.metrics
                  ).toFixed(1)}
                </div>
                <p className="text-gray-400">100점 만점</p>
              </div>
            </div>

            {/* 메트릭 시각화 */}
            <div className="aspect-square w-full bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50">
              <h2 className="text-lg font-bold mb-4">메트릭 시각화</h2>
              <MetricsVisualizer
                metrics={analysisData.analyzeResult.metrics}
                colorScheme={selectedColor}
              />
            </div>
          </div>

          {/* 상세 분석 결과 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysisData.analyzeResult.metrics).map(
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAnalysisDetailPage;
