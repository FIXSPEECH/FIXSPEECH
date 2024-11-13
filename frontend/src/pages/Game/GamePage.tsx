import { useState, useEffect, useRef } from "react";
import FallingLetter from "../../components/Game/FallingLetter";
import { Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { getGameList, getGameWords, postGameResult } from "../../services/Game/GameApi";
import { useNavigate } from "react-router-dom";

export default function Game() {
  const [letters, setLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [beforeText, setBeforeText] = useState("");
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stageList, setStageList] = useState([]);
  const [stage, setStage] = useState(1);
  const [words, setWords] = useState([]);
  const [startTime, setStartTime] = useState(null);

  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const judgmentLineHeight = window.innerHeight * 0.58;

  // 음성 인식 초기화 함수
  const initializeRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return null;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";

    recognition.onresult = handleRecognitionResult;
    recognition.onend = () => {
      if (isRecording) recognition.start();
    };

    return recognition;
  };

  // 음성 인식 결과 처리 함수
  const handleRecognitionResult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      let transcript = event.results[i][0].transcript.trim().toLowerCase().replace(/\s+/g, "");
      if (event.results[i].isFinal) {
        setRecognizedText(transcript);
        setBeforeText(transcript);
      } else {
        console.log("Interim result:", transcript);
      }
    }
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

  const startGame = () => {
    resetGame();
    setIsGameRunning(true);
    setStartTime(Date.now());
    startRecording();
  };

  const resetGame = () => {
    setScore(0);
    setLives(5);
    setLetters([]);
    setIsGameOver(false);
  };

  const endGame = () => {
    setIsGameOver(true);
    setIsGameRunning(false);
    stopRecording();
    setLetters([]);
    const playtime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    console.log({ level: stage, playtime, correctNumber: score });
    postGameResult({ level: stage, playtime, correctNumber: score });
  };

  const handleStageSelection = (selectedStage) => {
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

  const removeLetter = (id, isMissed = false) => {
    setLetters((prev) => prev.filter((letter) => letter.id !== id));
    if (isMissed) handleMissedLetter();
  };

  const handleMissedLetter = () => {
    if (lives > 0) {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) endGame();
        return newLives;
      });
    }
  };

  const handleMatchCheck = () => {
    if (!recognizedText) return;
    const matchingLetters = letters.filter(
      (letter) => letter.letter.toLowerCase().normalize("NFC") === recognizedText
    );
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

  // 게임 시작 시 stage 리스트 가져오기 및 기본 stage 설정
  useEffect(() => {
    getGameList().then((res) => {
      const idList = res.data.map((item) => item?.id).filter((id) => id !== undefined);
      setStageList(idList);
    });
    handleStageSelection(stage);
  }, []);

  // 음성 인식 결과가 업데이트될 때마다 매칭 체크
  useEffect(() => {
    handleMatchCheck();
  }, [recognizedText]);

  // 게임이 실행 중일 때 주기적으로 글자 추가
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
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
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
                    {stageId === 1 ? "Easy" : stageId === 2 ? "Normal" : "Hard"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h1 className="text-8xl font-bold text-colorFE6250 mb-4 text-center">GAME OVER</h1>
              <div className="flex gap-4 mt-4 text-white">
                <Button variant="text" onClick={() => navigate("/")}>
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
        <div className="flex flex-col items-center justify-center min-h-[10vh]" style={{ backgroundColor: "transparent" }}>
          <h2 className="text-white bg-opacity-0 p-2 rounded-md">{beforeText}</h2>
        </div>
      )}
    </div>
  );
}
