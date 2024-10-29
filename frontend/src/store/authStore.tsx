import {create} from 'zustand'
import { devtools } from 'zustand/middleware'; // redux devtools와 통합하여 상태 변경을 디버깅하는데 도움
import { jwtDecode } from 'jwt-decode';

interface AuthState{
    isLogin: boolean;
    setLogin : (status: boolean) => void;
}

interface TokenType {
   
  }


// useAuthStore이라는 Zustand Store 생성
const useAuthStore = create<AuthState>()(
    // 미들웨어를 사용해 상태를 관리하는 함수.
    // set 함수는 상태를 업데이트 하는데 사용
    devtools((set) => {
        const token = localStorage.getItem('authorization')
        const tokenData = token ? jwtDecode<TokenType>(token) : null;
        
        return {
            token, 
            // tokenData가 존재하면 true, 아니면 false
            isLogin : !!tokenData,
            setLogin: (status) => set({ isLogin: status }),
        }
    })
)

export default useAuthStore;