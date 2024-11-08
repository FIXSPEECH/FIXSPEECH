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
  good: "#FFD700", // 양호
  poor: "#FF2D55", // 미흡
  unknown: "#9E9E9E", // 알 수 없음
};

// 음성 메트릭 카드 컴포넌트
const VoiceMetricCard = ({ name, data, criteria }: VoiceMetricCardProps) => {
  // 전체 값 표시 여부 상태
  const [showFullValue, setShowFullValue] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // 측정값 소수점 처리
  const formattedValue = showFullValue
    ? data.value.toFixed(3)
    : data.value.toFixed(3).replace(/\.?0+$/, "");

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/50 transition-colors">
      {/* 메트릭 제목과 등급 표시 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowInfo(!showInfo)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${gradeColors[data.grade]}15`,
            color: gradeColors[data.grade],
            textShadow: `0 0 10px ${gradeColors[data.grade]}`,
            border: `1px solid ${gradeColors[data.grade]}40`,
            boxShadow: `0 0 10px ${gradeColors[data.grade]}30`,
          }}
        >
          {data.grade.toUpperCase()}
        </span>
      </div>

      {showInfo && (
        <div className="mb-4 p-3 bg-gray-900/50 rounded-lg text-sm">
          <p className="text-gray-300 mb-2">{criteria.description}</p>
          <div className="space-y-1">
            <p className="text-emerald-400">최적: {criteria.excellent}</p>
            <p className="text-yellow-400">양호: {criteria.good}</p>
            <p className="text-red-400">미흡: {criteria.poor}</p>
          </div>
        </div>
      )}

      {/* 메트릭 상세 정보 */}
      <div className="space-y-2">
        {/* 측정값 표시 */}
        <div className="flex justify-between">
          <span className="text-gray-300">측정값:</span>
          <span
            className="text-white font-mono hover:text-cyan-300 transition-colors"
            onMouseEnter={() => setShowFullValue(true)}
            onMouseLeave={() => setShowFullValue(false)}
          >
            {formattedValue} {data.unit}
          </span>
        </div>

        {/* 참조 범위 표시 */}
        <div className="flex justify-between">
          <span className="text-gray-300">참조 범위:</span>
          <span className="text-white">{data.reference}</span>
        </div>

        {/* 해석 표시 */}
        <div className="mt-2 p-2 bg-gray-700/50 rounded text-white">
          {data.interpretation}
        </div>
      </div>
    </div>
  );
};

export default VoiceMetricCard;
