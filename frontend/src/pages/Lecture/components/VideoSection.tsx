import { SectionData } from "../types/lecture";
import { motion } from "framer-motion";
import { METRIC_DESCRIPTIONS } from "../constants/metricSearchTerms";

interface Props {
  section: SectionData;
}

export function VideoSection({ section }: Props) {
  const description = METRIC_DESCRIPTIONS[section.metricName] || "";

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

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
          {section.grade === "poor" && (
            <span className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400">
              개선 필요
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.videos.map((video, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50 cursor-pointer hover:border-[#EE719E]/50 transition-all"
            onClick={() => handleVideoClick(video.videoId)}
          >
            <div className="aspect-video relative">
              <img
                src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-all">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-medium line-clamp-2 text-shadow">
                    {video.title}
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
