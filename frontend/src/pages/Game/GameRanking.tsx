import { Avatar } from "@mui/material";
import { getGameRanking } from "../../services/Game/GameApi";
import { useEffect, useState } from "react";

interface Ranking {
  nickname: string;
  image: string;
  level: number;
  gameDescription: string;
  playtime: number;
  correctNumber: number;
  created_at: string;
}

export default function GameRanking() {
  const [rankTable, setRankTable] = useState<Ranking[]>([]);
  const [difficulty, setDifficulty] = useState(1); // 1: Easy, 2: Medium, 3: Hard

  useEffect(() => {
    getGameRanking(difficulty).then((res) => {
      setRankTable(res.data.content); // Assuming data is already sorted in descending order
    });
  }, [difficulty]);

  const handleDifficultyChange = (level: number) => {
    setDifficulty(level);
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh]">
      <div className="flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-[#FFAB01] mb-4">랭킹</div>
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => handleDifficultyChange(1)}
            className={`${difficulty === 1 ? "font-bold" : ""} text-[#FE6250] text-2xl`}
          >
            Easy
          </button>
          <button
            onClick={() => handleDifficultyChange(2)}
            className={`${difficulty === 2 ? "font-bold" : ""} text-[#FE6250] text-2xl`}
          >
            Normal
          </button>
          <button
            onClick={() => handleDifficultyChange(3)}
            className={`${difficulty === 3 ? "font-bold" : ""} text-[#FE6250] text-2xl`}
          >
            Hard
          </button>
        </div>
      </div>

      {/* Header Row for Column Labels */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-4 gap-4 text-white font-bold border-b border-gray-500 pb-2">
        <div className="text-center">Rank</div>
        <div className="text-center">Nickname</div>
        <div className="text-center">Playtime</div>
        <div className="text-center">Score</div>
      </div>

      {/* Ranking Rows */}
      <div className="w-full max-w-4xl mx-auto">
        {rankTable.map((rank, index) => (
          <div
            key={index}
            className="grid grid-cols-4 gap-4 items-center border border-gray-300 rounded-md p-4 mb-4 shadow-sm"
          >
            <div className="text-2xl font-bold text-white text-center">
              {index + 1}
            </div>
            <div className="flex items-center justify-center">
              <Avatar src={rank.image} alt={rank.nickname} />
              <span className="ml-2 font-bold text-lg text-white">
                {rank.nickname}
              </span>
            </div>
            <div className="text-center text-white">{rank.playtime} seconds</div>
            <div className="text-center text-white">{rank.correctNumber}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
