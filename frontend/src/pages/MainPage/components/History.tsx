// @ts-ignore
import CalendarHeatmap from "react-calendar-heatmap";
import "../../../styles/MainPage/History.css";
import { useEffect, useState } from "react";
import axiosInstance from "../../../services/axiosInstance";
import { Tooltip } from "react-tooltip";

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

  // 잔디 데이터 조회 함수
  const fetchGrassData = async () => {
    try {
      console.log("[GET] /grass API 요청");
      const response = await axiosInstance.get<ApiResponse>("/grass");
      console.log("[GET] /grass API 응답:", response.data);

      if (response.data.status === "C000") {
        setGrassValues(response.data.data);
        console.log("잔디 데이터 설정 완료:", response.data.data);
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
      style={{ marginLeft: "3%", marginRight: "3%" }}
      className="mt-5 mb-10"
      aria-hidden="true" // 스크린 리더가 읽지 않도록 설정
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
          const color = "green";
          const count = value.count >= 5 ? 5 : value.count;
          return `color-scale-${color}-${count}`;
        }}
        tooltipDataAttrs={(value: GrassData) => {
          if (!value || !value.count) {
            return {
              "data-tooltip-id": "grass-tooltip",
              "data-tooltip-content": "기록 없음",
            };
          }
          const date =
            typeof value.date === "string"
              ? value.date
              : value.date.toISOString().split("T")[0];
          return {
            "data-tooltip-id": "grass-tooltip",
            "data-tooltip-content": `${date}: ${value.count}회`,
          };
        }}
      />
      <Tooltip id="grass-tooltip" />
    </div>
  );
}

export default History;
