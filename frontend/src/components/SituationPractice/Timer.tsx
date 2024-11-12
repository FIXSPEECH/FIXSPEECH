import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RegistModal from './RegistModal'
import useVoiceStore from "../../store/voiceStore";
import useTimerStore from "../../store/timerStore";

interface Timer{
  seconds: number
}

function Timer({seconds}: Timer) {
  const {setIsRecording, isRecording} = useVoiceStore();
  const {resetTimer, setResetTimer} = useTimerStore();
  const [timeLeft, setTimeLeft] = useState(seconds); // 초기 시간 5:00 (300초)
  const [progress, setProgress] = useState(100); // 원형 테두리의 진행 상태 (초기 100%)
  const [showModal, setShowModal] = useState<boolean>(false)
  const navigate = useNavigate();
  const {scriptId} = useParams();
  const Id = Number(scriptId)

  const closeModal = () => {
    setShowModal(false); // 모달 닫기
    navigate('/situation')
  }

  const ResetModal = () => {
    setShowModal(false); // 모달 닫기
    setTimeLeft(seconds);
    navigate(`/situation/practice/${Id}`)
  }

  useEffect(() => {
    if (resetTimer === true) {
      setTimeLeft(seconds)
      setResetTimer(false)
    }
  },[resetTimer])

  useEffect(() => {
    if (!isRecording) {
      return ;  // isRecording이 false일때는 일시정지
    }
    if (timeLeft === 0) {
        setShowModal(true)
        setIsRecording(false)
        return; // 타이머가 끝나면 종료
    }

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1); // 매 초마다 타이머 감소
    }, 1000);

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 클리어
  }, [timeLeft, isRecording]);

  useEffect(() => {
    // 타이머가 줄어들면서 원형 테두리 진행 상태 업데이트
    setProgress((timeLeft / seconds) * 100); // 300초에서 현재 남은 시간에 대한 비율 계산
  }, [timeLeft]);

  // 원형 테두리의 스타일
  const radius = 55; // 원의 반지름 (타이머 크기 키우기 위해 증가)
  const circumference = 2 * Math.PI * radius; // 원 둘레 계산
  const offset = circumference - (circumference * progress) / 100; // dashoffset 값 계산

  return (
    <>
    <div className="relative flex justify-center items-center">
      <svg
        // width="200" // 크기를 키우기 위해 width 증가
        // height="200" // 크기를 키우기 위해 height 증가
        viewBox="0 0 120 120"
        className="sm:w-40 sm:h-40 md:w-50 md:h-50 lg:w-60 lg:h-60 xl:w-70 xl:h-70 transform rotate-180"
      >
        {/* 전체 원형 테두리 (배경) */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="transparent"
          strokeWidth="5" // 테두리 두께를 증가시켜서 더 뚜렷하게
          fill="transparent"
        />
        {/* 진행 중인 원형 테두리 */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#FFAB01"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)" // 위쪽에서부터 시작하도록 회전
          style={{
            transition: "stroke-dashoffset 1s ease-out", // 테두리 줄어드는 애니메이션
          }}
        />
      </svg>
      {/* 타이머 텍스트 크기 증가 */}
      <div className="absolute text-5xl text-[#EFCC87] font-bold">
        {`${Math.floor(timeLeft / 60)}:${timeLeft % 60 < 10 ? "0" : ""}${timeLeft % 60}`}
      </div>
    </div>


    <RegistModal isOpen={showModal} onClose={closeModal} onReset={ResetModal}/>
    </>
  );
}

export default Timer;
