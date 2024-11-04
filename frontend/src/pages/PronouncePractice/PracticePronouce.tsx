import Microphone from "../../components/Microphone";
import PronounceExample from "../../components/PracticePronounce/PronounceExample";

function PracticePronouce() {
    return (
        <>
            <PronounceExample/>
            <Microphone color={'#FF8C82'} size={5} />
        </>
    )
}

export default PracticePronouce;