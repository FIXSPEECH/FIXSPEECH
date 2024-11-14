import AnnouncerExample from "./components/AnnouncerExample";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "@mui/material/Button";
import Recorder from "../../shared/components/Recorder";
import usePronounceScoreStore from "../../shared/stores/pronounceScoreStore";
import FinishModal from "../../shared/components/PracticePronounce/FinishModal";
import useGraphStore from "../../shared/stores/graphStore";
import VoiceComparisonChart from "./components/VoiceChart";

function AnnouncerPractice() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { setIsNumberZero } = usePronounceScoreStore();
  const navigate = useNavigate();
  const { user, announcer } = useGraphStore();

  const closeModal = () => {
    setShowModal(false); // 모달 닫기
    setIsNumberZero();
    navigate("/training");
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
          <div className="flex flex-row justify-center items-center space-x-4">
            <Recorder
              color={"#D5C6F5"}
              barColor={"rgb(177,140,254)"}
              width={300}
              height={75}
              visualizeWidth="300px"
              modalType="record"
            />

            {user && announcer && user.length > 0 && announcer.length > 0 ? (
              <div style={{ width: "600px" }}>
                <VoiceComparisonChart
                  userF0Data={user}
                  announcerF0Data={announcer}
                />
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
