import { useEffect } from "react";
import useAuthStore from "../../shared/stores/authStore";
import { jwtDecode } from "jwt-decode";

function Access() {
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("accessToken"); // 쿼리 문자열에서 토큰 가져오기

    if (token) {
      console.log("토큰 발견:", token);
      setToken(token);

      // 토큰 디코딩 후 gender 확인
      try {
        const tokenData = jwtDecode<{ gender: string }>(token);
        if (tokenData.gender === "male" || tokenData.gender === "female") {
          window.location.replace("/");
        } else {
          window.location.replace("/user-info");
        }
      } catch (error) {
        console.error("토큰 처리 중 오류:", error);
        window.location.replace("/login");
      }
    } else {
      console.log("토큰을 찾을 수 없습니다");
      window.location.replace("/login");
    }
  }, [setToken]);

  return <></>;
}

export default Access;
