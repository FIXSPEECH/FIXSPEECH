import { SectionData } from "../types/lecture";
import { motion } from "framer-motion";
import { METRIC_DESCRIPTIONS } from "../constants/metricSearchTerms";

interface Props {
  section: SectionData;
  metricName: string;
  grade: string;
  value: number;
}

export function VideoSection({ section, metricName, grade, value }: Props) {
  const description = METRIC_DESCRIPTIONS[metricName] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-[#EE719E]">
            {section.title}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              grade === "poor"
                ? "bg-red-500/20 text-red-400"
                : grade === "good"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            점수: {value}
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.videos.map((video, index) => (
          <div
            key={index}
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50"
          >
            <iframe
              width="100%"
              height="215"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            />
            <div className="p-4">
              <h3 className="text-white font-medium">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
