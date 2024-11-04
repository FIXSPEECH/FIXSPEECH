import React, { useState, useEffect, useRef } from 'react';
import FallingLetter from '../../components/Game/FallingLetter';

const Game: React.FC = () => {
    const [letters, setLetters] = useState<{ id: number; letter: string; left: number }[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [isGameOver, setIsGameOver] = useState(false);
    const [inputValue, setInputValue] = useState(''); // 입력 값을 상태로 관리
    const inputRef = useRef<HTMLInputElement>(null);

    const getRandomFruit = () => {
        const fruits = ['사과', '바나나', '딸기', '포도', '복숭아', '오렌지', '수박', '참외', '자두', '귤'];
        return fruits[Math.floor(Math.random() * fruits.length)];
    };

    const addLetter = () => {
        const newLetter = {
            id: Date.now(),
            letter: getRandomFruit(),
            left: Math.floor(Math.random() * (window.innerWidth - 50))
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
                }
                return newLives;
            });
        }
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value;
        setInputValue(input); // 상태 업데이트

        const matchedLetter = letters.find((letter) => letter.letter === input);
        if (matchedLetter) {
            setScore(score + 1);
            removeLetter(matchedLetter.id);
            setInputValue(''); // 입력 상태를 초기화
        }
    };

    const restartGame = () => {
        setScore(0);
        setLives(5);
        setLetters([]);
        setIsGameOver(false);
        setInputValue(''); // 입력 상태 초기화
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    useEffect(() => {
        if (isGameOver) return;

        const letterInterval = setInterval(addLetter, 1000);
        if (inputRef.current) {
            inputRef.current.focus();
        }

        return () => clearInterval(letterInterval);
    }, [isGameOver]);

    return (
        <div style={{ textAlign: 'center', background: 'white' }}>
            <h1>산성비 게임</h1>
            <div style={{ fontSize: '20px', margin: '20px' }}>Score: {score}</div>
            <div style={{ fontSize: '20px', margin: '20px' }}>Lives: {lives}</div>
            <input
                ref={inputRef}
                type="text"
                value={inputValue} // 입력 상태를 표시
                onChange={handleInput}
                style={{ fontSize: '16px', padding: '5px', marginBottom: '20px' }}
                placeholder="여기에 과일 이름을 입력하세요"
                disabled={isGameOver}
            />
            <div style={{ position: 'relative', height: '400px', border: '1px solid black', overflow: 'hidden' }}>
                {letters.map((letter) => (
                    <FallingLetter
                        key={letter.id}
                        letter={letter.letter}
                        left={letter.left}
                        onRemove={() => removeLetter(letter.id, true)}
                    />
                ))}
            </div>
            {isGameOver && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Game Over</h2>
                    <button onClick={restartGame} style={{ fontSize: '16px', padding: '10px' }}>Restart Game</button>
                </div>
            )}
        </div>
    );
};

export default Game;
