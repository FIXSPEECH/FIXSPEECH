import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
// 필요한 아이콘 이미지 import
import register from "/buttons/clock.png"; // 이미지 파일 필요
import load from "/buttons/clock.png"; // 이미지 파일 필요

function SelectOptions() {
  const navigate = useNavigate();

  const gridItems = [
    {
      color: "#FF8C82",
      label: "대본 등록",
      imageSrc: register,
      url: "regist",
      imgMargin: 50,
    },
    {
      color: "#FF8C82",
      label: "대본 불러오기",
      imageSrc: load,
      url: "select",
      imgMargin: 50,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, marginRight: "3%", marginLeft: "3%" }}>
      <Typography
        variant="h5"
        className="text-white"
        align="center"
        style={{ wordBreak: "keep-all", whiteSpace: "normal" }}
      >
        *원하는 작업을 선택해주세요. (코드 수정 필요)
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
            size={{ xs: 6, sm: 4, md: 2 }}
            key={index}
            sx={{
              backgroundColor: item.color,
              padding: 2,
              borderRadius: "3%",
              height: 300,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/situation/${item.url}`)}
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

export default SelectOptions;
