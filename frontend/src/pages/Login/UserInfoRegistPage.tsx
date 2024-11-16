import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance, { tokenRefresh } from "../../services/axiosInstance";
import useAuthStore from "../../shared/stores/authStore";

function UserInfoRegistPage() {
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userProfile = useAuthStore((state) => state.userProfile);

  // 필요한 정보가 이미 있다면 메인 페이지로 리다이렉트
  // useEffect 사용시 DOM 렌더링 후 처리되므로 UserInfoPage가 보이고 깜빡임.
  // 간단히 라우팅만 하기 때문에 useLayoutEffect 사용하였음.
  useLayoutEffect(() => {
    if (userProfile?.gender === "male" || userProfile?.gender === "female") {
      navigate("/");
    }
  }, [userProfile, navigate]);

  useEffect(() => {
    console.log("현재 유저 프로필:", userProfile);
    console.log("현재 성별:", userProfile.gender);
    console.log("현재 에러:", error);
  }, [userProfile, gender, error]);

  const refreshAccessToken = async () => {
    try {
      await tokenRefresh(); // 토큰 재발급 호출
      console.log("토큰 재발급 성공");
    } catch (error) {
      console.error("토큰 재발급 실패", error);
      // 여기서 필요한 추가 처리 가능
    }
  };

  const handleSubmit = async () => {
    if (!gender) {
      setError("성별을 선택해주세요");
      return;
    }

    try {
      // 백엔드로 사용자 정보 전송
      await axiosInstance.put("/user", {
        gender,
      });
      // 토큰 재발급 호출
      await refreshAccessToken();
      // 메인 페이지로 이동
      navigate("/");
    } catch {
      setError("사용자 정보 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-transparent h-[calc(100vh-4rem)]">
      <div className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-lg border border-gray-700/50 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          시작하기 전에 알려주세요
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">성별</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setGender("male")}
                className={`px-4 py-2 rounded-lg border transition-all duration-300
                  ${
                    gender === "male"
                      ? "border-[#00BFFF] text-[#00BFFF] bg-[#00BFFF]/10"
                      : "border-gray-600 text-gray-400 hover:border-[#00BFFF]/50"
                  }`}
              >
                남성
              </button>
              <button
                onClick={() => setGender("female")}
                className={`px-4 py-2 rounded-lg border transition-all duration-300
                  ${
                    gender === "female"
                      ? "border-[#FF69B4] text-[#FF69B4] bg-[#FF69B4]/10"
                      : "border-gray-600 text-gray-400 hover:border-[#FF69B4]/50"
                  }`}
              >
                여성
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-cyan-500W/20 hover:bg-cyan-500/30 
              text-cyan-300 rounded-lg border border-cyan-500/50 
              transition-all duration-300"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserInfoRegistPage;
