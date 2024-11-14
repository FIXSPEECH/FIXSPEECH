import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../services/axiosInstance";
import MetricsVisualizer from "../../../shared/components/VoiceQuality/MetricsVisualizer";
import useHistoryColorStore from "../../../shared/stores/historyColorStore";

interface Metric {
  unit: string;
  grade: "excellent" | "good" | "poor";
  value: number;
  reference: string;
  interpretation: string;
}

interface VoiceData {
  analyzeResult: {
    metrics: {
      [key: string]: Metric;
    };
  };
  title: string;
  recordAddress: string;
  recordId: number;
  createdAt: string;
}

interface ApiResponse {
  status: string;
  data: VoiceData;
  message: string;
}

function RecentVoice() {
  const [voiceData, setVoiceData] = useState<VoiceData | null>(null);
  const navigate = useNavigate();
  const { selectedColor } = useHistoryColorStore();

  const fetchVoiceData = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>("/record/8");
      if (response.data.status === "C000") {
        setVoiceData(response.data.data);
      }
    } catch (error) {
      console.error("음성 데이터 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchVoiceData();
  }, []);

  const getOverallScore = () => {
    if (!voiceData?.analyzeResult?.metrics) return 0;

    const metrics = voiceData.analyzeResult.metrics;
    const gradePoints = {
      excellent: 3,
      good: 2,
      poor: 1,
    };

    const total = Object.values(metrics).reduce(
      (sum, metric) => sum + gradePoints[metric?.grade || "poor"],
      0
    );

    return Math.round((total / (Object.keys(metrics).length * 3)) * 100);
  };

  const keyMetrics = [
    "명료도(Clarity)",
    "멜로디 지수(Melody Index)",
    "발화의 에너지(Utterance Energy)",
  ];

  return (
    <div className="mx-[3%] 5">
      {!voiceData ? (
        <div className="text-center  text-gray-400 py-8 border rounded-xl">
          <p className="mb-4">최근 분석한 목소리의 결과가 여기에 표시됩니다.</p>
          <p className="text-sm">아직 분석된 목소리가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="flex  flex-col md:flex-row gap-6 rounded-xl p-3">
            <div className="flex-1">
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      최근 목소리 분석
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {new Date(
                        voiceData.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-400 mb-1">
                        {getOverallScore()}점
                      </div>
                      <p className="text-gray-400 text-xs">종합 점수</p>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/analysis/${voiceData.recordId}`)
                      }
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="자세히 보기"
                    >
                      <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M9 5l7 7-7 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex grid-cols-3 gap-8">
                <div className="w-full md:w-1/3 aspect-square col-span-1">
                  <MetricsVisualizer
                    metrics={voiceData.analyzeResult?.metrics || {}}
                    showLabels={false}
                    colorScheme={selectedColor}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 col-span-2 md:h-1/3">
                  {keyMetrics.map((metricKey) => {
                    const metric =
                      voiceData.analyzeResult?.metrics?.[metricKey];
                    return (
                      <div
                        key={metricKey}
                        className="bg-gray-800/30 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50"
                      >
                        <h3 className="text-gray-400 text-xs mb-2">
                          {metricKey.split("(")[0]}
                        </h3>
                        <div
                          className={`text-lg font-semibold ${
                            metric?.grade === "excellent"
                              ? "text-green-400"
                              : metric?.grade === "good"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {metric?.value?.toFixed(1) || "0.0"}{" "}
                          {metric?.unit || ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RecentVoice;
