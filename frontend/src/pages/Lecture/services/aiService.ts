import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const AI_CACHE_KEY = "ai_recommendation_cache";
const AI_CACHE_DURATION = 48 * 60 * 60 * 1000; // 48시간

const getAICache = (analysisId: string) => {
  const cached = localStorage.getItem(AI_CACHE_KEY);
  if (!cached) return null;

  const parsedCache = JSON.parse(cached);
  if (Date.now() - parsedCache.timestamp > AI_CACHE_DURATION) {
    localStorage.removeItem(AI_CACHE_KEY);
    return null;
  }

  return parsedCache.data[analysisId] || null;
};

const setAICache = (analysisId: string, recommendations: any) => {
  const existingCache = JSON.parse(
    localStorage.getItem(AI_CACHE_KEY) || '{"data":{}, "timestamp": 0}'
  );
  existingCache.data[analysisId] = recommendations;
  existingCache.timestamp = Date.now();
  localStorage.setItem(AI_CACHE_KEY, JSON.stringify(existingCache));
};

export const getAIRecommendations = async (analysisData: any) => {
  const analysisId = analysisData.id || JSON.stringify(analysisData); // 분석 결과의 고유 식별자
  const cachedRecommendations = getAICache(analysisId);

  if (cachedRecommendations) {
    return cachedRecommendations;
  }

  try {
    const prompt = `
분석된 음성 데이터를 바탕으로 3가지 구체적인 조언을 제공해주세요.
특히 "poor" 등급의 메트릭에 초점을 맞춰주세요.

분석 데이터:
${JSON.stringify(analysisData, null, 2)}

다음의 정확한 형식으로 3개의 조언을 작성해주세요:

제목: [조언 제목]
상세 설명: [구체적인 설명]
구체적인 연습 방법:
1) [첫 번째 방법]
2) [두 번째 방법]
3) [세 번째 방법]
관련 키워드: [키워드1], [키워드2], [키워드3], [키워드4], [키워드5]

---

각 조언은 위 형식을 정확히 따라야 하며, "---"로 구분됩니다.
응답은 한글로 작성해주세요.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const recommendations = response.choices[0].message.content;
    setAICache(analysisId, recommendations);
    return recommendations;
  } catch (error) {
    console.error("AI 추천 생성 실패:", error);
    throw error;
  }
};
