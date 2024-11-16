import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScriptListGet } from "../../services/SituationPractice/SituationPracticeGet";
import { DeleteIcon } from "../../shared/components/Icons/DeleteIcon";
import { ScriptDelte } from "../../services/SituationPractice/SituationPracticePost";
import Swal from "sweetalert2";
import "./SwalStyles.css";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

function SelectResult() {
  const [scripts, setScripts] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지
  const [scriptsPerPage] = useState<number>(10); // 페이지당 스크립트 수
  const navigate = useNavigate();

  useEffect(() => {
    const getScript = async () => {
      try {
        const response = await ScriptListGet();
        console.log(response);
        setScripts(response);
      } catch (e) {
        console.log(e);
      }
    };

    getScript();
  }, []);

  // 현재 페이지에 해당하는 스크립트 목록 계산
  const indexOfLastScript = currentPage * scriptsPerPage;
  const indexOfFirstScript = indexOfLastScript - scriptsPerPage;
  const currentScripts = scripts.slice(indexOfFirstScript, indexOfLastScript);

  // 페이지 변경 시 호출되는 함수
  const paginate = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // VoiceList.tsx 컴포넌트로 이동
  const handleClick = (scriptId: number, scriptTitle: string) => {
    navigate(`/situation/voice/${scriptId}`, {state: {scriptTitle}});
  };

  const handleDelete = (scriptId: number) => {
    Swal.fire({
      title: "대본을 삭제하시겠습니까?",
      showDenyButton: true,
      confirmButtonText: "삭제",
      denyButtonText: `취소`,
      customClass: {
        confirmButton: "swal2-confirm-btn", // 삭제 버튼
        denyButton: "swal2-deny-btn", // 취소 버튼
      },
      buttonsStyling: false,
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        try {
          const response = await ScriptDelte(scriptId);
          console.log(response);

          // 삭제 후 scripts 상태 업데이트 (삭제된 스크립트를 배열에서 제거)
          setScripts((prevScripts: any) =>
            prevScripts.filter((script: any) => script.scriptId !== scriptId)
          );
        } catch (e) {
          console.log(e);
        }
      } else if (result.isDenied) {
      }
    });
  };

  return (
    <div className="h-screen p-8 lg:max-w-5xl lg:mx-auto">
      <div className="text-[#FFAB01] text-3xl font-bold mb-8">
        음성 녹음 목록
      </div>
      {scripts.length === 0 ? (
        <div className="text-[#FFAB01] text-2xl flex justify-center items-center h-[70vh]">저장된 대본이 없습니다</div>
      ) : (
        <>
          <div className="space-y-3">
            {currentScripts.map((script: any) => (
              <div
                key={script.id}
                className="p-5 rounded-lg border border-[#FFAB01] hover:border-2 cursor-pointer transition-all"
                onClick={() => handleClick(script.scriptId, script.title)}
              >
                <div className="flex justify-between items-center">
                  <div className="text-white text-xl">{script.title}</div>
                  <div className="flex items-center">
                    <div className="text-[#FFAB01] text-sm mr-2">
                      등록일: {script.createdAt}
                    </div>
                    <DeleteIcon onClick={() => handleDelete(script.scriptId)} strokeColor='#FFAB01'/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Stack
            spacing={2}
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "fit-content",
              margin: "0 auto",
              marginTop: "2%",
              paddingBottom: "5%"
            }}
          >
            <Pagination
              count={Math.ceil(scripts.length / scriptsPerPage)}
              page={currentPage}
              onChange={paginate}
              shape="rounded"
              size="large"
              sx={{
                "& .MuiPaginationItem-root": { color: "#FFAB01" },
                "& .MuiPaginationItem-ellipsis": { color: "#FFAB01" },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: "#FFAB01",
                  color: "white",
                },
              }}
            />
          </Stack>
        </>
      )}
    </div>
  );
}

export default SelectResult;
