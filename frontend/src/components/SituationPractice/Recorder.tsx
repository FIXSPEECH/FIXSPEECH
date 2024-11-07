import { useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import MicNoneIcon from "@mui/icons-material/MicNone";
import MicIcon from "@mui/icons-material/Mic";
import useVoiceStore from "../../store/voiceStore";
import { LiveAudioVisualizer } from "react-audio-visualize";
import RegistModal from './RegistModal'


declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }


function Recorder(){
    const { isRecording, audioURL, setIsRecording, setAudioURL } = useVoiceStore();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
      null
    );
    const [showModal, setShowModal] = useState<boolean>(false)
    const recognitionRef = useRef<any>(null);
    const navigate = useNavigate();
    
    const startRecording = async () => {

        // 녹음 시작하기 전에 audioURL 결과 초기화
        setAudioURL(null);
    
    
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
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
        navigate('/')
      }
        
      const resetModal = () => {
        setShowModal(false); // 모달 닫기
        setAudioURL(null)
        navigate('/situation/practice')
      }
        

    return(
        <div className="text-center mt-20">
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? (
            <>
              <div
                style={{ position: "relative", width: "200px", height: "75px" }}
              >
                {mediaRecorder && (
                  <>
                    {/* 파형 시각화 컴포넌트 */}
                    <LiveAudioVisualizer
                      mediaRecorder={mediaRecorder}
                      width={200}
                      height={60}
                      barColor="rgb(239,204,135)"
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
                    color: '#FFAB01',
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
              style={{ color: '#FFAB01', fontSize: `5rem` }}
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

      <RegistModal isOpen={showModal} onClose={closeModal} onReset={resetModal}/>

    </div>
  
    )
}

export default Recorder;