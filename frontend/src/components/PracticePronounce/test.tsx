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