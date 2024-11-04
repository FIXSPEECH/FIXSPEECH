import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
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
import Lecture from "./pages/PronounceLecture/Lecture";
import SelectOptions from "./pages/SituationPractice/SelectOptions";
import RegistScript from "./pages/SituationPractice/RegistScript";
import SelectScript from "./pages/SituationPractice/SelectScript";
import SituationPractice from "./pages/SituationPractice/SituationPractice";
import AnnouncerPractice from "./pages/AnnouncerImmitate/AnnouncerPractice";
import GameStage from "./pages/Game/GameStage";
import Game from "./pages/Game/Game";
import Analysis from "./pages/Analysis/Analysis";

// 레이아웃 컴포넌트
const Layout = () => {
  const hiddenHeaderRoutes = ["/login", "/user/regist/information"];
  const location = useLocation();

  return (
    <>
      {!hiddenHeaderRoutes.includes(location.pathname) && <Header />}
      <Outlet />
    </>
  );
};

// 라우터 설정
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Public Routes
      {
        element: <PublicRoute />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
        ],
      },
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <MainPage />,
          },
          {
            path: "voice/analysis",
            element: <VoiceAnalysis />,
          },
          {
            path: "pronounce",
            children: [
              {
                path: "practice/select",
                element: <PracticeSelect />,
              },
              {
                path: "practice",
                element: <PracticePronouce />,
              },
              {
                path: "lecture",
                element: <Lecture />,
              },
            ],
          },
          {
            path: "situation/practice",
            children: [
              {
                path: "select",
                element: <SelectOptions />,
              },
              {
                path: "select/script",
                element: <RegistScript />,
              },
              {
                path: "select/script",
                element: <SelectScript />,
              },
              {
                path: "",
                element: <SituationPractice />,
              },
            ],
          },
          {
            path: "announcer/imitate",
            element: <AnnouncerPractice />,
          },
          {
            path: "game",
            children: [
              {
                path: "stage",
                element: <GameStage />,
              },
              {
                path: "",
                element: <Game />,
              },
            ],
          },
          {
            path: "analysis",
            element: <Analysis />,
          },
        ],
      },
      // Other Routes
      {
        path: "user/regist/information",
        element: <AccessPage />,
      },
      {
        path: "testpage",
        element: <TestPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
