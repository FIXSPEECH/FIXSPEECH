import { SectionData } from "../types/lecture";
import { motion } from "framer-motion";
import { METRIC_DESCRIPTIONS } from "../constants/metricSearchTerms";

interface Props {
  section: SectionData;
}

export function VideoSection({ section }: Props) {
  const description = METRIC_DESCRIPTIONS[section.metricName] || "";

  const handleVideoClick = (videoId: string) => {
    window.open(videoId, "_blank");
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
            className="cursor-pointer"
            onClick={() => handleVideoClick(video.videoId)}
          >
            <div className="aspect-video relative">
              <img
                src={video.videoThumbnail}
                alt={video.videoTitle}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/70 transition-all rounded-lg">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-medium line-clamp-2 drop-shadow-lg">
                    {video.videoTitle}
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
