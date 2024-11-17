import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
// 아이콘 img import
import pronounce from "/buttons/pronounce.png";
import Typography from "@mui/material/Typography";

function TrainSelect() {
  const navigate = useNavigate();

  const gridItems = [
    {
      color: "#FF8C82",
      label: "문장연습",
      imageSrc: pronounce,
      url: "sentence",
      imgMargin: 50,
    },
    {
      color: "#FF8C82",
      label: "잰말놀이",
      imageSrc: pronounce,
      url: "tongue-twister",
      imgMargin: 50,
    },
  ];

  return (
    <div className="min-h-[70vh] flex justify-center items-center p-4">
      <div className="w-full max-w-4xl">
        <Typography
          variant="h5"
          className="text-white text-center mb-10"
          style={{ wordBreak: "keep-all" }}
        >
          *원하는 훈련 종류를 선택해주세요.
        </Typography>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-10">
          {gridItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/training/${item.url}`)}
              className="w-[250px] h-[300px] rounded-lg cursor-pointer transition-transform hover:-translate-y-2"
              style={{
                backgroundColor: item.color,
              }}
            >
              <div className="p-4 h-full flex flex-col justify-between">
                <div className="text-white text-2xl font-medium">
                  {item.label}
                </div>
                <img
                  src={item.imageSrc}
                  alt={item.label}
                  className="w-[80%] mx-auto mt-4"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrainSelect;
