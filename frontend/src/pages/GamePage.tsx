import { useState, useEffect, useRef } from 'react';
import FallingLetter from '../components/Game/FallingLetter';
import { Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function Game() {
    const [letters, setLetters] = useState<{ id: number; letter: string; left: number }[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [isGameOver, setIsGameOver] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    const getRandomFruit = () => {
        const fruits = ['사과', '바나나', '딸기', '포도', '복숭아', '오렌지', '수박', '참외', '자두', '귤'];
        return fruits[Math.floor(Math.random() * fruits.length)];
    };

    const addLetter = () => {
        const newLetter = {
            id: Date.now(),
            letter: getRandomFruit(),
            left: Math.floor(Math.random() * (window.innerWidth - 100))
        };
        setLetters((prev) => [...prev, newLetter]);
    };

    const removeLetter = (id: number, isMissed: boolean = false) => {
        setLetters((prev) => prev.filter((letter) => letter.id !== id));
        if (isMissed) {
            setLives((prev) => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setIsGameOver(true);
                    setIsGameRunning(false);
                    stopRecording();
                }
                return newLives;
            });
        }
    };

    const initializeRecognition = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
            return null;
        }

        const recognition = new (window as any).webkitSpeechRecognition() as any;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ko-KR';

        recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.trim().toLowerCase();
                if (event.results[i].isFinal) {
                    console.log('최종 인식된 텍스트:', transcript);
                    setRecognizedText(transcript); // 음성 입력이 최종일 때만 처리
                }
            }
        };

        recognition.onerror = (event:any) => {
            console.error('음성 인식 오류:', event.error);
        };

        recognition.onend = () => {
            if (isRecording) {
                recognition.start();
            }
        };

        return recognition;
    };

    const startRecording = () => {
        if (!recognitionRef.current) {
            recognitionRef.current = initializeRecognition();
        }

        if (!isRecording && recognitionRef.current) {
            recognitionRef.current.start();
        }
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };

    // UseEffect to check letters on recognizedText change
    useEffect(() => {
        if (!recognizedText) return;

        letters.forEach((letter) => {
            const normalizedLetter = letter.letter.toLowerCase().normalize("NFC");
            if (normalizedLetter === recognizedText) {
                console.log('정답 매칭:', letter.letter);
                setScore((prevScore) => prevScore + 1);
                removeLetter(letter.id);
            } else {
                console.log('정답 불일치:', letter.letter);
            }
        });
    }, [recognizedText, letters]);

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

        const letterInterval = setInterval(addLetter, 1000);

        return () => clearInterval(letterInterval);
    }, [isGameRunning]);

    return (
        <div className="flex flex-col min-h-[70vh] justify-between" style={{ backgroundColor: '#2C2C2E' }}>
            <div className="flex flex-col min-h-[70vh]">
                <div className="flex flex-col justify-start p-4">
                    <div className="flex">
                        {Array.from({ length: lives }).map((_, index) => (
                            <FavoriteIcon key={index} style={{ color: 'red', margin: '0 5px' }} />
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
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={startGame}
                        >
                            <h1 className="text-8xl font-bold text-colorFE6250">START</h1>
                        </div>
                    )}
                    {isGameOver && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h1 className="text-8xl font-bold text-colorFE6250">GAME OVER</h1>
                        </div>
                    )}
                </div>
            </div>
            {isGameRunning && (
                <div className="flex justify-center p-4 min-h-[10vh]">
                    <h2 className="text-white">Recognized: {recognizedText}</h2>
                </div>
            )}
            {isGameOver && (
                <div className="flex justify-center gap-4 mt-4 text-white">
                    <Button variant="text" color="error" onClick={() => window.location.href = '/'}>
                        나가기
                    </Button>
                    <Button variant="text" color="error" onClick={startGame}>
                        다시 도전하기
                    </Button>
                </div>
            )}
        </div>
    );
}
