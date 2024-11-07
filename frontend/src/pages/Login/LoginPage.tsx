import "../../styles/user/Login.css";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import AudioVertexVisualizer from "../../components/Visualizer/AudioVertexVisualizer";

function Login() {
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href =
      import.meta.env.VITE_API_URL + "/oauth2/authorization/kakao";
  };

  // 테스트 로그인 처리
  const handleTestLogin = () => {
    const testToken = import.meta.env.VITE_TEST_TOKEN;

    setToken(testToken); // zustand가 자동으로 localStorage에 저장
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-[300px] h-[300px]">
        <AudioVertexVisualizer size="large" />
      </div>
      <div className="flex flex-col items-center gap-5 mt-10">
        <button onClick={handleLogin} className="neon-kakao-button">
          카카오 로그인
        </button>
        <button
          onClick={handleTestLogin}
          className="px-5 py-2.5 bg-gray-100 rounded cursor-pointer border-none"
        >
          테스트 로그인
        </button>
      </div>
    </div>
  );
}

export default Login;
