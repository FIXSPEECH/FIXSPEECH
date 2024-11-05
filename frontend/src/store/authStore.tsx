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
  setToken: (token: string | null) => void;
}

interface TokenPayload {
  iss: string; // 토큰 발급자 (issuer)
  sub: string; // 토큰 제목 (subject)
  email: string; // 사용자 이메일
  name: string; // 사용자 이름
  iat: number; // 토큰 발급 시간 (issued at)
  exp: number; // 토큰 만료 시간 (expiration)
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        isLogin: false,
        setToken: (token) => {
          const tokenData = token ? jwtDecode<TokenPayload>(token) : null;
          set({
            token,
            isLogin: !!tokenData,
          });
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default useAuthStore;
