// FallingLetter.tsx - 개별 떨어지는 글자 컴포넌트
import React, { useEffect } from "react";

interface FallingLetterProps {
  letter: string;
  top: number;
  left: number;
  onRemove: () => void;
}

const FallingLetter: React.FC<FallingLetterProps> = ({
  letter,
  top,
  left,
  onRemove,
}) => {
  useEffect(() => {
    const fallInterval = setInterval(() => {
      onRemove();
    }, 3000); // 3초 후 사라짐

    return () => clearInterval(fallInterval);
  }, [onRemove]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        fontSize: "24px",
        color: "blue",
      }}
    >
      {letter}
    </div>
  );
};

export default FallingLetter;
