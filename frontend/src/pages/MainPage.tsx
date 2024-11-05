import Buttons from "../components/MainPage/Buttons";
import UserInfo from "../components/MainPage/UserInfo";
import History from "../components/MainPage/History";
import { useEffect } from "react";

import { tokenRefresh } from "../services/axiosInstance";

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
      <UserInfo />
      <History />
      <Buttons />
    </>
  );
}

export default MainPage;
