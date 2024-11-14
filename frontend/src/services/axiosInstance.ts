import axios, { AxiosResponse, AxiosError } from "axios";
import useAuthStore from "../shared/stores/authStore";

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// axios 인터셉터 => Access Token 재발급
// 요청 인터셉터
axiosInstance.interceptors.request.use(
  function (config) {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      // 토큰 확인을 위한 콘솔 로그
      // console.log("토큰 전송", token);
    }
    return config;
  },

  function (error) {
    console.log("인터셉터 에러", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        await tokenRefresh();
        const token = useAuthStore.getState().token;

        if (token && error.config) {
          // 토큰 재발급 확인을 위한 콘솔 로그
          // console.log("새 엑세스 토큰 발급", error.config);
          // error.config.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(error.config);
        }
      } catch (refreshError) {
        Logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 리프레쉬 토큰으로 엑세스 토큰 재발급 요청
const tokenRefresh = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/user/public/accessToken`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const newAccessToken = response.headers.authorization.replace(
      /^Bearer\s+/,
      ""
    );

    if (!newAccessToken) {
      console.log("엑세스 토큰 재발급 실패");
      return;
    }

    // Zustand store를 통해 토큰 저장
    useAuthStore.getState().setToken(newAccessToken);
  } catch (e) {
    console.error("리프레시 토큰 요청 중 오류", e);
    throw e;
  }
};

// 로그아웃
const Logout = async () => {
  useAuthStore.getState().setToken(null);
  window.location.replace("/");
};

export default axiosInstance;
export { tokenRefresh };
