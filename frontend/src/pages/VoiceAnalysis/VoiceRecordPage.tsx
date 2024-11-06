import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import AudioCubeVisualizer from "../../components/Visualizer/AudioCubeVisualizer";

function VoiceRecord() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "relative",
        height: "calc(100vh - 5vh)",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          color: "white",
          textAlign: "center",
          marginTop: "8vh",
        }}
      >
        아이콘을 누르고 제시된 문장을 읽어주세요.
      </div>

      <div
        style={{
          color: "#B9E5E8",
          textAlign: "center",
          marginTop: "4vh",
        }}
      >
        임시 페이지입니다. 코드 보존 없이 수정하면 됩니다.
      </div>

      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        <button
          onClick={() => navigate("/")}
          style={{ color: "#B9E5E8", background: "none", border: "none" }}
        >
          건너뛰기
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "300px",
          height: "300px",
        }}
      >
        <Canvas camera={{ position: [7, 7, 7], fov: 70 }}>
          <AudioCubeVisualizer />
        </Canvas>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "calc(20px + 2rem)",
          right: "20px",
        }}
      >
        <button
          onClick={() => navigate("/analysis/1")}
          // {/* TODO: 실제 id로 교체 필요 */ }
          style={{ color: "#B9E5E8", background: "none", border: "none" }}
        >
          완료
        </button>
      </div>
    </div>
  );
}

export default VoiceRecord;
