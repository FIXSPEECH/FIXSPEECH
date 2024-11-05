import { useEffect } from "react";
import useAuthStore from "../../store/authStore";

function Access() {
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("accessToken"); // 쿼리 문자열에서 토큰 가져오기

    if (token) {
      console.log("토큰 발견:", token);
      setToken(token);
      window.location.replace("/record");
    } else {
      console.log("토큰을 찾을 수 없습니다");
      window.location.replace("/login");
    }
  }, [setToken]);

  return <></>;
}

export default Access;
