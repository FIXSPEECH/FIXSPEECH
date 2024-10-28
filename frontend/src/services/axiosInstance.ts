import axios, { AxiosResponse, AxiosError } from 'axios'


// axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type':'application/json'
    }
});


// axios 인터셉터 => Access Token 재발급
// 요청 인터셉터
axiosInstance.interceptors.request.use(
    function(config){
        const token = localStorage.getItem('authorization')

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },

    function (error) {
        console.log('인터셉터 에러', error)
        return Promise.reject(error);
    }
)

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    function (response: AxiosResponse){
        return response
    },
    async (error: AxiosError) => {
        if(error.response?.status === 401) {
            try{
                // 로컬스토리에 저장된 엑세스 토큰 갱신
                await tokenRefresh();

                const accessToken = localStorage.getItem('authorization')
                if (accessToken && error.config) {
                    console.log( '새 엑세스 토큰 발급', error.config)

                    error.config.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(error.config)
                }
            } catch (refreshError){
                Logout();
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)


const tokenRefresh = async() => {
    try {
        const response = await axiosInstance.post(
            '/api/oauth/get-user-token',
        )

        const newAccessToken = response.headers.authorization.replace( /^Bearer\s+/, '');
        
        if (!newAccessToken) {
            console.log('엑세스 토큰 재발급 실패')
            return
        }

        // 재발급 한 엑세스 토큰 저장
        localStorage.setItem('authorization', newAccessToken)
    } catch (e) {
        console.error('리프레시 토큰 요청 중 오류', e)
        throw e;
    }
}


// 로그아웃
const Logout = async() => {
    localStorage.removeItem('authorization');
    window.location.replace('/');
    
}



export default axiosInstance;