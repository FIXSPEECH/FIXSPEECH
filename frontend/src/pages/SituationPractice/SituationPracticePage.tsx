import Script from "../../components/SituationPractice/Script";
import Timer from "../../components/SituationPractice/Timer";
import Recorder from "../../components/SituationPractice/Recorder";

function SituationPractice() {

  return (
    <div className="flex min-h-[80vh] items-center">
    <Script />
    <div className="flex-col  w-2/5 justify-center align-middle">
      <Timer />
      <Recorder />
    </div>
  </div>
  );
}

export default SituationPractice;
