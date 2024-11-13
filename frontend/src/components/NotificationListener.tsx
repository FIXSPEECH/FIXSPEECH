import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationListener = () => {
  useEffect(() => {
    // SSE 구독 시작
    const eventSource = new EventSource('/notifications/subscribe');

    // "analysisComplete" 이벤트 수신
    eventSource.addEventListener('analysisComplete', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'Analyze Complete') {
        toast.success(`알림: ${data.message}`);
      } else if (data.type === 'ANALYSIS_ERROR') {
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
