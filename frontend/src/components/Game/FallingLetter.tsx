import { useEffect, useState } from 'react';

interface FallingLetterProps {
    letter: string;
    left: number;
    onRemove: () => void;
}

export default function FallingLetter({ letter, left, onRemove }: FallingLetterProps) {
    const [top, setTop] = useState(0);
    const gameHeight = window.innerHeight * 0.58;

    useEffect(() => {
        const fallInterval = setInterval(() => {
            setTop((prevTop) => {
                if (prevTop >= gameHeight) { 
                    // 바닥에 닿으면 한 번만 onRemove 호출
                    clearInterval(fallInterval); // 인터벌 해제
                    onRemove(); // 한 번만 호출
                    return prevTop;
                }
                return prevTop + 1.3;
            });
        }, 50);

        return () => clearInterval(fallInterval); // 컴포넌트가 사라질 때 인터벌 해제
    }, []); 

    return (
        <div
            className="absolute text-xl font-bold text-blue-600"
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
