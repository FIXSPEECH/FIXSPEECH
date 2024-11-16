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
  const { audioURL, isRecording, setIsRecording, setAudioURL } = useVoiceStore();
  const { isNumber, setIsNumber, setIsCorrect, setIsNumberZero } = usePronounceScoreStore();
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
    } catch (e) {
      console.log(e);
    }
  };

  const finishPost = async () => {
    try {
      const response = await pronounceFinishPost();
      console.log(response.data);
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
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
    let highlightedText = [];
    let lastIndex = 0;

    differences.forEach((diff, index) => {
      const { operation, user_postion, answer_position, answer_text, user_text } = diff;

      // 일치하지 않는 텍스트 앞의 정상적인 텍스트 추가
      if (user_postion && user_postion[0] !== null && user_postion[0] > lastIndex) {
        highlightedText.push(userStt.slice(lastIndex, user_postion[0]));
      } else if (user_postion === null && lastIndex < answer_position[0]) {
        highlightedText.push(userStt.slice(lastIndex));
      }

      if (operation === "equal") {
        // 일치하는 텍스트 추가
        highlightedText.push(userStt.slice(user_postion[0], user_postion[1]));
      } else if (operation === "replace" || operation === "insert") {
        // 잘못된 단어나 삽입된 단어 강조 표시
        highlightedText.push(
          <span key={`replace-insert-${index}`} className="text-red-500 underline font-bold">
            {userStt.slice(user_postion[0], user_postion[1])}
          </span>
        );
      } else if (operation === "delete") {
        // 삭제된 텍스트를 강조 표시 (answer_text 사용)
        highlightedText.push(
          <span key={`delete-${index}`} className="text-red-500 underline font-bold">
            {answer_text}
          </span>
        );
      }

      // 업데이트된 lastIndex 처리
      lastIndex = user_postion && user_postion[1] !== null ? user_postion[1] : lastIndex;
    });

    // 마지막 남은 텍스트 추가
    if (lastIndex < userStt.length) {
      highlightedText.push(userStt.slice(lastIndex));
    }

    return highlightedText;
  };

  return (
    <>
      <div className="flex justify-center items-center w-screen">
        <div style={{ width: `${size}rem`, height: `${size}rem` }}>
          {!isRecording && audioURL && (
            <div>
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)} // 오디오가 끝나면 상태를 다시 false로 설정
              />
              <VolumeDownIcon
                onClick={handlePlayAudio}
                style={{ cursor: "pointer", color, fontSize: `${size}rem` }}
                className="mb-6"
              />
            </div>
          )}
        </div>

        <div className="text-[#FF8C82] break-words sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center mr-20">
          {example}
        </div>
      </div>

      {/* 틀린 단어들 강조하여 출력 */}
      <div className="mt-4 text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center mr-20">
        {renderHighlightedUserText()}
      </div>

      {/* ArrowRight 컴포넌트 */}
      <div className="ml-auto mr-10 flex">
        <ArrowRight onClick={isNext ? getExample : undefined} color="#FF8C82" />
      </div>

      {/* FinishModal */}
      <FinishModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}

export default PronounceExample;
