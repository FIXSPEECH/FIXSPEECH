import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useVoiceStore from "../../../shared/stores/voiceStore";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import { ExampleGet } from "../../../services/PronouncePractice/PronouncePracticeGet";
import ArrowRight from "../Icons/ArrowRightIcon";
import usePronounceScoreStore from "../../../shared/stores/pronounceScoreStore";
import FinishModal from "./FinishModal";
import useSttStore from "../../stores/sttStore";
import { sttPost } from "../../../services/PronouncePractice/PronouncePracticePost";
import useNextArrowState from "../../stores/nextArrowStore";
import { pronounceFinishPost } from "../../../services/PronouncePractice/PronouncePracticePost";

interface PronounceExampleProps {
  color: string; // color prop의 타입 정의
  trainingId: number;
  size: number;
}

function PronounceExample({ color, trainingId, size }: PronounceExampleProps) {
  const { audioURL, isRecording, setIsRecording, setAudioURL } =
    useVoiceStore();
  const { isNumber, setIsNumber, setIsCorrect, setIsNumberZero } =
    usePronounceScoreStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // 현재 재생 상태
  const [example, setExample] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const { userStt, setUserStt } = useSttStore();
  const [differences, setDifferences] = useState<any[]>([]);
  const { isNext, setIsNext } = useNextArrowState();
  const [isBefore, setIsBefore] = useState<string | null>(null);

  const navigate = useNavigate();

  const postStt = async () => {
    const data = {
      answer_text: example,
      user_text: userStt,
    };

    try {
      const response = await sttPost(data);
      console.log(response.data);
      setDifferences(response.data.differences || []);
      if (response.data.similarity === 1) {
        setIsCorrect();
      }

      if (isBefore !== example) {
        setIsNumber(); // 다른 문장일 때만 카운트 증가
        setIsBefore(example); // 현재 연습한 문장을 isBefore에 저장
      }

      setIsNext(true);
    } catch (_e) {
      // console.log(e);
    }
  };

  const finishPost = async () => {
    try {
      const response = await pronounceFinishPost();
      void response; // 주석된 콘솔 출력 유지용. 빌드오류 방지용 코드로 역할 없음
      // console.log(response.data);
    } catch (_e) {
      // console.log(e);
    }
  };

  useEffect(() => {
    if (isRecording) {
      // 녹음이 시작되면 기존 user_text를 비웁니다.
      setUserStt("");
      setDifferences([]); // 차이점도 초기화
    } else if (!isRecording && userStt !== "") {
      // 녹음이 종료되면 분석을 시작합니다.
      postStt();
    }
  }, [isRecording, userStt]);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause(); // 재생 중일 경우 일시 정지
        setIsPlaying(false);
      } else {
        audioRef.current.play(); // 일시 정지 중일 경우 재생
        setIsPlaying(true);
      }
    }
  };

  // 연습 문제 가져오기
  const getExample = async () => {
    setIsNext(false);
    setUserStt("");
    setDifferences([]);
    try {
      const response = await ExampleGet(trainingId);
      setExample(response.data);
    } catch (_e) {
      // console.log(e);
    }

    setIsRecording(false);
    setAudioURL(null);

    // 이렇게 수정하면 10개 문장 학습 후 다음으로 넘어가기 눌렀을 때 모달이 뜨겠지..?
    if (isNumber === 10) {
      setShowModal(true);
    }
  };

  // 페이지 로딩 시 연습문제 가져오기
  useEffect(() => {
    getExample();
  }, []);

  const closeModal = () => {
    setShowModal(false); // 모달 닫기
    setIsNumberZero();
    finishPost();
    navigate("/training");
  };

  // 틀린 단어를 하이라이트하여 userStt 텍스트로 변환하는 함수
  const renderHighlightedUserText = () => {
    const highlightedText = differences.map((diff, index) => {
      const { operation, user_text, answer_text,} = diff;

      if (operation === "equal") {
        // 동일한 텍스트
        return <span key={`equal-${index}`}>{user_text}{" "}</span>;
      } else if (operation === "replace") {
        // 대체된 텍스트 (사용자 텍스트 강조)
        return (
          <span
            key={`replace-${index}`}
            className="text-red-500 underline font-bold"
          >
            {user_text}{" "}
          </span>
        );
      } else if (operation === "insert") {
        // 삽입된 텍스트 (원본 텍스트 강조)
        return (
          <span
            key={`insert-${index}`}
            className="text-red-500 italic font-bold"
          >
            {user_text}{" "}
          </span>
        );
      } else if (operation === "delete") {
        // 삭제된 텍스트 (사용자 입력 없음, 원본 텍스트 표시)
        return (
          <span
            key={`delete-${index}`}
            className="text-red-500 line-through font-bold"
          >
            {answer_text}{" "}
          </span>
        );
      }
      return null; // 알 수 없는 operation
    });
  
    return highlightedText;
  };
  
  
  
  
  

  return (
    <>
      <div className="flex justify-center items-center w-screen" role="main">
        <div style={{ width: `${size}rem`, height: `${size}rem` }}>
          {!isRecording && audioURL && (
            <div>
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)} // 오디오가 끝나면 상태를 다시 false로 설정
                aria-label="녹음 오디오"
              />
              <button
                onClick={handlePlayAudio}
                aria-label="오디오 재생"
                className="mb-6"
              >
                <VolumeDownIcon
                  style={{ cursor: "pointer", color, fontSize: `${size}rem` }}
                />
              </button>
            </div>
          )}
        </div>

        <div 
          className="text-[#FF8C82] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center max-w-[50%]"
          aria-label="예문"
          style={{
            wordBreak: "keep-all"
          }}
        >
          {example}
        </div>
      </div>

      {/* 틀린 단어들 강조하여 출력 */}
      <div 
        className="mt-4 text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center"
        aria-label="사용자 발음 결과"
      >
        {renderHighlightedUserText()}
      </div>

      {/* ArrowRight 컴포넌트 */}
      <div className="ml-auto mr-10 flex">
        <button
          onClick={isNext ? getExample : undefined}
          disabled={!isNext}
          aria-label="다음 예문"
          tabIndex={0}
        >
          <ArrowRight color="#FF8C82" />
        </button>
      </div>

      {/* FinishModal */}
      <FinishModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}

export default PronounceExample;
