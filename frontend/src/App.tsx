
// import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from './components/Header/Header'
import Login from './pages/user/Login';
import MainPage from './pages/MainPage/MainPage'
import AccessPage from './pages/user/AccessPage'
import VoiceAnalysis from "./pages/user/VoiceAnalysis";

function AppWrapper() {
  // const navigate = useNavigate();
  const location = useLocation();

  const hiddenHeaderRoutes = ['/', '/user/regist/information'];

  // useEffect(() => {
  //   const accessToken = sessionStorage.getItem("accessToken");

  //   // 인증이 필요 없는 경로 리스트
  //   const publicPaths = ["/user/login", "/user/signUp", "/introduce"];

  //   // 현재 경로가 인증이 필요 없는 경로가 아닌데, 토큰이 없으면 로그인 페이지로 이동
  //   if (!accessToken && !publicPaths.includes(location.pathname)) {
  //     navigate("/introduce");
  //   }
  // }, [location, navigate]);

  return (
    <>
    {!hiddenHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/user/regist/information' element={<AccessPage/>}/>
        <Route path='/mainpage' element={<MainPage/>}/>
        <Route path='/voice/analysis' element={<VoiceAnalysis/>} />
      </Routes>
   

    </>
  );
}


function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;

