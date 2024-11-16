import { AIRecommendation } from "../types/lecture";

export function parseAIResponse(response: string): AIRecommendation[] {
  try {
    const sections = response.split("---").filter((section) => section.trim());

    return sections.map((section): AIRecommendation => {
      const lines = section.trim().split("\n");

      return {
        title: extractValue(lines, "제목:"),
        content: extractValue(lines, "상세 설명:"),
        exercises: extractExercises(lines),
        keywords: extractKeywords(lines),
      };
    });
  } catch (error) {
    console.error("AI 응답 파싱 실패:", error);
    return [];
  }
}

function extractValue(lines: string[], prefix: string): string {
  const line = lines.find((line) => line.trim().startsWith(prefix));
  return line ? line.replace(prefix, "").trim() : "";
}

function extractExercises(lines: string[]): string[] {
  const startIndex = lines.findIndex(
    (line) => line.trim() === "구체적인 연습 방법:"
  );

  if (startIndex === -1) return [];

  const exercises: string[] = [];
  let i = startIndex + 1;

  while (i < lines.length && !lines[i].trim().startsWith("관련 키워드:")) {
    const line = lines[i].trim();
    if (line && /^\d+\)/.test(line)) {
      exercises.push(line.replace(/^\d+\)\s*/, "").trim());
    }
    i++;
  }

  return exercises;
}

function extractKeywords(lines: string[]): string[] {
  const keywordLine = lines.find((line) =>
    line.trim().startsWith("관련 키워드:")
  );
  if (!keywordLine) return [];

  return keywordLine
    .replace("관련 키워드:", "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
}
