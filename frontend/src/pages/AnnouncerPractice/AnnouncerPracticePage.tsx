import AnnouncerExample from "./components/AnnouncerExample";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "@mui/material/Button";
import Recorder from "../../shared/components/Recorder";
import usePronounceScoreStore from "../../shared/stores/pronounceScoreStore";
import FinishModal from "../../shared/components/PracticePronounce/FinishModal";
import useGraphStore from "../../shared/stores/graphStore";
import VoiceComparisonChart from "./components/VoiceChart";
import { announcerFinishPost } from "../../services/AnnouncerPractice/AnnouncerPracticePost";

function AnnouncerPractice() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { setIsNumberZero } = usePronounceScoreStore();
  const navigate = useNavigate();
  const { user, announcer } = useGraphStore();

  const finishPost = async() => {
    try{
      const response = await announcerFinishPost() 
      console.log(response)
    } catch(e) {
      console.log(e)
    }
  }

  const closeModal = () => {
    setShowModal(false); // 모달 닫기
    setIsNumberZero();
    navigate("/");
    finishPost()
  };

  const handleClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <Button
        variant="outlined"
        sx={{
          color: "#D5C6F5",
          borderColor: "#D5C6F5",
          fontSize: {
            sm: "1.125rem", // sm:text-lg
            md: "1.125rem", // md:text-lg
            lg: "1.25rem", // lg:text-xl
            xl: "1.5rem", // xl:text-2xl
          },
        }}
        style={{ marginLeft: "3%" }}
        onClick={handleClick}
      >
        종료하기
      </Button>
      <div className="min-h-[70vh] flex justify-center">
        <div className="flex flex-col justify-center align-middle">
          <AnnouncerExample color={"#B18CFE"} size={3} />
          {/* <Recorder color={"#D5C6F5"} barColor={"rgb(177,140,254)"} width={300} height={75} visualizeWidth="300px" modalType="record"/> */}

          {/* 수평 배치를 위한 flex-row 추가 */}
          {/* <div className="flex flex-row justify-center items-center space-x-4"> */}
          <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4 space-y-4 md:space-y-0">
            <Recorder
              color={"#D5C6F5"}
              barColor={"rgb(177,140,254)"}
              width={300}
              height={75}
              visualizeWidth="300px"
              modalType="record"
            />

            {user && announcer && user.length > 0 && announcer.length > 0 ? (
              // <div style={{ width: "600px" }}>
              <div
              className="w-full md:w-[600px]" // 기본은 600px, 모바일에서는 전체 너비
              style={{  height: "auto" }} // 모바일 크기 줄임
            >
                <VoiceComparisonChart
                  userF0Data={user}
                  announcerF0Data={announcer}
                />
                 <div className='text-[#B18CFE] flex justify-center mt-5'> *해당 그래프의 주파수는 말의 억양을 나타내고 있습니다.</div>
                 <div className='text-[#B18CFE] flex justify-center mb-5'> 아나운서와 비슷한 억양으로 말해보세요.</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <FinishModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}

export default AnnouncerPractice;
