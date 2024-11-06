'use client';

import { motion, useAnimation, Variants } from 'framer-motion';

const pathVariants: Variants = {
  normal: { d: 'M5 12h14' },
  animate: {
    d: ['M5 12h14', 'M5 12h9', 'M5 12h14'],
    transition: {
      duration: 0.4,
    },
  },
};

const secondaryPathVariants: Variants = {
  normal: { d: 'm12 5 7 7-7 7', translateX: 0 },
  animate: {
    d: 'm12 5 7 7-7 7',
    translateX: [0, -3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

interface ArrowRightIconProps {
  onClick?: () => void; // onClick prop 추가
}

const ArrowRightIcon = ({onClick}: ArrowRightIconProps) => {
  const controls = useAnimation();

  return (
    <div
      className="cursor-pointer select-none p-2 hover:bg-accent rounded-md transition-colors duration-200 flex items-center justify-center "
      onMouseEnter={() => controls.start('animate')}
      onMouseLeave={() => controls.start('normal')}
      onClick={onClick} // onClick을 div에 연결
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        // width="28"
        // height="28"
        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#FF8C82" 
      >
        <motion.path d="M5 12h14" variants={pathVariants} animate={controls} />
        <motion.path
          d="m12 5 7 7-7 7"
          variants={secondaryPathVariants}
          animate={controls}
        />
      </svg>
    </div>
  );
};

export  default  ArrowRightIcon ;
