import AnnouncerExample from "../components/AnnouncerPractice/AnnouncerExample";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from '@mui/material/Button';
import Recorder from "../components/Recorder";
import usePronounceScoreStore from "../store/pronounceScoreStore";
import FinishModal from '../components/PracticePronounce/FinishModal'
import VoiceComparisonChart from "../components/AnnouncerPractice/VoiceChart";


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

  //////////////// 이 부분 응답 데이터로 바꿔 보기 //////////////
  const userF0Data = [99.71, 131.57, 145.15, 154.67, 113.88, 154.67, 165.77, 163.86, 162.92, 149.4, 108.11, 122.05, 141.83, 134.65, 112.57, 122.05, 119.96, 96.87, 107.49, 110.64, 98.0, 119.96, 119.96, 173.61, 162.92, 141.83, 124.19, 107.49, 103.83, 85.81, 81.93];
  const announcerF0Data = [105.64, 102.04, 107.49, 134.65, 86.8, 124.91, 110.64, 113.88, 133.87, 142.65, 119.26, 118.58, 122.05, 103.83, 117.22, 112.57, 130.81, 97.43, 124.19, 114.54, 100.87, 87.81, 93.03, 119.96, 137.79, 143.48, 112.57, 124.91, 122.05, 111.92, 93.57, 89.35, 115.87, 122.76, 103.83, 94.66, 85.31, 82.41, 118.58, 124.19, 125.63, 122.05, 99.14, 108.11, 131.57, 122.76, 119.26, 127.83, 98.57, 102.63, 107.49, 94.66, 97.43, 103.83, 87.81, 84.33, 88.32, 93.03, 105.64, 83.85, 117.9, 89.35, 118.58, 127.09, 111.92, 110.64, 102.04, 83.36, 129.31, 133.87, 132.33, 115.87, 123.47, 98.0, 88.83, 107.49, 122.05, 95.21, 110.64, 129.31, 115.2, 108.11, 137.79, 86.3, 116.54, 113.22, 111.28, 99.14, 118.58, 102.04, 95.76, 79.6, 82.88, 99.14, 87.31];

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

    <div>
    <VoiceComparisonChart userF0Data={userF0Data} announcerF0Data={announcerF0Data} />
    </div>


    <FinishModal isOpen={showModal} onClose={closeModal} />

    
  </>
  );
}

export default AnnouncerPractice;
