import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Header/Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로를 가져와서 상황에 맞는 제목 설정
  const getHeaderTitle = () => {
    const path = location.pathname.split("/")[1]; // 경로의 첫 번째 부분 (예: /situation/select => 'situation')

    if (path === "situation") {
      return {
        title: "상황별 연습",
        colorClass: "text-[#FFAB01]",
        url: "/situation",
      };
    } else if (path === "training") {
      return {
        title: "발음 훈련 연습",
        colorClass: "text-[#FF8C82]",
        url: "/training",
      };
    } else if (path == "lecture") {
      return {
        title: "발음 훈련 강의",
        colorClass: "text-[#EE719E]",
        url: "/lecture",
      };
    } else if (path === "announcer") {
      return {
        title: "아나운서 따라잡기",
        colorClass: "text-[#B18CFE]",
        url: "/announcer",
      };
    } else if (path === "game") {
      return {
        title: "산성비 게임",
        colorClass: "text-[#FE6250]",
        url: "/game",
      };
    } else if (path === "analysis") {
      return {
        title: "내 목소리 분석",
        colorClass: "text-[#37AFE1]",
        url: "/analysis",
      };
    }

    return { title: "", colorClass: "", url: "/" };
  };

  const { title, colorClass, url } = getHeaderTitle();

  return (
    <div className="logo-header font-bold flex justify-between items-center">
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
        className="text-[#B9E5E8]"
      >
        FIXSPEECH
      </a>

      {/* 경로에 따라 제목 표시 */}
      <a
        href={url}
        onClick={(e) => {
          e.preventDefault();
          navigate(url);
        }}
        className={colorClass}
      >
        {title}
      </a>
    </div>
  );
}

export default Header;
