import { useEffect, useState } from "react";
import { ScriptListGet } from "../../services/SituationPractice/SituationPracticeGet";

function SelectScript() {
  const [script, setScirpts] = useState<any>([]);

  const scripts = [
    {
      id: 1,
      title: "면접 대본 1",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "발표 대본",
      date: "2024-01-14",
    },
    {
      id: 3,
      title: "회의 대본",
      date: "2024-01-13",
    },
  ];


  useEffect(() => {
    const getScript = async() => {
      try{
        const response = await ScriptListGet();
        console.log(response)
        // setScirpts(response)
      } catch (e) {
        console.log(e)
      }
    }

    getScript();

  }, [])

  

  return (
    <div className="h-screen p-8">
      <div className="text-white text-3xl font-bold mb-8">
        저장된 대본 목록 (예시페이지){" "}
      </div>
      <div className="space-y-3">
        {scripts.map((script) => (
          <div
            key={script.id}
            className="p-5 rounded-lg border border-[#B9E5E8] hover:border-2 cursor-pointer transition-all"
          >
            <div className="flex justify-between items-center">
              <div className="text-white text-xl">{script.title}</div>
              <div className="text-gray-400 text-sm">등록일: {script.date}</div>
            </div>
          </div>
        ))}
      </div>
      {/* 선택 후에는 연습 페이지로 이동 */}
    </div>
  );
}

export default SelectScript;
