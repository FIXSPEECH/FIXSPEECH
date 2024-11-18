// @ts-ignore
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip } from "react-tooltip";
import axiosInstance from "../../../services/axiosInstance";
import useHistoryColorStore from "../../../shared/stores/historyColorStore";
import {
  COLOR_SCHEMES,
  ColorSchemeType,
} from "../../../shared/constants/colorSchemes";
import { useEffect, useState } from "react";
import "./History.css";

interface GrassData {
  date: string | Date;
  count: number;
}

interface ApiResponse {
  status: string;
  data: GrassData[];
  message: string;
}

function History() {
  const [grassValues, setGrassValues] = useState<GrassData[]>([]);
  const [lastClickTime, setLastClickTime] = useState(0);
  const { selectedColor, setSelectedColor, toggleColorCycling } =
    useHistoryColorStore();

  const handleColorClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 300) {
      // 더블 클릭 감지 (300ms 이내)
      toggleColorCycling();
    } else {
      const colorKeys = Object.keys(COLOR_SCHEMES) as ColorSchemeType[];
      const currentIndex = colorKeys.findIndex((c) => c === selectedColor);
      const nextIndex = (currentIndex + 1) % colorKeys.length;
      setSelectedColor(colorKeys[nextIndex]);
    }
    setLastClickTime(now);
  };

  const fetchGrassData = async () => {
    try {
      // console.log("[GET] /grass API 요청");
      const response = await axiosInstance.get<ApiResponse>("/grass");
      // console.log("[GET] /grass API 응답:", response.data);

      if (response.data.status === "C000") {
        setGrassValues(response.data.data);
        // console.log("잔디 데이터 설정 완료:", response.data.data);
      } else {
        console.warn(
          "잔디 데이터 조회 실패 - 응답 코드:",
          response.data.status
        );
      }
    } catch (error) {
      console.error("잔디 데이터 조회 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchGrassData();
  }, []);

  return (
    <div
      className="relative w-2/3 mt-5 m-5 mx-auto px-[3%]"
      aria-hidden="true" 
      role="region" // aria-hidden 대신 적절한 role 부여
      aria-label="학습 기록 히트맵" // 히트맵의 목적 설명
    >
      {/* 색상 변경 버튼 */}
      <button
        onClick={handleColorClick}
        className="absolute top-0 left-5 p-1.5 text-xs rounded-full transition-all
          bg-gray-800/30 hover:bg-gray-700/30 border border-gray-700/50
          flex items-center gap-1.5 z-10"
        aria-label="히트맵 색상 변경 (더블 클릭으로 자동 변경)"
      >
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: COLOR_SCHEMES[selectedColor].baseColor,
          }}
          role="presentation" // 순수 시각적 요소임을 명시
        />
      </button>

      {/* 히트맵 컨테이너 */}
      <div 
        className="w-full aspect-[4/1]"
        role="presentation" // 순수 컨테이너임을 명시
      >
        <CalendarHeatmap
          tabIndex={-1}
          startDate={new Date(new Date().setMonth(new Date().getMonth() - 4))}
          endDate={new Date(new Date().setMonth(new Date().getMonth()))}
          values={grassValues}
          classForValue={(value: GrassData) => {
            if (!value || !value.count) {
              return "color-empty";
            }
            const count = value.count >= 5 ? 5 : value.count;
            return `color-scale-${selectedColor}-${count}`;
          }}
          tooltipDataAttrs={(value: GrassData) => ({
            "data-tooltip-id": "grass-tooltip",
            "data-tooltip-content":
              !value || !value.count
                ? "기록 없음"
                : `${
                    typeof value.date === "string"
                      ? value.date
                      : value.date.toISOString().split("T")[0]
                  }: ${value.count}회`,
          })}
          aria-label="학습 기록 달력 히트맵" // 히트맵 컴포넌트에 레이블 추가
        />
      </div>
      <Tooltip id="grass-tooltip" />
    </div>
  );
}

export default History;
