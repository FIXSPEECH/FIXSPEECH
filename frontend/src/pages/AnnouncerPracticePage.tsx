import AnnouncerExample from "../components/AnnouncerPractice/AnnouncerExample";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from '@mui/material/Button';
import Recorder from "../components/Recorder";
import usePronounceScoreStore from "../store/pronounceScoreStore";
import FinishModal from '../components/PracticePronounce/FinishModal'

function AnnouncerPractice() {
  const [showModal, setShowModal] = useState<boolean>(false)
  const {setIsNumberZero} = usePronounceScoreStore();
  const navigate = useNavigate();

  const closeModal = () => {
    setShowModal(false); // 모달 닫기
    setIsNumberZero();
    navigate('/')
  }

  const handleClick = () => {
    setShowModal(true)
  }

  return (  
    <>
    <Button variant="outlined"
        sx={{
          color: '#D5C6F5',
          borderColor : '#D5C6F5',
          fontSize: {
            sm: "1.125rem",  // sm:text-lg
            md: "1.125rem",  // md:text-lg
            lg: "1.25rem",   // lg:text-xl
            xl: "1.5rem",    // xl:text-2xl
          },}}
          style={{marginLeft: '3%'}}
          onClick={handleClick}
          >
      종료하기</Button>
    <div className="min-h-[70vh] flex justify-center">
    <div className="flex flex-col justify-center align-middle">
      <AnnouncerExample   
          color={"#B18CFE"}
          size={3}/>
      <Recorder color={"#D5C6F5"} barColor={"rgb(177,140,254)"} width={300} height={75} visualizeWidth="300px" modalType="record"/>
    </div>
    </div>

    <FinishModal isOpen={showModal} onClose={closeModal} />
  </>
  );
}

export default AnnouncerPractice;
