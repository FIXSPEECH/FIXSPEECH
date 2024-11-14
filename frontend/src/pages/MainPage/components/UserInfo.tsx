import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../shared/stores/authStore";

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
    <div className="flex-shrink-0 py-5">
      <div className="flex items-center mx-[3%] justify-center">
        <Avatar
          alt={userProfile.name || "사용자"}
          src={userProfile.image || "/static/images/avatar/1.jpg"}
          sx={{ width: 80, height: 80 }}
        />
        <div className="flex flex-col items-center gap-2 ml-4">
          <span className="text-white text-lg font-medium mb-2">
            반가워요, {userProfile.name || "사용자"}님!
          </span>
          <div className="flex items-center gap-2">
            <div
              className="flex justify-center items-center text-white bg-white bg-opacity-25 rounded-md w-48 h-9 cursor-pointer"
              onClick={() => navigate("/record")}
            >
              내 목소리 분석하기
            </div>
            <div
              className="flex justify-center items-center text-white bg-white bg-opacity-25 rounded-md w-24 h-9 cursor-pointer"
              onClick={handleLogout}
            >
              로그아웃
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
