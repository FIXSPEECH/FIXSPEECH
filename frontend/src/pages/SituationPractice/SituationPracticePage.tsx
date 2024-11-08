import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Script from "../../components/SituationPractice/Script";
import Timer from "../../components/SituationPractice/Timer";
import Recorder from "../../components/Recorder";
import { ScriptGet } from "../../services/SituationPractice/SituationPracticeGet";

function SituationPractice() {
  const {scriptId} = useParams();
  const Id = Number(scriptId)

  console.log('id 타입', typeof Id)
  
  useEffect(() => {
    const PracticeContent = async() => {
      try{
        const response = await ScriptGet(Id)
        console.log(response)
      } catch(e) {
        console.log(e)
      }
    }

    PracticeContent();
  }, [Id])

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
