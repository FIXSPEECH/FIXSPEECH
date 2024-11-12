import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import AudioSphereVisualizer from "../../components/Visualizer/AudioSphereVisualizer";
import AudioRecorder from "../../components/VoiceQuality/AudioRecorder";
import { useState } from "react";

function VoiceRecord() {
  const navigate = useNavigate();
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);

  const handleRecordingComplete = (audioFile: File) => {
    console.log("녹음 완료:", audioFile);
    setIsRecordingComplete(true);
    // TODO: 녹음된 파일 처리 로직 추가
  };

  return (
    <div className="relative h-[calc(100vh-14vh)] w-screen overflow-hidden flex flex-col items-center p-5">
      <div className="text-white text-center mt-[8vh]">
        아이콘을 누르고 제시된 문장을 읽어주세요.
      </div>

      <div className="text-[#B9E5E8] text-center mt-[4vh]">
        거친 돌이 다듬어져 조각이 되듯
      </div>

      <div className="absolute top-5 right-10">
        <button
          onClick={() => navigate("/")}
          className="text-[#B9E5E8] bg-transparent border-none"
        >
          건너뛰기
        </button>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full overflow-hidden">
        <Canvas camera={{ position: [3, 3, 3], fov: 70 }}>
          <AudioSphereVisualizer />
        </Canvas>
      </div>

      <div className="absolute bottom-[calc(20px+6rem)] left-1/2 transform -translate-x-1/2">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={isRecordingComplete}
        />
      </div>

      <div className="absolute bottom-[calc(20px+2rem)] right-10 flex gap-5">
        <button
          onClick={() => navigate("/analysis/1")}
          disabled={!isRecordingComplete}
          className={`bg-transparent border-none ${
            isRecordingComplete
              ? "text-[#B9E5E8] cursor-pointer"
              : "text-[#666] cursor-not-allowed"
          }`}
        >
          완료
        </button>
        <button
          onClick={() => navigate("/audiotest")}
          className="text-[#B9E5E8] bg-transparent border-none"
        >
          [분석 결과 test]
        </button>
      </div>
    </div>
  );
}

export default VoiceRecord;
