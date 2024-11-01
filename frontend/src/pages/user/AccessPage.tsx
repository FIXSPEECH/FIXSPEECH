import { useEffect } from "react";
import useAuthStore from "../../store/authStore";

function Access() {

    const setLogin = useAuthStore((state) => state.setLogin)

    useEffect(()=> {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('accessToken'); // 쿼리 문자열에서 토큰 가져오기
        
        
        if (token) {
            console.log('토큰 발견:', token)
            localStorage.setItem('authorization', token);
         
        } else {
            console.log('error')
        }
        
        setLogin(!!token)
         
        // window.location.replace('/voice/analysis');


        }, [setLogin])

    return (
        <>
        </>
    )
            
}



export default Access;