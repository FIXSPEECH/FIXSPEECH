import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
// 아이콘 img import
import clock from "/buttons/clock.png";
import find from "/buttons/find.png";
import geo from "/buttons/geo.png";
import music from "/buttons/music.png";
import read from "/buttons/read.png";

function Buttons() {
  const navigate = useNavigate();

  const gridItems = [
    {
      color: "#EE719E",
      label: "발음 훈련 강의",
      imageSrc: music,
      url: "/lecture",
      imgMargin: 50,
    },
    {
      color: "#FF8C82",
      label: "발음 훈련 연습",
      imageSrc: music,
      url: "/training",
      imgMargin: 50,
    },
    {
      color: "#FFAB01",
      label: "상황별 연습",
      imageSrc: geo,
      url: "/situation",
      imgMargin: 50,
    },
    {
      color: "#B18CFE",
      label: "아나운서 따라잡기",
      imageSrc: read,
      url: "/announcer",
      imgMargin: 5,
    },
    {
      color: "#FE6250",
      label: "산성비 게임",
      imageSrc: clock,
      url: "/game",
      imgMargin: 50,
    },
    {
      color: "#37AFE1",
      label: "내 목소리 분석 결과 확인",
      imageSrc: find,
      url: "/analysis",
      imgMargin: 50,
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
