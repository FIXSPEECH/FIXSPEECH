import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { VoiceListGet } from "../../services/SituationPractice/SituationPracticeGet";
import { DeleteIcon } from "../../shared/components/Icons/DeleteIcon";
import { ScriptVoiceResultDelete } from "../../services/SituationPractice/SituationPracticePost";
import Swal from "sweetalert2";
import "./SwalStyles.css";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

function VoiceList() {
  const [scripts, setScripts] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지
  const [scriptsPerPage] = useState<number>(10); // 페이지당 스크립트 수
  const navigate = useNavigate();
  const { scriptId } = useParams();
  const Id = Number(scriptId);
  const location = useLocation();
  const { scriptTitle } = location.state || {};

  useEffect(() => {
    const VoiceList = async () => {
      try {
        const response = await VoiceListGet(0, 10, Id);
        console.log(response);
        setScripts(response);
      } catch (e) {
        console.log(e);
      }
    };

    VoiceList();
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
  const handleClick = (resultId: number) => {
    console.log("resultid", resultId);
    navigate(`/situation/voice/result/${resultId}`);
  };

  const handleDelete = (resultId: number) => {
    Swal.fire({
      title: "분석결과를 삭제하시겠습니까?",
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
          const response = await ScriptVoiceResultDelete(resultId);
          console.log(response);

          // 삭제 후 scripts 상태 업데이트 (삭제된 스크립트를 배열에서 제거)
          setScripts((prevScripts: any) => prevScripts.filter((script: any) => script.resultId !== resultId));
        } catch (e) {
          console.log(e);
        }
      } else if (result.isDenied) {
      }
    });
  };

  return (
    <div className="h-screen p-8 lg:max-w-5xl lg:mx-auto">
      <div className="text-[#FFAB01] text-3xl font-bold mb-8">{scriptTitle}</div>
      {scripts.length === 0 ? (
        <div className="text-[#FFAB01] text-2xl flex justify-center items-center h-[70vh]">저장된 음성녹음이 없습니다</div>
      ) : (
        <>
          <div className="space-y-3">
            {currentScripts.map((script: any) => (
              <div
                key={script.resultid}
                className="p-5 rounded-lg border border-[#FFAB01] hover:border-2 cursor-pointer transition-all"
                onClick={() => handleClick(script.resultId)}
              >
                <div className="flex justify-between items-center">
                  <div className="text-white text-xl">{script.score}점</div>
                  <div className="text-[#FFAB01] text-lg">분석결과 확인하기</div>
                  <div className="flex items-center">
                    <div className="text-[#FFAB01] text-sm mr-2">등록일: {script.createdAt}</div>

                    <DeleteIcon onClick={() => handleDelete(script.resultId)} strokeColor='#FFAB01'/>
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

export default VoiceList;
