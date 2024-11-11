import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Header/Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로를 가져와서 상황에 맞는 제목 설정
  const getHeaderTitle = () => {
    const path = location.pathname.split("/")[1]; // 경로의 첫 번째 부분 (예: /situation/select => 'situation')

    if (path === "situation") {
      return { title: "상황별 연습", colorClass: "text-[#FFAB01]" };
    } else if (path === "training") {
      return { title: "발음 훈련 연습", colorClass: "text-[#FF8C82]" };
    } else if (path == "lecture") {
      return { title: "발음 훈련 강의", colorClass: "text-[#EE719E]" };
    } else if (path === "announcer") {
      return { title: "아나운서 따라잡기", colorClass: "text-[#B18CFE]" };
    } else if (path === "game") {
      return { title: "산성비 게임", colorClass: "text-[#FE6250]" };
    } else if (path === "analysis") {
      return { title: "내 목소리 분석", colorClass: "text-[#37AFE1]" };
    }

    return { title: "", colorClass: "" };
  };

  const { title, colorClass } = getHeaderTitle();

  return (
    <div className="logo-header font-bold flex justify-between items-center">
      <span
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
        className="text-[#B9E5E8]"
      >
        FIXSPEECH
      </span>

      {/* 경로에 따라 제목 표시 */}
      <span className={colorClass}>{title}</span>
    </div>
  );
}

export default Header;
