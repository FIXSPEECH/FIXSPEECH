import { useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import MicNoneIcon from "@mui/icons-material/MicNone";
import MicIcon from "@mui/icons-material/Mic";
import useVoiceStore from "../store/voiceStore";
import { LiveAudioVisualizer } from "react-audio-visualize";
import RegistModal from './SituationPractice/RegistModal'
import RecordModal from './AnnouncerPractice/RecordModal'

interface RecorderProps{
  color: string;
  barColor: string
  width: number;
  height: number;
  visualizeWidth: string;
  modalType: 'record' | 'regist';
}

declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
      webkitAudioContext: typeof AudioContext;
    }
  }


function Recorder({color, barColor, width, height, visualizeWidth, modalType}: RecorderProps){
    const { isRecording, audioURL, setIsRecording, setAudioURL } = useVoiceStore();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
      null
    );
    const [showModal, setShowModal] = useState<boolean>(false)
    const recognitionRef = useRef<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
      setIsRecording(false)
    }, [])
    
    const startRecording = async () => {

        // 녹음 시작하기 전에 audioURL 결과 초기화
        setAudioURL(null);
    
    
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
          // 오디오 파일 형식 변환
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(stream);
      
          // stereo -> mono 변환
          const gainNode = audioContext.createGain();
          gainNode.channelCount = 1; // mono로 설정
          gainNode.channelCountMode = 'explicit';
          source.connect(gainNode);

          
          const mediaRecorder = new MediaRecorder(stream);
          setMediaRecorder(mediaRecorder);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
    
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };
    
          mediaRecorder.onstop = () => {
            // 녹음 된 음성 파일
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });

            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
          };
    
          mediaRecorder.start();
          setIsRecording(true);
    
        } catch (error) {
          console.error("Error accessing microphone", error);
        }
      };
    
      const stopRecording = () => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          setAudioURL(null);
        }
      };
    
      const handleStartStop = () => {
        if (!isRecording) {
          recognitionRef.current?.start();
          startRecording();
          console.log("[System] 음성 인식이 시작되었습니다.");
        } else {
          recognitionRef.current?.stop();
          stopRecording();
          setShowModal(true)
          console.log("[System] 음성 인식이 중지되었습니다.");
        }
      };


      const closeModal = () => {
        setShowModal(false); // 모달 닫기
        setAudioURL(null)
        if (modalType === "record") {
          navigate('/announcer'); // FinalModal의 경우 홈 화면으로 이동
        } else if (modalType === "regist") {
          navigate('/'); // RegistModal의 경우 다른 경로로 이동
        }
      }
        
      const resetModal = () => {
        setShowModal(false); // 모달 닫기
        setAudioURL(null)
        if (modalType === "record") {
          navigate('/announcer'); // FinalModal의 경우 홈 화면으로 이동
        } else if (modalType === "regist") {
          navigate('/situation/practice')
        }
      }
        
      console.log('barcolor', barColor)

    return(
        <div className="text-center mt-20">
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? (
            <>
              <div
                style={{ position: "relative", width: visualizeWidth, height: "75px" }}
              >
                {mediaRecorder && (
                  <>
                    {/* 파형 시각화 컴포넌트 */}
                    <LiveAudioVisualizer
                      mediaRecorder={mediaRecorder}
                      width={width}
                      height={height}
                      barColor={barColor}
                      gap={3}
                      barWidth={5}
                    />
                    {/* 아이콘의 크기와 위치에 따라 마스킹할 영역 */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%", // 가운데 정렬
                        left: "50%", // 가운데 정렬
                        transform: "translate(-50%, -50%)", // 아이콘을 정확히 가운데에 배치
                        width: "40px", // 아이콘의 너비
                        height: "75px", // 파형의 높이와 동일
                        backgroundColor: "rgba(255, 255, 255, 0)", // 투명한 배경
                        zIndex: 2, // 아이콘 위에 오도록 z-index 설정
                      }}
                    />
                  </>
                )}
                <MicIcon
                  style={{
                    position: "absolute",
                    top: "50%", // 가운데 정렬
                    left: "50%", // 가운데 정렬
                    transform: "translate(-50%, -50%)", // 아이콘을 정확히 가운데에 배치
                    color,
                    fontSize: `5rem`,
                    zIndex: 3, // 아이콘을 마스킹 레이어 위에 올리기 위해 z-index 사용                  
                  }}
                  className="cursor-pointer"
                  onClick={handleStartStop}
                />
              </div>
            </>
          ) : (
            <MicNoneIcon
              style={{ color, fontSize: `5rem` }}
              className="cursor-pointer"
              onClick={handleStartStop}
            />
          )}
  
        </button>
  
        <div className="text-white break-words mt-2 text-xs sm:text-sm md:text-base lg:text-text-base xl:text-lg">
            *아이콘을 누르고 대본을 읽어주세요.
        </div>

      {/* 녹음된 오디오를 재생할 수 있는 오디오 플레이어 */}
      {audioURL && (
        <audio controls src={audioURL} className="mt-4">
          Your browser does not support the audio element.
        </audio>
      )}

      {/* <RegistModal isOpen={showModal} onClose={closeModal} onReset={resetModal}/> */}


      {modalType === "regist" ? (
        <RegistModal isOpen={showModal} onClose={closeModal} onReset={resetModal} />
      ) : (
        <RecordModal isOpen={showModal} onClose={closeModal} onReset={resetModal} />
      )}


    </div>
  
    )
}

export default Recorder;