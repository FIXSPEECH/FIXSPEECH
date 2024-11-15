import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
// 아이콘 import
import lecture from "/buttons/lecture.png"
import news from "/buttons/news.png"
import analysis from "/buttons/analysis.png"
import world from "/buttons/world.png"
import pronounce from "/buttons/pronounce.png"
import game from "/buttons/game.png"

function Buttons() {
  const navigate = useNavigate();

  const gridItems = [
    {
      color: "#EE719E",
      label: "발음 훈련 강의",
      imageSrc: lecture,
      url: "/lecture",
      imgMargin: 50,
    },
    {
      color: "#FF8C82",
      label: "발음 훈련 연습",
      imageSrc: pronounce,
      url: "/training",
      imgMargin: 50,
    },
    {
      color: "#FFAB01",
      label: "상황별 연습",
      imageSrc: world,
      url: "/situation",
      imgMargin: 40,
    },
    {
      color: "#B18CFE",
      label: "아나운서 따라잡기",
      imageSrc: news,
      url: "/announcer",
      imgMargin: 15,
    },
    {
      color: "#FE6250",
      label: "산성비 게임",
      imageSrc: game,
      url: "/game",
      imgMargin: 30,
    },
    {
      color: "#37AFE1",
      label: "목소리 분석 결과",
      imageSrc: analysis,
      url: "/analysis",
      imgMargin: 0,
    },
  ];

  const handleKeyPress = (e: React.KeyboardEvent, url: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(url);
    }
  };

  return (
    <Box
      component="nav"
      aria-label="메인 메뉴"
      sx={{
        flexGrow: 1,
        marginRight: "3%",
        marginLeft: "3%",
        // marginBottom: "3%",
      }}
    >
      <Grid container spacing={2}>
        {gridItems.map((item, index) => (
          <Grid
            component="div"
            role="button"
            tabIndex={0}
            key={index}
            size={{ xs: 6, sm: 4, md: 2 }}
            onClick={() => navigate(item.url)}
            onKeyDown={(e) => handleKeyPress(e, item.url)}
            aria-label={item.label}
            sx={{
              backgroundColor: item.color,
              padding: 2,
              borderRadius: "3%",
              height: 270,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.3s ease", // 부드러운 애니메이션
              "&:hover": {
                transform: "translateY(-10px)", // 호버 시 위로 팝업
                outline: "3px solid #000",
              },
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: "1.5rem",
                wordBreak: "keep-all",
                whiteSpace: "normal",
              }}
            >
              {item.label}
            </div>
            <img
              src={item.imageSrc}
              alt={item.label}
              style={{
                width: "100%",
                marginTop: item.imgMargin,
                marginLeft: 15,
                objectFit: "cover",
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Buttons;
