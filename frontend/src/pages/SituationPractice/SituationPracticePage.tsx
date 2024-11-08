import { useEffect } from "react";
import Script from "../../components/SituationPractice/Script";
import Timer from "../../components/SituationPractice/Timer";
import Recorder from "../../components/Recorder";
import { ScriptGet } from "../../services/SituationPractice/SituationPracticeGet";

function SituationPractice() {

  // useEffect(() => {
  //   const PracticeContent = async() => {
  //     try{
  //       const response = await ScriptGet(scriptId)
  //       console.log(response)
  //     } catch(e) {
  //       console.log(e)
  //     }
  //   }

  //   PracticeContent();
  // }, [])

  return (
    <div className="flex min-h-[80vh] items-center">
    <Script />
    <div className="flex-col  w-2/5 justify-center align-middle">
      <Timer />
      <Recorder color={"#FFAB01"} barColor={"rgb(239,204,135)"} width={200} height={60} visualizeWidth="200px" modalType="regist"/>
    </div>
  </div>
  );
}

export default SituationPractice;
