import { YouTubeVideo } from "../types/lecture";
import { motion } from "framer-motion";

interface Props {
  video: YouTubeVideo;
}

export function RecentVideoCard({ video }: Props) {
  const handleClick = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/30 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50 cursor-pointer hover:border-[#EE719E]/50 transition-all"
      onClick={handleClick}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full aspect-video object-cover"
      />
      <div className="p-4">
        <h3 className="text-white font-medium line-clamp-2 mb-2">
          {video.title}
        </h3>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>{video.channelTitle}</span>
          <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
