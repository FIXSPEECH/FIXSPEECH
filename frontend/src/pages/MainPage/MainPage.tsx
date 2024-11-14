import Buttons from "./components/Buttons";
import UserInfo from "./components/UserInfo";
import History from "./components/History";
import RecentVoice from "./components/RecentVoice";
import { useEffect } from "react";

import { tokenRefresh } from "../../services/axiosInstance";

function MainPage() {
  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        await tokenRefresh(); // 토큰 재발급 호출
        console.log("토큰 재발급 성공");
      } catch (error) {
        console.error("토큰 재발급 실패", error);
        // 여기서 필요한 추가 처리 가능
      }
    };

    refreshAccessToken();
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-3">
          <div
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50
            hover:border-cyan-500/50 rounded-lg h-full flex flex-col shadow-lg"
          >
            <UserInfo />
            <History />
          </div>
        </div>
        <div className="w-full md:w-1/2 p-3">
          <div
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50
            hover:border-cyan-500/50 rounded-lg h-full flex flex-col shadow-lg"
          >
            "
            <RecentVoice />
          </div>
        </div>
      </div>
      <Buttons />
    </>
  );
}

export default MainPage;
