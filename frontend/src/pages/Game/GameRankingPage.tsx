import { Avatar } from "@mui/material";
import { getGameRanking } from "../../services/Game/GameApi";
import { useEffect, useState, useCallback } from "react";

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
  const [rankingsCache, setRankingsCache] = useState<{
    [key: number]: Ranking[];
  }>({});

  const fetchRankingData = useCallback(
    async (difficultyLevel: number) => {
      if (rankingsCache[difficultyLevel]) {
        setRankTable(rankingsCache[difficultyLevel]);
      } else {
        const response = await getGameRanking(difficultyLevel);
        const newRankings = response.data.content;
        setRankTable(newRankings);
        setRankingsCache((prevCache) => ({
          ...prevCache,
          [difficultyLevel]: newRankings,
        }));
      }
    },
    [rankingsCache]
  );

  useEffect(() => {
    fetchRankingData(difficulty);
  }, [difficulty, fetchRankingData]);

  const handleDifficultyChange = (level: number) => {
    setDifficulty(level);
  };

  const DifficultyButton = ({
    level,
    label,
  }: {
    level: number;
    label: string;
  }) => (
    <button
      onClick={() => handleDifficultyChange(level)}
      className={`${
        difficulty === level ? "font-bold" : ""
      } text-[#FE6250] text-2xl`}
      aria-pressed={difficulty === level}
      aria-label={`${label} difficulty`}
    >
      {label}
    </button>
  );

  return (
    <main className="flex flex-col items-center min-h-[70vh]">
      <h1 className="text-5xl font-bold text-[#FFAB01] mb-4">RANK</h1>
      <div
        className="flex space-x-4 mb-8"
        role="tablist"
        aria-label="Difficulty levels"
      >
        <DifficultyButton level={1} label="Easy" />
        <DifficultyButton level={2} label="Normal" />
        <DifficultyButton level={3} label="Hard" />
      </div>

      {/* Header Row for Column Labels */}
      <div
        className="w-full max-w-4xl mx-auto grid grid-cols-4 gap-4 text-white font-bold border-b border-gray-500 pb-2"
        role="row"
      >
        <div className="text-center" role="columnheader">
          Rank
        </div>
        <div className="text-center" role="columnheader">
          Nickname
        </div>
        <div className="text-center" role="columnheader">
          Playtime
        </div>
        <div className="text-center" role="columnheader">
          Score
        </div>
      </div>

      {/* Ranking Rows */}
      <div
        className="w-full max-w-4xl mx-auto"
        role="table"
        aria-label="Game Rankings"
      >
        {rankTable.map((rank, index) => (
          <div
            key={`rank-${index}`}
            className="grid grid-cols-4 gap-4 items-center border border-gray-300 rounded-md p-4 mb-4 shadow-sm"
            role="row"
          >
            <div
              className="text-2xl font-bold text-white text-center"
              role="cell"
            >
              {index + 1}
            </div>
            <div className="flex items-center justify-center" role="cell">
              <Avatar src={rank.image} alt={`${rank.nickname}'s avatar`} />
              <span className="ml-2 font-bold text-lg text-white">
                {rank.nickname}
              </span>
            </div>
            <div className="text-center text-white" role="cell">
              {rank.playtime} seconds
            </div>
            <div className="text-center text-white" role="cell">
              {rank.correctNumber}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
