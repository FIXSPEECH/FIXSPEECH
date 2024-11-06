import Microphone from "../../components/PracticePronounce/Microphone";
import PronounceExample from "../../components/PracticePronounce/PronounceExample";
import { useParams } from "react-router-dom";
import Button from '@mui/material/Button';

function TrainPronounce() {
  const { options } = useParams();

  return (
    <>
      <Button variant="outlined"
          sx={{
            color: '#FF8C82',
            borderColor : '#FF8C82',
            fontSize: {
              sm: "1.125rem",  // sm:text-lg
              md: "1.125rem",  // md:text-lg
              lg: "1.25rem",   // lg:text-xl
              xl: "1.5rem",    // xl:text-2xl
            },}}
            style={{marginLeft: '3%'}}
            >
        종료하기</Button>
      <div className="min-h-[70vh] flex justify-center">
      <div className="flex flex-col justify-center align-middle">
        <PronounceExample
          color={"#FF8C82"}
          size={3}
          trainingId={options === "practice" ? 1 : 2}
        />
        <Microphone color={"#FF8C82"} size={5} />
      </div>
      </div>
    </>
  );  
}

export default TrainPronounce;
