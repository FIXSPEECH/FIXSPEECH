import { create } from "zustand";
import { devtools } from "zustand/middleware"; // redux devtools와 통합하여 상태 변경을 디버깅하는데 도움
import { jwtDecode } from "jwt-decode";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * const { setToken } = useAuthStore();
 * 로그인 시
 * setToken("your-jwt-token");
 *
 * 로그아웃 시
 * setToken(null);
 * 로 사용하면 localStorage에 토큰이 저장되고 로그인 상태를 유지할 수 있습니다.
 */

interface AuthState {
  token: string | null;
  isLogin: boolean;
  userProfile: {
    image: string | null;
    nickName: string | null;
    gender: string | null;
    age: number | null;
  };
  setToken: (token: string | null) => void;
}

interface TokenPayload {
  iss: string;
  sub: string;
  email: string;
  image: string;
  nickName: string;
  gender: string;
  age: number;
  iat: number;
  exp: number;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        isLogin: false,
        userProfile: {
          image: null,
          nickName: null,
          gender: null,
          age: null,
        },
        setToken: (token) => {
          if (token) {
            const tokenData = jwtDecode<TokenPayload>(token);
            set({
              token,
              isLogin: true,
              userProfile: {
                image: tokenData.image,
                nickName: tokenData.nickName,
                gender: tokenData.gender,
                age: tokenData.age,
              },
            });
          } else {
            // 로그아웃 시 모든 상태 초기화
            set({
              token: null,
              isLogin: false,
              userProfile: {
                image: null,
                nickName: null,
                gender: null,
                age: null,
              },
            });
          }
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) =>
          state.isLogin
            ? state
            : {
                token: null,
                isLogin: false,
                userProfile: {
                  image: null,
                  nickName: null,
                  gender: null,
                  age: null,
                },
              },
      }
    )
  )
);

export default useAuthStore;
