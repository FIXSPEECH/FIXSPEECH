import {create} from 'zustand'
import { devtools } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface AuthState{
    isLogin: boolean;
    setLogin : (status: boolean) => void;
}

interface TokenType {
   
  }

const useAuthStore = create<AuthState>()(
    devtools((set) => {
        const token = localStorage.getItem('authorization')
        const tokenData = token ? jwtDecode<TokenType>(token) : null;
        
        return {
            token, 
            isLogin : !!tokenData,
            setLogin: (status) => set({ isLogin: status }),
        }
    })
)

export default useAuthStore;