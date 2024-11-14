import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EventSourcePolyfill } from "event-source-polyfill"; // Polyfill import
import useAuthStore from "../stores/authStore";

const NotificationListener = () => {
  useEffect(() => {
    // 토큰 가져오기
    const token = useAuthStore.getState().token;

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
      const data = JSON.parse(event.data);
      if (data.type === "Analyze Complete") {
        toast.success(`${data.message}`);
      } else if (data.type === "ANALYSIS_ERROR") {
        toast.error(`에러: ${data.message}`);
      }
    });

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      eventSource.close();
    };
  }, []);

  return <ToastContainer />;
};

export default NotificationListener;
