import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Login from "./pages/user/Login";
import MainPage from "./pages/MainPage/MainPage";
import AccessPage from "./pages/user/AccessPage";
import VoiceAnalysis from "./pages/user/VoiceAnalysis";
import TestPage from "./pages/TestPage";
import PracticeSelect from "./pages/PronouncePractice/PracticeSelect";
import PracticePronouce from "./pages/PronouncePractice/PracticePronounce";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Lecture from "./pages/PronounceLecture/Lecture";
import SelectOptions from "./pages/SituationPractice/SelectOptions";
import RegistScript from "./pages/SituationPractice/RegistScript";
import SelectScript from "./pages/SituationPractice/SelectScript";
import SituationPractice from "./pages/SituationPractice/SituationPractice";
import AnnouncerPractice from "./pages/AnnouncerImmitate/AnnouncerPractice";
import GameStage from "./pages/Game/GameStage";
import Game from "./pages/Game/Game";
import MyVoice from "./pages/Analysis/Analysis";

function AppWrapper() {
  const hiddenHeaderRoutes = ["/user/regist/information"];
  return (
    <>
      {!hiddenHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        {/* Public Routes - 로그인 사용자는 / 으로 리다이렉트 */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes - 비로그인 사용자는 /login으로 리다이렉트 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/voice/analysis" element={<VoiceAnalysis />} />
          <Route path="/pronounce" element={<PracticeSelect />} />
          <Route path="/pronounce/:options" element={<PracticePronouce />} />
          <Route path="/lecture" element={<Lecture />} />
          <Route path="/situation" element={<SelectOptions />} />
          <Route
            path="/situation/practice/regist/script"
            element={<RegistScript />}
          />
          <Route
            path="/situation/practice/select/script"
            element={<SelectScript />}
          />
          <Route path="/situation/practice/" element={<SituationPractice />} />
          <Route path="/announcer" element={<AnnouncerPractice />} />
          <Route path="/game/stage" element={<GameStage />} />
          <Route path="/game" element={<Game />} />
          <Route path="/myvoice" element={<MyVoice />} />
        </Route>

        <Route path="/user/regist/information" element={<AccessPage />} />
        <Route path="/testpage" element={<TestPage />} />
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
