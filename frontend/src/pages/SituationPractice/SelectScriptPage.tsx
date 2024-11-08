import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScriptListGet } from "../../services/SituationPractice/SituationPracticeGet";

function SelectScript() {
  const [scripts, setScirpts] = useState<any>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getScript = async() => {
      try{
        const response = await ScriptListGet();
        console.log(response)
        setScirpts(response)
      } catch (e) {
        console.log(e)
      }
    }

    getScript();

  }, [])

  const handleClick =() =>{
    navigate('/situation/practice')
  }
  

  return (
    <div className="h-screen p-8">
      <div className="text-[#FFAB01] text-3xl font-bold mb-8">
        저장된 대본 목록
      </div>
      <div className="space-y-3">
        {scripts.map((script: any) => (
          <div
            key={script.id}
            className="p-5 rounded-lg border border-[#FFAB01] hover:border-2 cursor-pointer transition-all"
            onClick={handleClick}
          >
            <div className="flex justify-between items-center">
              <div className="text-white text-xl">{script.title}</div>
              <div className="text-[#FFAB01] text-sm">등록일: {script.createdAt}</div>
            </div>
          </div>
        ))}
      </div>
      {/* 선택 후에는 연습 페이지로 이동 */}
    </div>
  );
}

export default SelectScript;
