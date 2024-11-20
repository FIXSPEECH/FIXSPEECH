import { motion } from "framer-motion";
import { AIRecommendation } from "../types/lecture";

interface Props {
  recommendation: AIRecommendation;
}

export function AIRecommendationCard({ recommendation }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
      role="article"
      aria-label={`${recommendation.title}에 대한 AI 추천`}
    >
      <h3 className="text-xl font-semibold text-[#EE719E] mb-4">
        {recommendation.title}
      </h3>

      <div className="space-y-4">
        <div className="text-gray-300 leading-relaxed">
          {recommendation.content}
        </div>

        <div>
          <h4 className="text-lg font-medium text-white mb-2">연습 방법:</h4>
          <ul
            className="list-disc list-inside space-y-2 text-gray-300"
            aria-label="추천된 연습 방법 목록"
          >
            {recommendation.exercises.map((exercise, index) => (
              <li key={`exercise-${index}`} className="leading-relaxed">
                {exercise}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="flex flex-wrap gap-2 mt-4"
          role="list"
          aria-label="키워드 목록"
        >
          {recommendation.keywords.map((keyword, index) => (
            <span
              key={`keyword-${index}`}
              className="px-3 py-1 bg-[#EE719E]/20 text-[#EE719E] rounded-full text-sm"
              role="listitem"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
