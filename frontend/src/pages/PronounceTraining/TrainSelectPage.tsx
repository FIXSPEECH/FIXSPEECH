import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
// 아이콘 img import
import puzzle from "/buttons/puzzle.png";
import music from "/buttons/music.png";
import Typography from "@mui/material/Typography";

function TrainSelect() {
  const navigate = useNavigate();

  const gridItems = [
    {
      color: "#FF8C82",
      label: "문장연습",
      imageSrc: music,
      url: "sentence",
      imgMargin: 50,
    },
    {
      color: "#FF8C82",
      label: "잰말놀이",
      imageSrc: puzzle,
      url: "tongue-twister",
      imgMargin: 50,
    },
  ];

  return (
    <div className="min-h-[70vh] flex justify-center items-center">
    <div className="flex flex-col justify-center align-middle">
        <Box sx={{ flexGrow: 1, marginRight: "3%", marginLeft: "3%" }}>
          <Typography
            variant="h5"
            className="text-white"
            align="center"
            style={{ wordBreak: "keep-all", whiteSpace: "normal" }}
          >
            *원하는 훈련 종류를 선택해주세요.
          </Typography>
          <Grid
            container
            spacing={5}
            justifyContent="center"
            alignItems="center"
            className="mt-10"
          >
            {gridItems.map((item, index) => (
              <Grid
                size={{ xs: 6, sm: 6, md: 6 }}
                className="w-full md:w-1/2 lg:w-1/3"
                key={index}
                sx={{
                  backgroundColor: item.color,
                  padding: 2,
                  borderRadius: "3%",
                  height: 300,
                  // width: {xs: 250},
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.3s ease", // 부드러운 애니메이션 
                  "&:hover": {
                    transform: "translateY(-10px)", // 호버 시 위로 팝업
                  },
                }}
                onClick={() => navigate(`/training/${item.url}`)}
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
    </div>
    </div>
  );
}

export default TrainSelect;
