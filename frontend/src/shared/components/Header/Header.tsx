import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const ROUTE_CONFIG = {
  situation: {
    title: "상황별 연습",
    colorClass: "text-[#FFAB01]",
    url: "/situation",
  },
  training: {
    title: "발음 훈련 연습",
    colorClass: "text-[#FF8C82]",
    url: "/training",
  },
  lecture: {
    title: "발음 훈련 강의",
    colorClass: "text-[#EE719E]",
    url: "/lecture",
  },
  announcer: {
    title: "아나운서 따라잡기",
    colorClass: "text-[#B18CFE]",
    url: "/announcer",
  },
  game: {
    title: "산성비 게임",
    colorClass: "text-[#FE6250]",
    url: "/game",
  },
  analysis: {
    title: "내 목소리 분석",
    colorClass: "text-[#37AFE1]",
    url: "/analysis",
  },
  record: {
    title: "내 목소리 분석",
    colorClass: "text-[#37AFE1]",
    url: "/record",
  },
} as const;

// 헤더 컴포넌트
function Header() {
  const location = useLocation();

  const getHeaderTitle = () => {
    const path = location.pathname.split("/")[1];
    return (
      ROUTE_CONFIG[path as keyof typeof ROUTE_CONFIG] || {
        title: "",
        colorClass: "",
        url: "/",
      }
    );
  };

  const { title, colorClass, url } = getHeaderTitle();

  return (
    <header
      className="flex justify-between items-center px-[3%] py-[1.5%] text-2xl font-bold"
      role="banner"
    >
      <h1>
        <Link
          to="/"
          className="text-[#B9E5E8] hover:opacity-80 transition-opacity"
          aria-label="홈으로 이동"
        >
          FIXSPEECH
        </Link>
      </h1>

      {title && (
        <nav aria-label="메인 네비게이션">
          <Link
            to={url}
            className={`${colorClass} hover:opacity-80 transition-opacity`}
            aria-current={location.pathname === url ? "page" : undefined}
          >
            {title}
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;
