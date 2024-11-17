import { useState, useRef, useEffect } from "react";
import MicNoneIcon from "@mui/icons-material/MicNone";
import MicIcon from "@mui/icons-material/Mic";
import useVoiceStore from "../../../shared/stores/voiceStore";
import { LiveAudioVisualizer } from "react-audio-visualize";
import useSttStore from "../../stores/sttStore";

interface MicrophoneProps {
  color: string; // color prop의 타입 정의
  size: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

function AudioRecorder({ color, size }: MicrophoneProps) {
  const { isRecording, audioURL, setIsRecording, setAudioURL, setAudioBlob } =
    useVoiceStore();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [_interimTranscript, setInterimTranscript] = useState("");
  const [_finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const { setUserStt } = useSttStore();

  // console.log(interimTranscript)
  // console.log(finalTranscript)

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";

      recognition.onresult = (event: any) => {
        let newFinalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setInterimTranscript(interimTranscript);
        setFinalTranscript(newFinalTranscript);
        setUserStt(newFinalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
    } else {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
    }
  }, []);

  const isWavFile = async (blob: Blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const view = new DataView(arrayBuffer);
    const isWav =
      view.getUint32(0, false) === 0x52494646 &&
      view.getUint32(8, false) === 0x57415645;
    // console.log("isWavFile check: ", isWav);
    return isWav;
  };

  const startRecording = async () => {
    // 녹음 시작하기 전에 audioURL 결과 초기화
    setAudioURL(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 오디오 파일 형식 변환
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);

      // stereo -> mono 변환
      const gainNode = audioContext.createGain();
      gainNode.channelCount = 1; // mono로 설정
      gainNode.channelCountMode = "explicit";
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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });

        // const audioUrl = URL.createObjectURL(audioBlob);
        // setAudioURL(audioUrl);

        // WAV 파일로 변환
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const wavBuffer = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

        // WAV 파일인지 확인
        const isWav = await isWavFile(wavBlob);
        if (isWav) {
          // console.log("This is a valid WAV file.");
          setAudioBlob(wavBlob);
          const audioUrl = URL.createObjectURL(wavBlob);
          setAudioURL(audioUrl);
        } else {
          console.error("The recorded file is not a valid WAV file.");
        }
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
      // console.log("[System] 음성 인식이 시작되었습니다.");
    } else {
      recognitionRef.current?.stop();
      stopRecording();
      // console.log("[System] 음성 인식이 중지되었습니다.");
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer) => {
    let numOfChannels = buffer.numberOfChannels,
      length = buffer.length * numOfChannels * 2 + 44,
      bufferArray = new ArrayBuffer(length),
      view = new DataView(bufferArray),
      channels = [],
      i,
      sample,
      offset = 0,
      pos = 0;

    // write WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt "
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChannels); // avg. bytes/sec
    setUint16(numOfChannels * 2); // block-align
    setUint16(16); // 16-bit (hardcoded)

    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChannels; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++;
    }

    return view;

    function setUint16(data: any) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: any) {
      view.setUint32(pos, data, true);
      pos += 4;
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

      {/* 녹음된 오디오를 재생할 수 있는 오디오 플레이어 */}
      {/* {audioURL && (
        <audio controls src={audioURL} className="mt-4">
          Your browser does not support the audio element.
        </audio>
      )} */}
      {/* 
      <div className="text-white">(중간) {interimTranscript}</div>
      <div className="text-white">(파이널) {finalTranscript}</div> */}
      {/* stt 결과 post 보내고 나면
          // setInterimTranscript("")를 통해 초기화
      */}
    </div>
  );
}

export default AudioRecorder;
