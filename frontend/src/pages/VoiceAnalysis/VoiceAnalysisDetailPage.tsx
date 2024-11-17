import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import VoiceMetricCard from "../../shared/components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../../shared/components/VoiceQuality/MetricsVisualizer";
import { METRIC_CRITERIA } from "../../shared/constants/voiceMetrics";
import GradientCirclePlanes from "../../shared/components/Loader/GradientCirclePlanes";
import useHistoryColorStore from "../../shared/stores/historyColorStore";

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
    recommendations:string[];
    overallScore:number;
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchAnalysisDetail = async () => {
      try {
        const response = await axiosInstance.get(`/record/${id}`);
        setAnalysisData(response.data.data);
        // 오디오 객체 생성
        const audioObj = new Audio(response.data.data.recordAddress);
        setAudio(audioObj);
      } catch (error) {
        setError("분석 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisDetail();
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

        {/* 오디오 플레이어 */}
        <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 mb-8 flex justify-between">
          <button
            onClick={handlePlayPause}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50 transition-colors"
          >
            {isPlaying ? "일시정지" : "음성 재생"}
          </button>
          <button
            onClick={() => navigate("/analysis")}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50 transition-colors"
          >
            목록으로 돌아가기
          </button>
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
                      (analysisData.analyzeResult.overallScore)
                    ).color,
                    textShadow: getScoreColor(analysisData.analyzeResult.overallScore
                    ).shadow,
                  }}
                >
                  {(
                    analysisData.analyzeResult.overallScore
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
            {/* recommendations */}
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50 mb-8">
              <h2 className="text-lg font-bold mb-4">추천사항</h2>
              <div className="flex gap-6">
                <div className="flex-1">
                  {analysisData.analyzeResult.recommendations?.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisData.analyzeResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-gray-300 p-2 rounded bg-gray-700/30 border border-gray-600/50">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-300 text-center p-4 bg-emerald-500/10 rounded border border-emerald-500/30">
                      <p className="mb-2 text-emerald-400">✨ 훌륭한 음성 품질을 보여주고 계십니다!</p>
                      <p className="text-emerald-300">현재의 좋은 발성을 유지하면서 더욱 자신감 있게 말씀해보세요.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
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
