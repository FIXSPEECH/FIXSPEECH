export const METRIC_UNITS = {
  "명료도(Clarity)": "dB",
  "강도 변동성(AMR)": "비율",
  "성대 떨림(Jitter)": "비율",
  "말의 리듬(Speech Rhythm)": "초",
  "멜로디 지수(Melody Index)": "MFCC",
  "휴지 타이밍(Pause Timing)": "초",
  "속도 변동성(Rate Variability)": "Hz",
  "발화의 에너지(Utterance Energy)": "dB",
  "억양 패턴 일관성 (Intonation Pattern Consistency)": "Hz",
};

export const METRIC_REFERENCES = {
  "명료도(Clarity)": "남성: 15dB 이상이 최적",
  "강도 변동성(AMR)": "남성: 0.004~0.007이 적정 범위",
  "성대 떨림(Jitter)": "남성: 0.03 이하가 최적",
  "말의 리듬(Speech Rhythm)": "남성: 0.06~0.1초가 적정 범위",
  "멜로디 지수(Melody Index)": "남성: -40 이상이 최적",
  "휴지 타이밍(Pause Timing)": "남성: 0.09~0.13초가 적정 범위",
  "속도 변동성(Rate Variability)": "남성: 60~75Hz가 적정 범위",
  "발화의 에너지(Utterance Energy)": "남성: -24dB 이상이 최적",
  "억양 패턴 일관성 (Intonation Pattern Consistency)":
    "남성: 15~30Hz가 적정 범위",
};
