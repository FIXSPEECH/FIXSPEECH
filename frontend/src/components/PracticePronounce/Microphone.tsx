import { useState, useRef, useEffect } from "react";
import MicNoneIcon from "@mui/icons-material/MicNone";
import MicIcon from "@mui/icons-material/Mic";
import useVoiceStore from "../../store/voiceStore";
import { LiveAudioVisualizer } from "react-audio-visualize";

interface MicrophoneProps {
  color: string; // color prop의 타입 정의
  size: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}


function AudioRecorder({ color, size }: MicrophoneProps) {
  const { isRecording, audioURL, setIsRecording, setAudioURL } =
    useVoiceStore();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setInterimTranscript(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
    } else {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
    }
  }, []);

  const startRecording = async () => {

    // 녹음 시작하기 전에 audioURL 결과 초기화
    setAudioURL(null);
    setInterimTranscript("")

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
      console.log("[System] 음성 인식이 중지되었습니다.");
    }
  };

  return (
    <div className="text-center mt-10">
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? (
          <>
            <div
              style={{ position: "relative", width: "300px", height: "75px" }}
            >
              {mediaRecorder && (
                <>
                  {/* 파형 시각화 컴포넌트 */}
                  <LiveAudioVisualizer
                    mediaRecorder={mediaRecorder}
                    width={300}
                    height={75}
                    barColor="rgb(236,90,77)"
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
                  fontSize: `${size}rem`,
                  zIndex: 3, // 아이콘을 마스킹 레이어 위에 올리기 위해 z-index 사용                  
                }}
                className="cursor-pointer"
                onClick={handleStartStop}
              />
            </div>
          </>
        ) : (
          <MicNoneIcon
            style={{ color, fontSize: `${size}rem` }}
            className="cursor-pointer"
            onClick={handleStartStop}
          />
        )}

      </button>

      <div className="text-white mt-2">
        {audioURL
          ? "*다시 녹음하려면 아이콘을 눌러주세요."
          : "*아이콘을 누르고 제시된 문장을 읽어주세요."}
      </div>


      <div className="text-white">{interimTranscript}</div>
    </div>
  );
}

export default AudioRecorder;


