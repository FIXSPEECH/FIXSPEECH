import { AIRecommendation } from "../types/lecture";

export function parseAIResponse(response: string): AIRecommendation[] {
  try {
    const sections = response.split("\n\n");

    return sections.map((section) => {
      const lines = section.split("\n");

      const title = extractTitle(lines);
      const content = extractContent(lines);
      const exercises = extractExercises(lines);
      const keywords = extractKeywords(lines);

      return { title, content, exercises, keywords };
    });
  } catch (error) {
    console.error("AI 응답 파싱 실패:", error);
    return [];
  }
}

function extractTitle(lines: string[]): string {
  const titleLine = lines.find((line) => line.includes("제목:")) || "";
  return titleLine.replace("제목:", "").trim();
}

function extractContent(lines: string[]): string {
  const descriptionLines = lines.filter(
    (line) =>
      line.includes("상세 설명:") ||
      (!line.includes("제목:") &&
        !line.includes("구체적인 연습 방법:") &&
        !line.includes("관련 키워드:"))
  );
  return descriptionLines.join(" ").replace("상세 설명:", "").trim();
}

function extractExercises(lines: string[]): string[] {
  const exerciseStartIndex = lines.findIndex((line) =>
    line.includes("구체적인 연습 방법:")
  );
  const exerciseEndIndex = lines.findIndex((line) =>
    line.includes("관련 키워드:")
  );

  return lines
    .slice(exerciseStartIndex + 1, exerciseEndIndex)
    .filter((line) => line.trim())
    .map((line) => line.replace(/^\s*\d+\)\s*/, "").trim());
}

function extractKeywords(lines: string[]): string[] {
  const keywordLine = lines.find((line) => line.includes("관련 키워드:")) || "";
  return keywordLine
    .replace("관련 키워드:", "")
    .split(",")
    .map((k) => k.trim());
}
