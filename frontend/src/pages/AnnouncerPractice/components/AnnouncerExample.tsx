import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useVoiceStore from "../../../shared/stores/voiceStore";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import { AnnouncerExampleGet } from "../../../services/AnnouncerPractice/AnnouncerPracticeGet";
import ArrowRight from "../../../shared/components/Icons/ArrowRightIcon";
import usePronounceScoreStore from "../../../shared/stores/pronounceScoreStore";
import FinishModal from "../../../shared/components/PracticePronounce/FinishModal";
import { audioPost } from "../../../services/AnnouncerPractice/AnnouncerPracticePost";
import useModalStore from "../../../shared/stores/modalStore";
import useGraphStore from "../../../shared/stores/graphStore";
import SpinnerOrbits from "../../../shared/components/Loader/SpinnerOrbits";
import useNextArrowState from "../../../shared/stores/nextArrowStore";
import { announcerFinishPost } from "../../../services/AnnouncerPractice/AnnouncerPracticePost";

interface PronounceExampleProps {
  color: string; // color prop의 타입 정의
  size: number;
}

function AnnouncerExample({ color, size }: PronounceExampleProps) {
  const { isModal } = useModalStore();
  const { setIsRecording, setAudioURL, audioBlob } = useVoiceStore();
  const { isNumber, setIsNumber, setIsNumberZero, setIsNumberMinus } =
    usePronounceScoreStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // 현재 재생 상태
  const [example, setExample] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [announcerUrl, setAnnouncerUrl] = useState<string>("");
  const { setUser, setAnnouncer } = useGraphStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const controllerRef = useRef<AbortController | null>(null);
  const {isNext, setIsNext} = useNextArrowState();
  const navigate = useNavigate();

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
    setUser([]);
    setAnnouncer([]);
    setIsNext(false)
    try {
      const response = await AnnouncerExampleGet();
      console.log(response.data);
      setExample(response.data.text);
      setAnnouncerUrl(response.data.sampleAddress);
    } catch (e) {
      console.log(e);
    }
    setIsRecording(false);
    setAudioURL(null);
  };

  const postAudio = async () => {
    if (!audioBlob) {
      console.error("Audio blob is null");
      return; // audioBlob이 null이면 함수 종료
    }

    const data = new FormData();

    data.append("user_file", audioBlob);
    data.append("announcer_url", announcerUrl);
    setIsLoading(true);

    // const controller = new AbortController();
    // const {signal} = controller;

    controllerRef.current = new AbortController();

    console.log("data", data);
    try {
      const response = await audioPost(data, {
        signal: controllerRef.current.signal,
      });
      console.log(response.data);
      setUser(response.data.user_f0_data);
      setAnnouncer(response.data.announcer_f0_data);
    } catch (e) {
      console.log(e);
    } finally {
      if (controllerRef.current) {
        setIsLoading(false);
      }
      setIsLoading(false);
      setIsNumber();
      setIsNext(true)
    }
  };

  useEffect(() => {
    if (isModal === true) {
      postAudio();
    }
  }, [isModal]);

  // 페이지 로딩 시 연습문제 가져오기
  useEffect(() => {
    setIsNumberZero();
    getExample();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  // isNumber가 11이 되면 모달을 표시하도록 설정
  useEffect(() => {
    if (isNumber === 11) {
      setIsNumberMinus();
      setShowModal(true); // 11이 되면 모달을 띄움
    }
  }, [isNumber]); // isNumber가 변경될 때마다 실행


  const finishPost = async() => {
    try{
      const response = await announcerFinishPost() 
      console.log(response)
    } catch(e) {
      console.log(e)
    }
  }

  const closeModal = () => {
    setShowModal(false); // 모달 닫기
    setIsNumberZero();
    navigate("/training");
    finishPost();
  };

  return (
    <>
      <div className="flex justify-center items-center w-screen">
        <div style={{ width: `${size}rem`, height: `${size}rem` }}>
          {announcerUrl && (
            <div>
              <audio
                ref={audioRef}
                src={announcerUrl}
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

        <div className="text-[#B18CFE] break-words mt-10 sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl text-center mr-20 ">
          {example}
        </div>
      </div>

      {/* ArrowRight 컴포넌트 */}
      <div className="ml-auto mr-10 flex">
        <ArrowRight onClick={isNext ? getExample : undefined} color="#B18CFE" />
      </div>

      <div className="flex justify-center">
        {isLoading && <SpinnerOrbits size={100} />}
      </div>

      {/* isNumber가 11일 때 FinishModal이 자동으로 표시 */}
      <FinishModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}

export default AnnouncerExample;
