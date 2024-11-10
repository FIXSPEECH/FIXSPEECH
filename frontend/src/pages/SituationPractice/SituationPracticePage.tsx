import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Script from "../../components/SituationPractice/Script";
import Timer from "../../components/SituationPractice/Timer";
import Recorder from "../../components/Recorder";
import { ScriptGet } from "../../services/SituationPractice/SituationPracticeGet";

interface Data {
  title: string;
  content: string;
  accent: string;
  second: number;
  createdAt: string;
}


function SituationPractice() {
  const {scriptId} = useParams();
  const Id = Number(scriptId)
  const [data, setData] = useState<Data>();

  console.log('id 타입', typeof Id)
  
  useEffect(() => {
    const PracticeContent = async() => {
      try{
        const response = await ScriptGet(Id)
        console.log(response)

        if (response.status === 'C000') {
          setData(response.data);
        }

      } catch(e) {
        console.log(e)
      }
    }

    PracticeContent();
  }, [Id])

  return (
    <div className="flex min-h-[80vh] items-center">
    {/* <Script content={data.content} />
    <div className="flex-col  w-2/5 justify-center align-middle">
      <Timer seconds={data.seconds}/>
      <Recorder color={"#FFAB01"} barColor={"rgb(239,204,135)"} width={200} height={60} visualizeWidth="200px" modalType="regist"/>
    </div> */}
      {data ? (
      <>
        <Script content={data.content} />
        <div className="flex-col w-2/5 justify-center align-middle">
          <Timer seconds={data.second} />
          <Recorder color={"#FFAB01"} barColor={"rgb(239,204,135)"} width={200} height={60} visualizeWidth="200px" modalType="regist" />
        </div>
      </>
    ) : (
      <div>Loading...</div> // 데이터 로딩 중에 표시될 내용
    )}
  </div>
  );
}

export default SituationPractice;
