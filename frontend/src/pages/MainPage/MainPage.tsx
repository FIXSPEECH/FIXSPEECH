import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import Buttons from "../../components/MainPage/Buttons";
import UserInfo from "../../components/MainPage/UserInfo";
import History from "../../components/MainPage/History";

function MainPage() {
  const navigate = useNavigate();
  const isLogin = useAuthStore((state) => state.isLogin);

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    }
  }, [isLogin, navigate]);

  return (
    <>
      <UserInfo />
      <History />
      <Buttons />
    </>
  );
}

export default MainPage;
