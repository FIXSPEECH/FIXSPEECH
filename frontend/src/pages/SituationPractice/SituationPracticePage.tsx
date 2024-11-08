import Script from "../../components/SituationPractice/Script";
import Timer from "../../components/SituationPractice/Timer";
import Recorder from "../../components/Recorder";

function SituationPractice() {

  return (
    <div className="flex min-h-[80vh] items-center">
    <Script />
    <div className="flex-col  w-2/5 justify-center align-middle">
      <Timer />
      <Recorder color={"#FFAB01"} barColor={"rgb(239,204,135)"} width={200} height={60} visualizeWidth="200px"/>
    </div>
  </div>
  );
}

export default SituationPractice;
