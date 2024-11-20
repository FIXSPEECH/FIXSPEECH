import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Script from "./components/Script";
import Timer from "./components/Timer";
import Recorder from "../../shared/components/Recorder";
import { ScriptGet } from "../../services/SituationPractice/SituationPracticeGet";
import useModalStore from "../../shared/stores/modalStore";
import useVoiceStore from "../../shared/stores/voiceStore";
import { ScriptVoicePost } from "../../services/SituationPractice/SituationPracticePost";
import Swal from "sweetalert2";
import { useSSEStore } from "../../shared/stores/sseStore"; // SSE 상태 관리 스토어 임포트
import "./SwalStyles.css";

interface Data {
  title: string;
  content: string;
  accent: string;
  second: number;
  createdAt: string;
}

function SituationPractice() {
  const { scriptId } = useParams();
  const Id = Number(scriptId);
  const [data, setData] = useState<Data>();
  const { isModal, setIsModal } = useModalStore();
  const { audioBlob } = useVoiceStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("");

  const { startSSE, stopSSE } = useSSEStore(); // SSE 시작 및 종료 함수

  // console.log("id 타입", typeof Id);

  // postVoice 함수: 오디오 업로드 및 SSE 연결 활성화
  const postVoice = async () => {
    if (!audioBlob) {
      console.error("Audio blob is null");
      return;
    }

    // SSE 연결 시작
    startSSE();

    // 현재 시간을 이용해 고유한 파일명 생성
    const timestamp = new Date().getTime();
    const filename = `recording_${timestamp}.wav`;

    const file = new File([audioBlob], filename, {
      type: "audio/wav",
    });

    const formData = new FormData();
    formData.append("record", file);

    try {
      const response = await ScriptVoicePost(formData, Id);

      // 응답 상태 설정
      setStatus(response.status);
    } catch (_e) {
      // console.log(e);
      stopSSE(); // 오류 발생 시 SSE 종료
    }
  };

  // 모달 창이 열렸을 때 postVoice 실행
  useEffect(() => {
    if (isModal) {
      postVoice();
    }
  }, [isModal]);

  // 응답 상태가 성공일 경우 알림 표시 및 페이지 이동
  useEffect(() => {
    if (status === "C000") {
      Swal.fire({
        title: "대본 연습이 전송되었습니다.",
        text: "분석 완료 시 알려드리겠습니다.",
        showDenyButton: false,
        confirmButtonText: "확인",
        customClass: {
          confirmButton: "swal2-confirm-btn",
        },
        buttonsStyling: false,
      }).then(() => {
        setStatus("");
        setIsModal(false);
        navigate("/situation");
      });
    }
  }, [status]);

  // scriptId에 따라 데이터 가져오기
  useEffect(() => {
    const PracticeContent = async () => {
      try {
        const response = await ScriptGet(Id);
        if (response.status === "C000") {
          setData(response.data);
        }
      } catch (_e) {
        // console.log(e);
      }
    };

    PracticeContent();
  }, [Id]);

  return (
    <div className="flex min-h-[80vh] items-center" role="main">
      {data ? (
        <>
          <Script content={data.content} />
          <div className="flex-col w-2/5 justify-center align-middle">
            <Timer seconds={data.second} />
            <Recorder
              color={"#FFAB01"} 
              barColor={"rgb(239,204,135)"}
              width={200}
              height={60}
              visualizeWidth="200px"
              modalType="regist"
              aria-label="음성 녹음"
              beforeRecordText={`*마이크를 눌러 녹음을 시작해주세요.`}
              recordingText={`*마이크를 눌러 녹음을 완료해주세요.`}
            />
          </div>
        </>
      ) : (
        <div role="status" aria-live="polite">Loading...</div> // 데이터 로딩 중에 표시될 내용
      )}
    </div>
  );
}

export default SituationPractice;
