import { useState } from "react";

// 음성 메트릭 데이터 타입 정의
interface MetricData {
  value: number; // 측정값
  grade: "excellent" | "good" | "poor" | "unknown"; // 등급
  unit: string; // 단위
  reference: string; // 참조 범위
  interpretation: string; // 해석
}

// 메트릭 평가 기준 정의
interface MetricCriteria {
  excellent: string;
  good: string;
  poor: string;
  description: string;
}

// 컴포넌트 Props 타입 정의
interface VoiceMetricCardProps {
  name: string; // 메트릭 이름
  data: MetricData; // 메트릭 데이터
  criteria: MetricCriteria;
}

// 등급별 색상 정의
const gradeColors = {
  excellent: "#00FF88", // 우수
  good: "#FFEB3B", // 양호
  poor: "#FF4444", // 미흡
  unknown: "#9E9E9E", // 알 수 없음
};

// 음성 메트릭 카드 컴포넌트
const VoiceMetricCard = ({ name, data, criteria }: VoiceMetricCardProps) => {
  const [showCriteria, setShowCriteria] = useState(true);

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 hover:border-cyan-500/50" role="article">
      {/* 상단: 제목과 등급 */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-bold">{name}</h3>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          role="status"
          style={{
            backgroundColor: `${gradeColors[data.grade]}15`,
            color: gradeColors[data.grade],
            textShadow: `0 0 10px ${gradeColors[data.grade]}`,
            border: `1px solid ${gradeColors[data.grade]}40`,
            boxShadow: `0 0 10px ${gradeColors[data.grade]}30`,
          }}
        >
          {data.grade === "excellent"
            ? "EXCELLENT"
            : data.grade === "good"
            ? "GOOD"
            : data.grade === "poor"
            ? "POOR"
            : "UNKNOWN"}
        </span>
      </div>

      {/* 측정값과 해석 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-2xl font-bold">{data.value.toFixed(3)}</span>
            <span className="text-gray-400 ml-1">{data.unit}</span>
          </div>
          <span className="text-gray-300">{data.interpretation}</span>
        </div>
      </div>

      {/* 하단: 설명, 기준 */}
      <div className="space-y-3 text-sm">
        <p className="text-gray-400">{criteria.description}</p>

        <div>
          <button
            onClick={() => setShowCriteria(!showCriteria)}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            aria-expanded={showCriteria}
            aria-controls="criteria-section"
          >
            <span>{showCriteria ? "기준 숨기기" : "기준 보기"}</span>
            <span aria-hidden="true">{showCriteria ? "▼" : "▶"}</span>
          </button>

          {showCriteria && (
            <div 
              id="criteria-section"
              className="mt-2 space-y-2 bg-gray-900/30 p-3 rounded"
            >
              <p className="text-emerald-400">최상: {criteria.excellent}</p>
              <p className="text-yellow-400">양호: {criteria.good}</p>
              <p className="text-red-400">개선 필요: {criteria.poor}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMetricCard;
