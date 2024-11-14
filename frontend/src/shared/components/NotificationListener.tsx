import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EventSourcePolyfill } from "event-source-polyfill"; // Polyfill import
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";

const NotificationListener = () => {
  const navigator = useNavigate();
  const token = useAuthStore.getState().token; // 토큰 가져오기

  useEffect(() => {
    if (!token) return; // 토큰이 없으면 SSE 연결을 하지 않음

    console.log("SSE 구독 시작");

    // SSE 구독 시작 - Authorization 헤더 포함
    const eventSource = new EventSourcePolyfill(`${import.meta.env.VITE_API_URL}/notifications/subscribe`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    // "analysisComplete" 이벤트 수신
    eventSource.addEventListener("analysisComplete", (event: any) => {
      console.log("event.data:",event.data)
      const data = JSON.parse(event.data);
      if (data.type === "Analyze Complete") {
        toast.success(
          <>
            분석이 완료되었습니다.
            <br />
            <span style={{ textDecoration: "underline", cursor: "pointer" }}>
              지금 보기
            </span>
          </>,
          {
            onClick: () => {
              navigator("/situation/result");
            },
          }
        );
      } else if (data.type === "ANALYSIS_ERROR") {
        toast.error(`에러: ${data.message}`);
      }
    });

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      eventSource.close();
    };
  }, [token]); // token이 변경될 때마다 useEffect 실행

  return <ToastContainer />;
};

export default NotificationListener;
