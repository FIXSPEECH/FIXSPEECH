import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
// 아이콘 img import
import script from "/buttons/script.png";
import practicelist from "/buttons/practicelist.png";
import regist from "/buttons/regist.png";


function TrainSelect() {
  const navigate = useNavigate();

  const gridItems = [
    {
      color: "#FFAB01",
      label: "대본 등록",
      imageSrc: regist,
      url: "regist",
    },
    {
      color: "#FFAB01",
      label: "대본 불러오기",
      imageSrc: script,
      url: "select",
    },
    {
      color: "#FFAB01",
      label: "연습 내역 조회",
      imageSrc: practicelist,
      url: "result",
    },
  ];

  return (
    <div className="min-h-[70vh] flex justify-center items-center p-4" role="main">
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
            <button
              key={index}
              onClick={() => navigate(`/situation/${item.url}`)}
              className="w-[250px] h-[300px] rounded-lg cursor-pointer transition-transform hover:-translate-y-2"
              style={{
                backgroundColor: item.color,
              }}
              aria-label={item.label}
            >
              <div className="p-4 h-full flex flex-col justify-between">
                <div className="text-white text-2xl font-medium">
                  {item.label}
                </div>
                <img
                  src={item.imageSrc}
                  alt=""
                  role="presentation"
                  className="w-[80%] mx-auto mt-4"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrainSelect;
