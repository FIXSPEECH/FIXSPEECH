interface Metric {
  unit: string;
  grade: "excellent" | "good" | "poor";
  value: number;
  reference: string;
  interpretation: string;
}

interface Metrics extends Record<string, Metric> {
  "명료도(Clarity)": Metric;
  "강도 변동성(AMR)": Metric;
  "성대 떨림(Jitter)": Metric;
  "말의 리듬(Speech Rhythm)": Metric;
  "멜로디 지수(Melody Index)": Metric;
  "휴지 타이밍(Pause Timing)": Metric;
  "속도 변동성(Rate Variability)": Metric;
  "발화의 에너지(Utterance Energy)": Metric;
  "억양 패턴 일관성 (Intonation Pattern Consistency)": Metric;
}

export interface AnalysisItem {
  recordId: string;
  analyzeResult: {
    metrics: Metrics;
  };
  title: string;
  recordAddress: string;
  createdAt: string;
}

export interface AnalysisResponse {
  content: AnalysisItem[];
  totalPages: number;
  totalElements: number;
  number: number;
}
