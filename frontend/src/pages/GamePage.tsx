import { useState, useEffect, useRef } from "react";
import FallingLetter from "../components/Game/FallingLetter";
import { Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { getGameList, getGameWords } from "../services/Game/GameApi";

export default function Game() {
  const [letters, setLetters] = useState<{ id: number; letter: string; left: number }[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stageList, setStageList] = useState<number[]>([]);
  const [stage, setStage] = useState<number>(1);
  const [words, setWords] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

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
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        if (event.results[i].isFinal) setRecognizedText(transcript);
      }
    };

    recognition.onerror = (event: any) => console.error("음성 인식 오류:", event.error);

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
          <div className="text-white mt-2">Score: {score}</div>
        </div>

        <div className="flex-1 relative w-full overflow-hidden">
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
                className="text-8xl font-bold text-colorFE6250 cursor-pointer mb-4" // mb-4로 간격 조정
                style={{ pointerEvents: "auto" }}
                onClick={startGame}
              >
                START
              </h1>

              {/* Stage Selection Buttons */}
              <div className="flex gap-2" style={{ pointerEvents: "auto" }}>
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
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-8xl font-bold text-colorFE6250">GAME OVER</h1>
            </div>
          )}
        </div>
      </div>
      {isGameOver && (
          <div className="flex justify-center gap-4 mt-4 text-white">
          <Button variant="text" color="error" onClick={() => (window.location.href = "/")}>
            나가기
          </Button>
          <Button variant="text" color="error" onClick={startGame}>
            다시 도전하기
          </Button>
        </div>
      )}
      {isGameRunning && (
        <div className="flex justify-center p-4 min-h-[10vh]">
          <h2 className="text-white">Recognized: {recognizedText}</h2>
        </div>
      )}
    </div>
  );
}
