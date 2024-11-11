import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import ParticleBackground from "./components/Visualizer/ParticleBackground";
import Header from "./components/Header/Header";
import LoginPage from "./pages/Login/LoginPage";
import MainPage from "./pages/MainPage";
import AccessPage from "./pages/Login/AccessPage";
import VoiceRecord from "./pages/VoiceAnalysis/VoiceRecordPage";
import VoiceAnalysisList from "./pages/VoiceAnalysis/VoiceAnalysisListPage";
import VoiceAnalysisDetail from "./pages/VoiceAnalysis/VoiceAnalysisDetailPage";
import TrainSelect from "./pages/PronounceTraining/TrainSelectPage";
import TrainPronounce from "./pages/PronounceTraining/TrainPronouncePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Lecture from "./pages/LecturePage";
import SelectOptions from "./pages/SituationPractice/SelectOptionsPage";
import RegistScript from "./pages/SituationPractice/RegistScriptPage";
import SelectScript from "./pages/SituationPractice/SelectScriptPage";
import SituationPractice from "./pages/SituationPractice/SituationPracticePage";
import AnnouncerPractice from "./pages/AnnouncerPracticePage";
import Game from "./pages/Game/GamePage";
import MyVoice from "./pages/MyVoicePage";
import ErrorPage from "./pages/ErrorPage";
import GameRanking from "./pages/Game/GameRanking";
import FastApiTestPage from "./pages/FastApiTestPage";
// 레이아웃 컴포넌트 생성
const Layout = () => {
  return (
    <>
      <ParticleBackground />
      <Header />
      <Outlet />
    </>
  );
};

// 라우터 설정
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        // Public Routes
        element: <PublicRoute />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
        ],
      },
      {
        // Protected Routes
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <MainPage />,
          },
          {
            path: "/record",
            element: <VoiceRecord />,
          },
          {
            path: "/analysis",
            element: <VoiceAnalysisList />,
          },
          {
            path: "/analysis/:id",
            element: <VoiceAnalysisDetail />,
          },
          {
            path: "/lecture",
            element: <Lecture />,
          },
          {
            path: "/training",
            element: <TrainSelect />,
          },
          {
            path: "/training/:options",
            element: <TrainPronounce />,
          },
          {
            path: "/situation",
            element: <SelectOptions />,
          },
          {
            path: "/situation/regist",
            element: <RegistScript />,
          },
          {
            path: "/situation/select",
            element: <SelectScript />,
          },
          {
            path: "/situation/practice/:scriptId",
            element: <SituationPractice />,
          },
          {
            path: "/announcer",
            element: <AnnouncerPractice />,
          },
          {
            path: "/game",
            element: <Game />,
          },
          {
            path: "/game/ranking",
            element: <GameRanking />,
          },
          {
            path: "/myvoice",
            element: <MyVoice />,
          },
          {
            path: "/audiotest",
            element: <FastApiTestPage />,
          },
        ],
      },
      {
        path: "/user/regist/information",
        element: <AccessPage />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
