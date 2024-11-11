import axios, { AxiosResponse, AxiosError } from "axios";
import useAuthStore from "../store/authStore";
import { tokenRefresh } from "./axiosInstance"; // tokenRefresh 함수를 별도 헬퍼로 분리


// FastAPI용 axios 인스턴스 생성
const fastApiInstance = axios.create({
    baseURL: import.meta.env.VITE_FASTAPI_URL, // FastAPI 서버의 URL
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  // 요청 인터셉터 - Access Token 추가
  fastApiInstance.interceptors.request.use(
    function (config) {
      const token = useAuthStore.getState().token;
  
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    function (error) {
      console.log("FastAPI 요청 인터셉터 에러", error);
      return Promise.reject(error);
    }
  );
  
  // 응답 인터셉터 - Access Token 만료 시 토큰 재발급 요청
  fastApiInstance.interceptors.response.use(
    function (response: AxiosResponse) {
      return response;
    },
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        try {
          // Spring 서버에 토큰 재발급 요청
          await tokenRefresh();
  
          // 새로운 토큰을 가져온 후 FastAPI 요청을 다시 시도
          const token = useAuthStore.getState().token;
          if (token && error.config) {
            error.config.headers["Authorization"] = `Bearer ${token}`;
            return fastApiInstance(error.config);
          }
        } catch (refreshError) {
          console.log("토큰 재발급 실패:", refreshError);
         
        }
      }
      return Promise.reject(error);
    }
  );

  export default fastApiInstance;