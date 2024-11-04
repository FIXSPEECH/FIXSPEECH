import Microphone from "../../components/Microphone";
import PronounceExample from "../../components/PracticePronounce/PronounceExample";
import { useParams } from "react-router-dom";

function PracticePronounce() {
    const {options} = useParams();

    return (
        <div className="">
            <PronounceExample color={'#FF8C82'} size={3} trainingId={options === 'practice' ? 1 : 2}/>
            <Microphone color={'#FF8C82'} size={5} />
        </div>
    )
}

export default PracticePronounce;