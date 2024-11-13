import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import AudioSphereVisualizer from "../../components/Visualizer/AudioSphereVisualizer";
import AudioRecorder from "../../components/VoiceQuality/AudioRecorder";
import useVoiceStore from "../../store/voiceStore";
import useAuthStore from "../../store/authStore";
import axiosInstance from "../../services/axiosInstance";

function VoiceRecord() {
  const navigate = useNavigate();
  const { setAudioBlob } = useVoiceStore();
  const userGender = useAuthStore((state) => state.userProfile?.gender);

  const handleRecordingComplete = async (audioFile: File) => {
    console.log("녹음 완료:", audioFile);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("record", audioFile);

      // Spring Boot 서버로 전송
      const response = await axiosInstance.post("/record", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "C000") {
        // Blob 형태로 저장
        const blob = new Blob([audioFile], { type: audioFile.type });
        setAudioBlob(blob);

        // 녹음 완료 시 바로 분석 페이지로 이동
        if (userGender) {
          navigate("/record/result", { state: { fromRecordPage: true } });
        }
      } else {
        console.error("음성 분석 실패:", response.data.message);
      }
    } catch (error) {
      console.error("음성 파일 전송 실패:", error);
    }
  };

  return (
    <div className="relative h-[calc(100vh-14vh)] w-screen overflow-hidden flex flex-col items-center p-5">
      <div className="text-white text-center mt-[8vh]">
        아이콘을 누르고 제시된 문장을 읽어주세요.
      </div>

      <div className="text-[#B9E5E8] text-center mt-[4vh]">
        거친 돌이 다듬어져 조각이 되듯
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full overflow-hidden">
        <Canvas camera={{ position: [3, 3, 3], fov: 70 }}>
          <AudioSphereVisualizer />
        </Canvas>
      </div>

      <div className="absolute bottom-[calc(20px+6rem)] left-1/2 transform -translate-x-1/2">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={false}
        />
      </div>
    </div>
  );
}

export default VoiceRecord;
