import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../shared/stores/authStore";
import axiosInstance from "../../../services/axiosInstance";

function UserInfo() {
  const navigate = useNavigate();
  const { setToken, userProfile } = useAuthStore();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/user/logout");
      // console.log("로그아웃 성공");
      setToken(null);
    } catch (error) {
      console.error("로그아웃 통신 실패:", error);
      // console.log("토큰 초기화");
      setToken(null);
    }
  };

  return (
    <div className="p-5 w-full flex justify-center">
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 max-w-full">
        <Avatar
          alt={userProfile.nickName || "사용자"}
          src={userProfile.image || "/static/images/avatar/1.jpg"}
          sx={{ width: 70, height: 70 }}
        />
        <div className="flex flex-col items-center sm:items-start gap-3">
          <span className="text-white text-lg font-medium">
            반가워요, {userProfile.nickName || "사용자"}님!
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="px-4 py-2 text-sm text-white bg-white/20 hover:bg-white/30 
                rounded-md transition-colors"
              onClick={() => navigate("/record")}
            >
              내 목소리 분석하기
            </button>
            <button
              className="px-4 py-2 text-sm text-white bg-white/20 hover:bg-white/30 
                rounded-md transition-colors"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
