declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }
  

import React, { useState, useEffect, useRef } from "react";

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
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
            addToLog(transcript);
          } else {
            interimTranscript += transcript;
          }
        }

        setInterimTranscript(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        addToLog(`[오류] ${event.error}`);
      };

      recognitionRef.current = recognition;
    } else {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
    }
  }, []);

  const addToLog = (text: string) => {
    if (!text.trim()) return;
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prevLogs) => [`${timestamp}: ${text}`, ...prevLogs]);
  };

  const handleStartStop = () => {
    if (!isRecording) {
      recognitionRef.current?.start();
      addToLog("[시스템] 음성 인식이 시작되었습니다.");
    } else {
      recognitionRef.current?.stop();
      addToLog("[시스템] 음성 인식이 중지되었습니다.");
    }
    setIsRecording(!isRecording);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setInterimTranscript("");
    addToLog("[시스템] 로그가 초기화되었습니다.");
  };

//   console.log('interimtranscript', interimTranscript)

  return (
    <div className="App">
      <h1>실시간 음성 인식 로그</h1>
      <div className="controls">
        <button
          onClick={handleStartStop}
          className={isRecording ? "recording" : "not-recording"}
        >
          {isRecording ? "녹음 중지" : "녹음 시작"}
        </button>
        <button onClick={handleClearLogs}>로그 지우기</button>
   
      </div>
      <div id="result">
        {/* interimTranscript : stt 최종 */}
        <i style={{ color: "#666" }}>{interimTranscript}</i> 
      </div>
      <div id="logs">
        <h2>음성 인식 로그</h2>
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            {log}
          </div>
        ))}
      </div>

      <style jsx>{`
        body {
          font-family: "Noto Sans KR", sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        #result {
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
          min-height: 100px;
          white-space: pre-wrap;
          background-color: #f9f9f9;
        }
        .controls {
          margin: 20px 0;
        }
        button {
          padding: 10px 20px;
          margin-right: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .recording {
          background-color: #ff4444;
          color: white;
        }
        .not-recording {
          background-color: #4caf50;
          color: white;
        }
        #logs {
          margin-top: 20px;
          max-height: 500px;
          overflow-y: auto;
          border: 1px solid #eee;
          padding: 10px;
        }
        .log-entry {
          padding: 10px;
          border-bottom: 1px solid #eee;
          background-color: white;
        }
        .log-time {
          color: #666;
          font-size: 0.9em;
        }
        .log-text {
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default App;
