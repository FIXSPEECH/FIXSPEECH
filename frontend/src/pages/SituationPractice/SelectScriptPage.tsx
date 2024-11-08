import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScriptListGet } from "../../services/SituationPractice/SituationPracticeGet";
import  {DeleteIcon}  from "../../Icons/DeleteIcon";
import { ScriptDelte } from "../../services/SituationPractice/SituationPracticePost";

function SelectScript() {
  const [scripts, setScripts] = useState<any>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getScript = async() => {
      try{
        const response = await ScriptListGet();
        console.log(response)
        setScripts(response)
      } catch (e) {
        console.log(e)
      }
    }

    getScript();

  }, [])

  const handleClick =() =>{
    navigate('/situation/practice')
  }

  const handleDelete = (scriptId: number) => {
    const remove = async() => {
      try{
        const response = await ScriptDelte(scriptId)
        console.log(response)

        // 삭제 후 scripts 상태 업데이트 (삭제된 스크립트를 배열에서 제거)
        setScripts((prevScripts: any) =>
          prevScripts.filter((script: any) => script.scriptId !== scriptId)
        );

      } catch(e) {
        console.log(e)
      }
    }

    remove()
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
              <div className="flex items-center">
                <div className="text-[#FFAB01] text-sm mr-2">등록일: {script.cratedAt}</div>
                <DeleteIcon onClick={() => handleDelete(script.scriptId)}/>
              </div>
            </div>

          </div>
        ))}
      </div>
      {/* 선택 후에는 연습 페이지로 이동 */}
    </div>
  );
}

export default SelectScript;
