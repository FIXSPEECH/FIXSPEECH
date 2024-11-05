import Microphone from "../../components/PracticePronounce/Microphone";
import PronounceExample from "../../components/PracticePronounce/PronounceExample";
import { useParams } from "react-router-dom";

function TrainPronounce() {
  const { options } = useParams();

  return (
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
  );  
}

export default TrainPronounce;
