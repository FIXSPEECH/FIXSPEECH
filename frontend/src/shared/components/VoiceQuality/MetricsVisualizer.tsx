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
import { COLOR_SCHEMES, ColorSchemeType } from "../../constants/colorSchemes";

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
  showLabels?: boolean;
  colorScheme?: ColorSchemeType;
}

/**
 * 음성 품질 메트릭을 레이더 차트로 시각화하는 컴포넌트
 */
const MetricsVisualizer = ({
  metrics,
  showLabels = true,
  colorScheme = "blue",
}: MetricsVisualizerProps) => {
  if (!metrics) return null;

  const colors = COLOR_SCHEMES[colorScheme];

  // 등급을 수치화하는 함수
  const gradeToValue = (grade: string) => {
    switch (grade) {
      case "excellent":
        return 1; // 100%
      case "good":
        return 0.75; // 75%
      case "poor":
        return 0.35; // 35%
      default:
        return 0;
    }
  };

  // 차트 데이터 구성
  const chartData = {
    // response에서 메트릭 이름을 한글만 표시
    labels: Object.keys(metrics).map((label) => label.replace(/\s*\(.*\)/, "")),
    datasets: [
      {
        label: "성능 지표",
        data: Object.values(metrics).map((m) => gradeToValue(m.grade)),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
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
          display: showLabels,
          font: {
            size: 10,
          },
          color: "#FFFFFF",
        },
        min: 0,
        max: 1,
        beginAtZero: true,
        ticks: {
          display: showLabels,
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
