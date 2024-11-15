import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const getAIRecommendations = async (analysisData: any) => {
  try {
    const prompt = `
      다음 음성 분석 결과를 바탕으로 개선을 위한 3가지 구체적인 조언을 제공해주세요:
      ${JSON.stringify(analysisData)}
      
      각 조언은 다음 형식을 따라주세요:
      - 제목
      - 상세 설명
      - 구체적인 연습 방법 3가지
      - 관련 키워드 5개
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI 추천 생성 실패:", error);
    throw error;
  }
};
