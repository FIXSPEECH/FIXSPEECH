// NotificationListener.tsx
import { useEffect } from "react";
import { toast } from "react-toastify";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useNavigate } from "react-router-dom";
import { useSSEStore } from "../stores/sseStore";
import useAuthStore from "../stores/authStore";
import notificationSound from "../sounds/notificationSound.mp3";

const NotificationListener = () => {
  const { isSSEActive, stopSSE, setAlert, message, type, clearAlert } =
    useSSEStore();
  const token = useAuthStore.getState().token;
  const navigator = useNavigate();

  const playNotificationSound = () => {
    const audio = new Audio(notificationSound);
    audio.play().catch((_error) => {
      // console.log("사운드 재생 오류:", _error);
    });
  };

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

    // console.log("SSE 연결 시작");

    // "analysisComplete" 이벤트 수신 시 알림 표시
    eventSource.addEventListener("analysisComplete", (event: any) => {
      const data = JSON.parse(event.data);
      if (data.type === "Analyze Complete") {
        playNotificationSound();
        toast.success(
          <>
            분석 완료되었습니다.
            <br />
            <span
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() =>
                navigator(`/situation/voice/result/${data.data.resultId}`)
              }
            >
              지금가기
            </span>
          </>
        );
      } else if (data.type === "ANALYSIS_ERROR") {
        playNotificationSound();
        toast.error(`분석 중 오류가 발생했습니다`);
      }

      // 이벤트 수신 후 SSE 연결 종료
      // console.log("SSE 이벤트 수신 완료 후 연결 닫기");
      eventSource.close();
      stopSSE();
    });

    // 에러 발생 시 SSE 연결 종료
    eventSource.onerror = () => {
      // console.log("SSE 연결 에러 발생 - 연결 닫기");
      eventSource.close();
      setAlert("분석 중 오류가 발생했습니다", "error");
      stopSSE();
    };

    return () => {
      // console.log("SSE 연결 종료");
      eventSource.close();
    };
  }, [isSSEActive, token, setAlert, stopSSE]);

  // 알림 표시
  useEffect(() => {
    if (message) {
      playNotificationSound();
      if (type === "success") toast.success(message);
      if (type === "error") toast.error(message);
      clearAlert();
    }
  }, [message, type, clearAlert]);

  return null;
};

export default NotificationListener;
