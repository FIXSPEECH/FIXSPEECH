import { useNavigate } from "react-router-dom";

function RegistScript() {
  const navigate = useNavigate();

  const handlePracticeClick = () => {
    navigate("/situation/practice");
  };

  return (
    <div className="h-screen p-8">
      <div className="text-white text-3xl font-bold mb-6">새로운 대본 등록</div>
      <div className="text-white text-lg mb-8">
        대본 등록 완료 후에는 연습 페이지로 이동
      </div>
      <button
        onClick={handlePracticeClick}
        className="bg-[#FF8C82] text-white px-6 py-3 rounded-lg hover:bg-[#ff7a6e] transition-colors"
      >
        연습 페이지로 이동
      </button>
      {/*  /situation/practice (SituationPractice.tsx) */}
    </div>
  );
}

export default RegistScript;
