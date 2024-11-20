import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import useAuthStore from "../shared/stores/authStore";

// 파일 상단에 타입 정의 추가
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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
    // console.log("인터셉터 에러", error);
    return Promise.reject(error);
  }
);

let isRefreshing = false; // 토큰 재발급 진행 중 여부
let failedQueue: any[] = []; // 실패한 요청 큐

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 401 에러이고 토큰 재발급 시도가 아직 안된 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 재발급 진행 중이면 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await tokenRefresh();
        const newToken = useAuthStore.getState().token;

        if (!newToken) {
          throw new Error("Token refresh failed");
        }

        processQueue(null, newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        Logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// 리프레쉬 토큰으로 엑세스 토큰 재발급 요청
const tokenRefresh = async () => {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error("No token available");
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/user/public/reissue`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          refreshToken: token,
        },
      }
    );
    // const newAccessToken = response.headers.authorization.replace(
    //   /^Bearer\s+/,
    //   ""
    // );

    const newAccessToken = response.data.data;
    if (!newAccessToken) {
      throw new Error("Token refresh failed");
    }

    useAuthStore.getState().setToken(newAccessToken);
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};

const Logout = () => {
  useAuthStore.getState().setToken(null);
  window.location.replace("/login"); // 로그인 페이지로 리다이렉트
};

export default axiosInstance;
export { tokenRefresh };
