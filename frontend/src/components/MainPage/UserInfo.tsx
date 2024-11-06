import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { Canvas } from "@react-three/fiber";
import AudioCubeVisualizer from "../Visualizer/AudioCubeVisualizer";

function UserInfo() {
  const navigate = useNavigate();
  const { setToken, userProfile } = useAuthStore();

  const handleLogout = async () => {
    try {
      // await axios.post("/api/logout");
      setToken(null);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <div className="flex items-center mt-10 w-1/4" style={{ marginLeft: "3%" }}>
      <Avatar
        alt={userProfile.name || "사용자"}
        src={userProfile.image || "/static/images/avatar/1.jpg"}
        sx={{ width: 80, height: 80 }}
      />
      <div className="flex flex-col items-center gap-2 ml-4">
        <span className="text-white text-lg font-medium mb-2">
          반가워요, {userProfile.name || "사용자"}님!
        </span>
        <div
          className="flex justify-center items-center text-white bg-white bg-opacity-25 rounded-md w-48 h-9 cursor-pointer"
          onClick={() => navigate("/record")}
        >
          내 목소리 분석하기
        </div>
        <div
          className="flex justify-center items-center text-white bg-white bg-opacity-25 rounded-md w-48 h-9 cursor-pointer"
          onClick={handleLogout}
        >
          로그아웃
        </div>
      </div>
      <div className="flex flex-col items-center">
        <Canvas camera={{ position: [7, 7, 7], fov: 70 }}>
          <AudioCubeVisualizer />
        </Canvas>
      </div>
    </div>
  );
}

export default UserInfo;
