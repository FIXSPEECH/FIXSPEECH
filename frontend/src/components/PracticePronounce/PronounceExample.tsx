// import { useEffect, useRef, useState } from "react";
// import useVoiceStore from "../../store/voiceStore";
// import VolumeDownIcon from '@mui/icons-material/VolumeDown';
// import { ExampleGet } from "../../services/PronouncePractice/PronouncePracticeGet";

// interface PronounceExampleProps {
//     color: string; // color prop의 타입 정의
//     trainingId: number;
//     size: number;
//   }


// function PronounceExample({color, trainingId, size}:PronounceExampleProps){
//     const {audioURL, isRecording} = useVoiceStore();
//     const audioRef = useRef<HTMLAudioElement | null>(null);
//     const [isPlaying, setIsPlaying] = useState(false); // 현재 재생 상태
//     const [example, setExample] = useState<string>("")


//     const handlePlayAudio = () => {
//         if (audioRef.current) {
//             if (isPlaying) {
//               audioRef.current.pause(); // 재생 중일 경우 일시 정지
//               setIsPlaying(false);
//             } else {
//               audioRef.current.play(); // 일시 정지 중일 경우 재생
//               setIsPlaying(true);
//             }
//           }
//       };

    

//     // 연습 문제 가져오기
//     // useEffect(() => {
//     //     const getExample = async () => {
//     //         try {
//     //             const response = await ExampleGet(trainingId);
//     //             setExample(response)
//     //             console.log('연습 데이터', example)
//     //         } catch(e) {
//     //             console.log(e)
//     //         }
//     //     }


//     //     getExample();
//     // })
     
    

//     return (
//         <div className="flex justify-center items-center ">
//          <div style={{ width: `${size}rem`, height: `${size}rem`}}>
//             {!isRecording && audioURL && (
//             <div>
//             <audio ref={audioRef} src={audioURL} 
//                 onEnded={() => setIsPlaying(false)} // 오디오가 끝나면 상태를 다시 false로 설정
//             /> 
//             <VolumeDownIcon 
//             onClick={handlePlayAudio} 
//             style={{ cursor: 'pointer', color, fontSize: `${size}rem` }}
//             className="mb-6" 
//             />
//             </div>
//             )}
//            </div>

//             <div className="text-white">{example}</div>

//             <div className="text-[#FF8C82] text-4xl break-words"> 떡볶이 떡은 떡볶이용 떡이고 떡국 떡은 떡국용 떡이다 </div>
         
//         </div>
//     )
// }

// export default PronounceExample;


declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }
  
  import  { useState } from "react";
  
  const SpeechToText = () => {
    const [transcript, setTranscript] = useState("");  // STT 결과 텍스트
    const [isListening, setIsListening] = useState(false);  // 마이크 활성화 상태
  
    // Web Speech API SpeechRecognition 설정
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
  
    recognition.continuous = true;  // STT 지속 활성화 설정
    recognition.interimResults = true;  // 중간 결과 표시 설정 (완료 전 미리 보기)
  
    // 음성 인식 시작 함수
    const startListening = () => {
      setIsListening(true);
      recognition.start();
  
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptResult = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcriptResult);  // 최종 텍스트 설정
          } else {
            interimTranscript += transcriptResult;  // 중간 텍스트 설정
          }
        }
        setTranscript((prev) => prev + interimTranscript);  // UI에 텍스트 업데이트
      };
    };
  
    // 음성 인식 정지 함수
    const stopListening = () => {
      setIsListening(false);
      recognition.stop();
    };
  
    return (
      <div className="text-white">
        <h2>음성 인식 (STT) 데모</h2>
        <button onClick={isListening ? stopListening : startListening}>
          {isListening ? "중지" : "시작"}
        </button>
        <p>음성 인식 결과: {transcript}</p>
      </div>
    );
  };
  
  export default SpeechToText;