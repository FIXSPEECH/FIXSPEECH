import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

// Chart.js 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// 메트릭 데이터 타입 정의
interface MetricData {
  value: number;
  grade: "excellent" | "good" | "poor" | "unknown";
  unit: string;
  reference: string;
  interpretation: string;
}

// 컴포넌트 Props 타입 정의
interface MetricsVisualizerProps {
  metrics: Record<string, MetricData>;
}

/**
 * 음성 품질 메트릭을 레이더 차트로 시각화하는 컴포넌트
 */
const MetricsVisualizer = ({ metrics }: MetricsVisualizerProps) => {
  if (!metrics) return null;

  // 등급을 수치화하는 함수
  const gradeToValue = (grade: string) => {
    switch (grade) {
      case "excellent":
        return 1;
      case "good":
        return 0.7;
      case "poor":
        return 0.3;
      default:
        return 0;
    }
  };

  // 차트 데이터 구성
  const chartData = {
    labels: Object.keys(metrics),
    datasets: [
      {
        label: "성능 지표",
        data: Object.values(metrics).map((m) => gradeToValue(m.grade)),
        backgroundColor: "rgba(77, 255, 219, 0.2)",
        borderColor: "#4DFFDB",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // 차트 옵션 설정
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        angleLines: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        pointLabels: {
          display: false,
        },
        min: 0,
        max: 1,
        beginAtZero: true,
        ticks: {
          color: "#FFFFFF",
          backdropColor: "transparent",
          stepSize: 0.2,
          max: 1,
          min: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: { dataIndex: number; label: string }) {
            const grade = Object.values(metrics)[context.dataIndex].grade;
            return `${context.label}: ${grade}`;
          },
        },
      },
    },
  };

  return (
    <div className="aspect-square w-full">
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default MetricsVisualizer;