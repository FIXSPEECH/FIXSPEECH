import { useState, useEffect, useRef } from "react";
import FallingLetter from "./components/FallingLetter";
import { Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { getGameList, getGameWords, postGameResult } from "../../services/Game/GameApi";
import { useNavigate } from "react-router-dom";
import "./Blink.css";

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
  const [startTime, setStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null); // New state for countdown
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const judgmentLineHeight = window.innerHeight * 0.58;

  // stageList 가져오기
  useEffect(() => {
    getGameList().then((res) => {
      const idList = res.data.map((item: any) => item?.id).filter((id: number) => id !== undefined);
      setStageList(idList);
    });
  }, []);

  const handleStageSelection = (selectedStage: number) => {
    setStage(selectedStage);
    getGameWords(selectedStage).then((res) => {
      setWords(res.data);
      setCountdown(3); // Start countdown
    });
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null); // Clear countdown
      startGame(); // Start game when countdown finishes
    }
  }, [countdown]);

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

    const playtime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

    postGameResult({ level: stage, playtime, correctNumber: score });
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
        transcript = transcript.replace(/\s+/g, "");

        if (event.results[i].isFinal) {
          setRecognizedText(transcript);
          setBeforeText(transcript);
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
    setStartTime(Date.now());
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
              {countdown === null ? (
                <h1
                  className="text-8xl font-bold text-colorFE6250 cursor-pointer mb-4 animate-blink"
                >
                  START
                </h1>
              ) : (
                <h1 className="text-8xl font-bold text-colorFE6250 cursor-pointer mb-4 animate-blink">{countdown}</h1>
              )}
              {countdown === null && (
                <div className="flex gap-2 mt-4" style={{ pointerEvents: "auto" }}>
                  {stageList.map((stageId) => (
                    <Button
                      key={stageId}
                      variant="contained"
                      style={{
                        backgroundColor: "#FFAB01",
                        color: "white",
                      }}
                      onClick={() => handleStageSelection(stageId)}
                    >
                      {stageId === 1 ? "Easy" : stageId === 2 ? "Normal" : "Hard"}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h1 className="text-8xl font-bold text-colorFE6250 mb-4 text-center ">GAME OVER</h1>
              <div className="flex gap-4 mt-4 text-white">
                <Button variant="text" onClick={() => (window.location.href = "/")}>
                  <p className="text-colorFE6250 font-bold">나가기</p>
                </Button>
                <Button variant="text" color="error" onClick={startGame}>
                  <p className="text-colorFE6250 font-bold">다시하기</p>
                </Button>
                <Button variant="text" color="error" onClick={() => navigate("/game/ranking")}>
                  <p className="text-colorFE6250 font-bold">랭킹보기</p>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isGameRunning && (
        <div
          className="flex flex-col items-center justify-center min-h-[10vh]"
          style={{ backgroundColor: "transparent" }}
        >
          <h2 className="text-white bg-opacity-0 p-2 rounded-md">{beforeText}</h2>
        </div>
      )}
    </div>
  );
}
