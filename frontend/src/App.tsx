import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Suspense, useEffect } from "react";
import ParticleBackground from "./shared/components/Visualizer/ParticleBackground";
import Header from "./shared/components/Header/Header";
import ProtectedRoute from "./shared/routes/ProtectedRoute";
import PublicRoute from "./shared/routes/PublicRoute";
import NotificationListener from "./shared/components/NotificationListener";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useHistoryColorStore from "./shared/stores/historyColorStore";
import { ColorSchemeType } from "./shared/constants/colorSchemes";

import LoginPage from "./pages/Login/LoginPage";
import MainPage from "./pages/MainPage/MainPage";
import AccessPage from "./pages/Login/AccessPage";
import VoiceRecord from "./pages/VoiceAnalysis/VoiceRecordPage";
import VoiceRecordResult from "./pages/VoiceAnalysis/VoiceRecordResultPage";
import VoiceAnalysisList from "./pages/VoiceAnalysis/VoiceAnalysisListPage";
import VoiceAnalysisDetail from "./pages/VoiceAnalysis/VoiceAnalysisDetailPage";
import TrainSelect from "./pages/PronounceTraining/TrainSelectPage";
import TrainPronounce from "./pages/PronounceTraining/TrainPronouncePage";
import Lecture from "./pages/Lecture/LecturePage";

import SelectOptions from "./pages/SituationPractice/SelectOptionsPage";
import RegistScript from "./pages/SituationPractice/RegistScriptPage";
import SelectScript from "./pages/SituationPractice/SelectScriptPage";
import SituationPractice from "./pages/SituationPractice/SituationPracticePage";
import AnnouncerPractice from "./pages/AnnouncerPractice/AnnouncerPracticePage";
import Game from "./pages/Game/GamePage";
import MyVoice from "./pages/MyVoicePage";
import ErrorPage from "./pages/ErrorPage";
import GameRanking from "./pages/Game/GameRankingPage";
import SelectResult from "./pages/SituationPractice/SelectResultPage";
import VoiceList from "./pages/SituationPractice/VoiceListPage";
import UserInfoRegistPage from "./pages/Login/UserInfoRegistPage";
import SituationResult from "./pages/SituationPractice/SituationResultPage";

// 레이아웃 컴포넌트 생성
const Layout = () => {
  const setSelectedColor = useHistoryColorStore(
    (state) => state.setSelectedColor
  );
  const isColorCycling = useHistoryColorStore((state) => state.isColorCycling);

  useEffect(() => {
    if (!isColorCycling) return;

    const colors: ColorSchemeType[] = [
      "green",
      "blue",
      "yellow",
      "red",
      "purple",
    ];
    let currentIndex = 0;
    let lastUpdate = Date.now();
    let isActive = true;

    const updateColor = () => {
      if (!isActive) return;

      const now = Date.now();
      if (now - lastUpdate >= 50) {
        // 50ms 간격으로 업데이트
        currentIndex = (currentIndex + 1) % colors.length;
        setSelectedColor(colors[currentIndex]);
        lastUpdate = now;
      }

      requestAnimationFrame(updateColor);
    };

    requestAnimationFrame(updateColor);

    return () => {
      isActive = false;
    };
  }, [setSelectedColor, isColorCycling]);

  return (
    <>
      <ParticleBackground />
      <NotificationListener />
      <Header />
      <ToastContainer />
      <Suspense fallback={<div></div>}>
        <Outlet />
      </Suspense>
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
            path: "/record/result",
            element: <VoiceRecordResult />,
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
            path: "/situation/result",
            element: <SelectResult />,
          },
          {
            path: "/situation/practice/:scriptId",
            element: <SituationPractice />,
          },
          {
            path: "/situation/voice/:scriptId",
            element: <VoiceList />,
          },
          {
            path: "/situation/voice/result/:resultId",
            element: <SituationResult />,
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
            path: "/user-info",
            element: <UserInfoRegistPage />,
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
