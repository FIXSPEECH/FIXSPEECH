// NotificationListener.tsx
import { useEffect } from "react";
import { toast } from "react-toastify";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useNavigate } from "react-router-dom";
import { useSSEStore } from "../stores/sseStore";
import useAuthStore from "../stores/authStore";

const NotificationListener = () => {
  const { isSSEActive, stopSSE, setAlert, message, type, clearAlert } = useSSEStore();
  const token = useAuthStore.getState().token;
  const navigator = useNavigate();

  useEffect(() => {
    if (!isSSEActive || !token) return;

    // SSE 연결 설정
    const eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_API_URL}/notifications/subscribe`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );

    console.log("SSE 연결 시작");

    // "analysisComplete" 이벤트 수신 시 알림 표시
    eventSource.addEventListener("analysisComplete", (event: any) => {
      const data = JSON.parse(event.data);
      if (data.type === "Analyze Complete") {
        setAlert("분석이 완료되었습니다. 지금 보기", "success");
      } else if (data.type === "ANALYSIS_ERROR") {
        setAlert(`에러: ${data.message}`, "error");
      }

      // 이벤트 수신 후 SSE 연결 종료
      console.log("SSE 이벤트 수신 완료 후 연결 닫기");
      eventSource.close();
      stopSSE();
    });

    // 에러 발생 시 SSE 연결 종료
    eventSource.onerror = () => {
      console.log("SSE 연결 에러 발생 - 연결 닫기");
      eventSource.close();
      setAlert("SSE 연결 오류가 발생했습니다.", "error");
      stopSSE();
    };

    return () => {
      console.log("SSE 연결 종료");
      eventSource.close();
    };
  }, [isSSEActive, token, setAlert, stopSSE]);

  // 알림 표시
  useEffect(() => {
    if (message) {
      if (type === "success") toast.success(message);
      if (type === "error") toast.error(message);
      clearAlert();
    }
  }, [message, type, clearAlert]);

  return null;
};

export default NotificationListener;
