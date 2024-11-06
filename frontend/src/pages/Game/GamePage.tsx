import { useState, useEffect, useRef } from "react";
import FallingLetter from "../../components/Game/FallingLetter";
import { Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { getGameList, getGameWords, postGameResult } from "../../services/Game/GameApi";
import { useNavigate } from "react-router-dom";

export default function Game() {
  const [letters, setLetters] = useState<{ id: number; letter: string; left: number }[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [beforeText, setBeforeText] = useState("");
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stageList, setStageList] = useState<number[]>([]);
  const [stage, setStage] = useState<number>(1);
  const [words, setWords] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null); // 게임 시작 시각을 저장
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const judgmentLineHeight = window.innerHeight * 0.58;

  // stageList 가져오기
  useEffect(() => {
    getGameList().then((res) => {
      const idList = res.data.map((item: any) => item?.id).filter((id) => id !== undefined);
      setStageList(idList);
    });
    handleStageSelection(stage);
  }, []);

  const handleStageSelection = (selectedStage: number) => {
    setStage(selectedStage);
    getGameWords(selectedStage).then((res) => {
      setWords(res.data);
    });
  };

  const addLetter = () => {
    const newLetter = {
      id: Date.now(),
      letter: words[Math.floor(Math.random() * words.length)],
      left: Math.floor(Math.random() * (window.innerWidth - 100)),
    };
    setLetters((prev) => [...prev, newLetter]);
  };

  const removeLetter = (id: number, isMissed: boolean = false) => {
    setLetters((prev) => prev.filter((letter) => letter.id !== id));
    if (isMissed && lives > 0) {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) endGame();
        return newLives;
      });
    }
  };

  const endGame = () => {
    setIsGameOver(true);
    setIsGameRunning(false);
    stopRecording();
    setLetters([]);

    // 게임 시간 (초 단위로 계산)
    const playtime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

    // API 호출
    postGameResult({ level: stage, playtime, correctNumber: score });
    // console.log({ level: stage, playtime, correctNumber: score });
  };

  const initializeRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return null;
    }
    const recognition = new (window as any).webkitSpeechRecognition() as any;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript.trim().toLowerCase();
        transcript = transcript.replace(/\s+/g, ""); // 공백 제거

        if (event.results[i].isFinal) {
          setRecognizedText(transcript);
          setBeforeText(transcript);
        } else {
          // interimResult를 일부 처리하고 싶다면 여기에 추가 가능
          console.log("Interim result:", transcript);
        }
      }
    };

    recognition.onend = () => {
      if (isRecording) recognition.start();
    };

    return recognition;
  };

  const startRecording = () => {
    if (!recognitionRef.current) recognitionRef.current = initializeRecognition();
    if (!isRecording && recognitionRef.current) recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  const handleMatchCheck = () => {
    if (!recognizedText) return;
    const matchingLetters = letters.filter((letter) => letter.letter.toLowerCase().normalize("NFC") === recognizedText);
    if (matchingLetters.length > 0) {
      const oldestLetter = matchingLetters.reduce((minLetter, currentLetter) =>
        currentLetter.id < minLetter.id ? currentLetter : minLetter
      );
      setScore((prevScore) => prevScore + 1);
      removeLetter(oldestLetter.id);
      setRecognizedText("");
    } else {
      console.log("매칭 실패: 정답 불일치");
      setRecognizedText("");
    }
  };

  useEffect(() => {
    handleMatchCheck();
  }, [recognizedText]);

  const startGame = () => {
    setScore(0);
    setLives(5);
    setLetters([]);
    setIsGameOver(false);
    setIsGameRunning(true);
    setStartTime(Date.now()); // 게임 시작 시각을 기록
    startRecording();
  };

  useEffect(() => {
    if (!isGameRunning) return;
    const letterInterval = setInterval(addLetter, 2500);
    return () => clearInterval(letterInterval);
  }, [isGameRunning]);

  return (
    <div className="flex flex-col min-h-[70vh] justify-between" style={{ backgroundColor: "#2C2C2E" }}>
      <div className="flex flex-col min-h-[70vh]">
        <div className="flex flex-col justify-start p-4">
          <div className="flex">
            {Array.from({ length: lives }).map((_, index) => (
              <FavoriteIcon key={index} style={{ color: "red", margin: "0 5px" }} />
            ))}
          </div>
          <div className="text-colorFE6250 font-bold mt-2">Score: {score}</div>
        </div>

        <div className="flex-1 relative w-full overflow-hidden">
          {/* 판정선을 시각적으로 표시 */}
          <div
            style={{
              position: "absolute",
              top: `${judgmentLineHeight}px`,
              width: "100%",
              height: "2px",
              backgroundColor: "#FF5733",
            }}
          />

          {letters.map((letter) => (
            <FallingLetter
              key={letter.id}
              letter={letter.letter}
              left={letter.left}
              onRemove={() => removeLetter(letter.id, true)}
            />
          ))}

          {!isGameRunning && !isGameOver && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ pointerEvents: "none" }}
            >
              <h1
                className="text-8xl font-bold text-colorFE6250 cursor-pointer mb-4"
                style={{ pointerEvents: "auto" }}
                onClick={startGame}
              >
                START
              </h1>

              <div className="flex gap-2 mt-4" style={{ pointerEvents: "auto" }}>
                {stageList.map((stageId) => (
                  <Button
                    key={stageId}
                    variant="contained"
                    style={{ backgroundColor: stage === stageId ? "#FE6250" : "#FFAB01", color: "white" }}
                    onClick={() => handleStageSelection(stageId)}
                    disabled={stage === stageId}
                  >
                    Stage {stageId}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h1 className="text-8xl font-bold text-colorFE6250 mb-4">GAME OVER</h1>

              <div className="flex gap-4 mt-4 text-white">
                <Button variant="text" onClick={() => (window.location.href = "/")}>
                  <p className="text-colorFE6250 font-bold">나가기</p>
                </Button>
                <Button variant="text" color="error" onClick={startGame}>
                  <p className="text-colorFE6250 font-bold">다시하기</p>
                </Button>
                <Button variant="text" color="error" onClick={()=>navigate("/game/ranking")}>
                  <p className="text-colorFE6250 font-bold">랭킹보기</p>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 음성 인식 결과와 발음된 텍스트 출력 */}
      {isGameRunning && (
        <div
          className="flex flex-col items-center justify-center min-h-[10vh]"
          style={{ backgroundColor: "transparent" }} // 투명도 있는 배경
        >
          <h2 className="text-white bg-opacity-0 p-2 rounded-md">{beforeText}</h2>
        </div>
      )}
    </div>
  );
}
