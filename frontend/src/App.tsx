import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Login from "./pages/user/Login";
import MainPage from "./pages/MainPage/MainPage";
import AccessPage from "./pages/user/AccessPage";
import VoiceAnalysis from "./pages/user/VoiceAnalysis";
import TestPage from "./pages/TestPage";
import PracticeSelect from "./pages/PronouncePractice/PracticeSelect";
import PracticePronouce from "./pages/PronouncePractice/PracticePronouce";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function AppWrapper() {
  const hiddenHeaderRoutes = ["/", "/user/regist/information"];
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
        {/* Public Routes - 로그인 사용자는 / 으로 리다이렉트 */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/user/regist/information" element={<AccessPage />} />

        {/* Protected Routes - 비로그인 사용자는 /login으로 리다이렉트 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/voice/analysis" element={<VoiceAnalysis />} />
          <Route path="/testpage" element={<TestPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/pronounce/practice/select" element={<PracticeSelect />} />
          <Route path="/pronounce/practice" element={<PracticePronouce />} />
        </Route>
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
