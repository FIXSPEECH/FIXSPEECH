import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../services/axiosInstance";
import MetricsVisualizer from "../../../shared/components/VoiceQuality/MetricsVisualizer";
import useHistoryColorStore from "../../../shared/stores/historyColorStore";
import { motion, AnimatePresence } from "framer-motion";

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
  const [currentMetricSet, setCurrentMetricSet] = useState(0);
  const navigate = useNavigate();
  const { selectedColor } = useHistoryColorStore();

  const allMetrics = [
    [
      "명료도(Clarity)",
      "강도 변동성(AMR)",
      "성대 떨림(Jitter)",
      "말의 리듬(Speech Rhythm)",
    ],
    [
      "멜로디 지수(Melody Index)",
      "속도 변동성(Rate Variability)",
      "발화의 에너지(Utterance Energy)",
      "억양 패턴 일관성 (Intonation Pattern Consistency)",
    ],
  ];

  const currentMetrics = allMetrics[currentMetricSet];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = useCallback(
    (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
      setCurrentMetricSet((prev) => (prev + 1) % allMetrics.length);
    },
    [page]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [paginate]);

  const fetchVoiceData = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>("/record/recent");
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

  return (
    <div className="mx-[2%] overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 rounded-xl p-3">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                최근 목소리 분석
              </h2>
              <p className="text-gray-400 text-sm">
                {voiceData
                  ? new Date(voiceData.createdAt).toLocaleDateString()
                  : "분석 기록 없음"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400/50 mb-1">
                  {voiceData ? getOverallScore() : "--"}점
                </div>
                <p className="text-gray-400 text-xs">종합 점수</p>
              </div>
              <button
                onClick={() =>
                  voiceData && navigate(`/analysis/${voiceData.recordId}`)
                }
                className={`text-blue-400 transition-colors ${
                  voiceData
                    ? "hover:text-blue-300"
                    : "opacity-50 cursor-not-allowed"
                }`}
                title={voiceData ? "자세히 보기" : "분석 결과 없음"}
                disabled={!voiceData}
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

          <div className="flex flex-col sm:flex-row gap-8">
            <div className="w-full sm:w-1/3 aspect-square hidden sm:block">
              {voiceData ? (
                <MetricsVisualizer
                  metrics={voiceData.analyzeResult?.metrics || {}}
                  showLabels={false}
                  colorScheme={selectedColor}
                />
              ) : (
                <div
                  className="w-full h-full rounded-lg bg-gray-800/30 
                  border border-gray-700/50 flex items-center justify-center"
                >
                  <p className="text-gray-400 text-sm text-center px-4">
                    레이더 차트가 여기에 표시됩니다
                  </p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-2/3">
              <div className="relative h-[220px] overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentMetricSet}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(_e, { offset, velocity }) => {
                      const swipe = swipePower(offset.x, velocity.x);
                      if (swipe < -swipeConfidenceThreshold) {
                        paginate(1);
                      } else if (swipe > swipeConfidenceThreshold) {
                        paginate(-1);
                      }
                    }}
                    className="absolute w-full grid grid-cols-2 gap-4"
                  >
                    {currentMetrics.map((metricKey, index) => (
                      <motion.div
                        key={metricKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800/30 backdrop-blur-sm p-3 rounded-lg 
                          shadow-lg border border-gray-700/50 hover:border-cyan-500/50
                          transform transition-all duration-500 ease-in-out"
                      >
                        <h3 className="text-gray-400 text-xs mb-2">
                          {metricKey.split("(")[0]}
                        </h3>
                        {voiceData ? (
                          <>
                            <div
                              className={`text-lg font-semibold ${
                                voiceData.analyzeResult?.metrics?.[metricKey]
                                  ?.grade === "excellent"
                                  ? "text-green-400"
                                  : voiceData.analyzeResult?.metrics?.[
                                      metricKey
                                    ]?.grade === "good"
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {voiceData.analyzeResult?.metrics?.[
                                metricKey
                              ]?.value?.toFixed(1) || "0.0"}{" "}
                              {voiceData.analyzeResult?.metrics?.[metricKey]
                                ?.unit || ""}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {voiceData.analyzeResult?.metrics?.[metricKey]
                                ?.interpretation || ""}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="text-lg font-semibold text-gray-500">
                              -- {/* placeholder for value */}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              지표 결과가 표시됩니다
                            </p>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentVoice;
