import { useState } from "react";
import axiosInstance from "../services/axiosInstance";

interface AnalysisResult {
  status: string;
  data: {
    metrics: {
      "명료도(Clarity)": number;
      "억양 패턴 일관성 (Intonation Pattern Consistency)": number;
      "멜로디 지수(Melody Index)": number;
      "말의 리듬(Speech Rhythm)": number;
      "휴지 타이밍(Pause Timing)": number;
      "속도 변동성(Rate Variability)": number;
      "성대 떨림(Jitter)": number;
      "강도 변동성(Shimmer)": number;
      "강도 변동성(AMR)": number;
      "발화의 에너지(Utterance Energy)": number;
    };
  };
}

export default function TestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("파일을 선택해주세요");
      return;
    }

    if (!file.name.endsWith(".wav")) {
      setError("WAV 파일만 업로드 가능합니다");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post<AnalysisResult>(
        "/analyze/full",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          baseURL: "http://localhost:8000",
        }
      );
      setResult(response.data);
    } catch (err) {
      setError("분석 중 오류가 발생했습니다");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">음성 파일 분석 테스트</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">
            WAV 파일 선택:
            <input
              type="file"
              accept=".wav"
              onChange={handleFileChange}
              className="block w-full mt-1 border rounded-md p-2"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`px-4 py-2 rounded-md ${
            loading || !file ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {loading ? "분석 중..." : "분석 시작"}
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {result && (
        <div className="border rounded-md p-4">
          <h2 className="text-xl font-semibold mb-4">분석 결과</h2>
          <div className="space-y-2">
            {Object.entries(result.data.metrics).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span>{value.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
