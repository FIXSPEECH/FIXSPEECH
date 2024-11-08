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


    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // 오디오 컨텍스트 생성
      // const audioContext = new AudioContext();
      // const source = audioContext.createMediaStreamSource(stream);

      // // 채널 스플리터와 게인 노드로 한 채널만 유지
      // const splitter = audioContext.createChannelSplitter(2);
      // const merger = audioContext.createChannelMerger(1);
      // // const gainNode = audioContext.createGain();
      // const destination = audioContext.createMediaStreamDestination();
  
      // // 왼쪽 채널만 연결하여 모노 스트림으로 만듦
      // source.connect(splitter);
      // // splitter.connect(gainNode, 0); // 왼쪽 채널만 연결
      // splitter.connect(merger, 0, 0); // 게인 노드를 통해 모노로 병합
      // merger.connect(destination);

      // // 모노 스트림으로 변환된 오디오 스트림 가져오기
      // const monoStream = destination.stream;

      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };



      // const verifyMonoAudio = async (audioBlob: Blob) => {
      //   const arrayBuffer = await audioBlob.arrayBuffer();
      //   const dataView = new DataView(arrayBuffer);
      
      //   // WAV 파일의 채널 수는 22~23번째 바이트에 저장되어 있습니다.
      //   const channelCount = dataView.getUint16(22, true);
      //   return channelCount === 1;
      // };
      

      
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

              // 모노 확인 후 백엔드로 전송
      // const isMono = await verifyMonoAudio(audioBlob);
      // if (isMono) {
      //   console.log("녹음 파일이 모노입니다. 백엔드로 전송 가능합니다.");
      //   // 백엔드로 파일 전송하는 로직 추가
      // } else {
      //   console.warn("녹음 파일이 스테레오입니다. 모노 파일을 생성해주세요.");
      //   // 모노 파일을 요구하는 안내 추가
      // }


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
    <div className="text-center mt-20">
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

      <div className="text-white break-words mt-2 text-xs sm:text-sm md:text-base lg:text-text-base xl:text-lg">
        {audioURL
          ? "*다시 녹음하려면 아이콘을 눌러주세요."
          : "*아이콘을 누르고 제시된 문장을 읽어주세요."}
      </div>


      <div className="text-white">{interimTranscript}</div>
      {/* stt 결과 post 보내고 나면
          // setInterimTranscript("")를 통해 초기화
      */}
    </div>
  );
}

export default AudioRecorder;


