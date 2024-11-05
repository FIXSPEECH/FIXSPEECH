import Microphone from "../../components/PracticePronounce/Microphone";
import PronounceExample from "../../components/PracticePronounce/PronounceExample";
import { useParams } from "react-router-dom";
import Test from '../../components/PracticePronounce/test'

function TrainPronounce() {
  const { options } = useParams();

  return (
    <div className="h-screen">
      <PronounceExample
        color={"#FF8C82"}
        size={3}
        trainingId={options === "practice" ? 1 : 2}
      />
      <Microphone color={"#FF8C82"} size={5} />
      <Test/>
    </div>
  );
}

export default TrainPronounce;
