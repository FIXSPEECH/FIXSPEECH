import '../../styles/user/Login.css'
import Kakao from '../../assets/kakao.png';


// 로그인 버튼을 누를시 카카오 로그인
function Login(){
    const handleLogin = () => {
        window.location.href =
          import.meta.env.VITE_API_URL + '/oauth2/authorization/kakao';
      };

    return (
        <>
            <div className='login-container'>
                <img src={Kakao} alt='kakao login' onClick={handleLogin} />
            </div>
        </>
    )
}

export default Login;