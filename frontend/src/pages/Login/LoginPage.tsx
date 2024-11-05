import "../../styles/user/Login.css";
import Kakao from "/kakao.png";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

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
    <div className="login-container">
      <img src={Kakao} alt="kakao login" onClick={handleLogin} />
      <button
        onClick={handleTestLogin}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#f0f0f0",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        테스트 로그인
      </button>
    </div>
  );
}

export default Login;
