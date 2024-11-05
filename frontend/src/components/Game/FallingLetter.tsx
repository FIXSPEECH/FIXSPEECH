import { useEffect, useState } from 'react';

interface FallingLetterProps {
    letter: string;
    left: number;
    onRemove: () => void;
}

export default function FallingLetter({ letter, left, onRemove }:FallingLetterProps) {
    const [top, setTop] = useState(0);
    const gameHeight = window.innerHeight * 0.7; // 게임 영역의 높이를 80vh 기준으로 설정

    useEffect(() => {
        const fallInterval = setInterval(() => {
            setTop((prevTop) => {
                if (prevTop >= gameHeight) { // 바닥에 닿으면
                    onRemove(); // 부모에서 라이프 감소 처리
                    clearInterval(fallInterval);
                    return prevTop;
                }
                return prevTop; // 5px씩 아래로 이동
            });
        }, 50); // 50ms마다 위치 업데이트

        return () => clearInterval(fallInterval);
    }, [onRemove, gameHeight]);

    return (
        <div
            className="absolute text-xl text-blue-600"
            style={{
                top: `${top}px`,
                left: `${left}px`,
                color: '#EABBB6'
            }}
        >
            {letter}
        </div>
    );
};