import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VoiceAnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<Record<string, any> | null>(
    null
  );

  useEffect(() => {
    // 음성 분석 상세 데이터를 가져오는 로직 구현 예정
    console.log("분석 ID:", id);
    setAnalysisData({}); // 임시 데이터 설정
  }, [id]);

  return (
    <div
      style={{
        color: "white",
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{ marginBottom: "2rem" }}>음성 분석 상세</h2>
      {analysisData ? (
        <div style={{ width: "80%", maxWidth: "800px" }}>
          {/* 분석 데이터 표시 영역 */}
        </div>
      ) : (
        <p style={{ marginTop: "2rem" }}>로딩 중...</p>
      )}
      <button
        onClick={() => navigate("/analysis")}
        style={{
          marginTop: "2rem",
          padding: "10px 20px",
          backgroundColor: "#B9E5E8",
          color: "#000",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        내 목소리 기록 보기
      </button>
    </div>
  );
}

export default VoiceAnalysisDetailPage;
