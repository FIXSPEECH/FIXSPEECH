import { useNavigate } from "react-router-dom";

function VoiceAnalysisListPage() {
  const analysisList = [
    {
      id: 1,
      date: "2024-01-15",
      title: "안녕하세요 발음 연습",
      score: 85,
      duration: "00:30",
    },
    {
      id: 2,
      date: "2024-01-14",
      title: "자기소개 연습",
      score: 92,
      duration: "01:15",
    },
    {
      id: 3,
      date: "2024-01-13",
      title: "일상 대화 연습",
      score: 78,
      duration: "02:00",
    },
  ];
  const navigate = useNavigate();

  return (
    <div className="voice-analysis-list" style={{ color: "#fff" }}>
      <h2 style={{ color: "#fff" }}>음성 분석 목록</h2>
      {analysisList.length > 0 ? (
        <div
          className="analysis-items"
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          {analysisList.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "15px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/analysis/${item.id}`)}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>{item.title}</h3>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>날짜: {item.date}</span>
                <span>점수: {item.score}점</span>
                <span>길이: {item.duration}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p
          style={{
            color: "#fff",
            textAlign: "center",
            padding: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          분석 기록이 없습니다.
        </p>
      )}
    </div>
  );
}

export default VoiceAnalysisListPage;
