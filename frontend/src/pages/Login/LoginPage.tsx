import "./Login.css";
import useAuthStore from "../../shared/stores/authStore";
import { useNavigate } from "react-router-dom";
import AudioVertexVisualizer from "../../shared/components/Visualizer/AudioVertexVisualizer";

function Login() {
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href =
      import.meta.env.VITE_API_URL + "/oauth2/authorization/kakao";
  };

  // 테스트 로그인 처리
  const handleTestLogin = (gender: "male" | "female") => {
    const testToken =
      gender === "male"
        ? import.meta.env.VITE_TEST_TOKEN_MALE
        : import.meta.env.VITE_TEST_TOKEN_FEMALE;

    setToken(testToken);
    navigate("/");
  };

  return (
    <main className="flex flex-col items-center justify-center">
      <div 
        className="w-[300px] h-[300px] mt-24"
        aria-hidden="true"
      >
        <AudioVertexVisualizer size="large" />
      </div>
      <div className="flex flex-col items-center gap-5 mt-10" role="group" aria-label="로그인 옵션">
        <button 
          onClick={handleLogin} 
          className="neon-kakao-button"
          aria-label="카카오 계정으로 로그인"
        >
          카카오 로그인
        </button>
      </div>
    </main>
  );
}

export default Login;
