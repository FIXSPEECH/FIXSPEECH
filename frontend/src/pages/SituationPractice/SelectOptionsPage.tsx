import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
// 아이콘 img import
import world from "/buttons/world.png";

function TrainSelect() {
  const navigate = useNavigate();

  const gridItems = [
    {
      color: "#FFAB01",
      label: "대본 등록",
      imageSrc: world,
      url: "regist",
    },
    {
      color: "#FFAB01",
      label: "대본 불러오기",
      imageSrc: world,
      url: "select",
    },
    {
      color: "#FFAB01",
      label: "연습 내역 조회",
      imageSrc: world,
      url: "result",
    },
  ];

  return (
    <div className="min-h-[70vh] flex justify-center items-center p-4">
      <div className="w-full max-w-4xl">
        <Typography
          variant="h5"
          className="text-white text-center mb-10"
          style={{ wordBreak: "keep-all",
            fontFamily: "inherit"}}
        >
          *원하는 기능을 선택해주세요.
        </Typography>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-10">
          {gridItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/situation/${item.url}`)}
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
