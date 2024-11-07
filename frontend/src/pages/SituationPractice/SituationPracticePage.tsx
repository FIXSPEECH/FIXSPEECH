import Script from "../../components/SituationPractice/Script";
import Timer from "../../components/SituationPractice/Timer";
import Recorder from "../../components/SituationPractice/Recorder";

function SituationPractice() {

  return (
    <div style={{ display: "flex" }}>
    <Script />
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Timer />
      <Recorder />
    </div>
  </div>
  );
}

export default SituationPractice;
