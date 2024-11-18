import { useEffect, useState } from "react";
import "./Login.css";
import AudioVertexVisualizer from "../../shared/components/Visualizer/AudioVertexVisualizer";
import { motion } from "framer-motion";

function Login() {
  const [currentSection, setCurrentSection] = useState(0);
  const totalSections = 5; // 섹션 수 증가

  const handleLogin = () => {
    window.location.href =
      import.meta.env.VITE_API_URL + "/oauth2/authorization/kakao";
  };
  // // 테스트 로그인 처리
  // const handleTestLogin = (gender: "male" | "female") => {
  //   const testToken =
  //     gender === "male"
  //       ? import.meta.env.VITE_TEST_TOKEN_MALE
  //       : import.meta.env.VITE_TEST_TOKEN_FEMALE;
  //   setToken(testToken);
  //   navigate("/");
  // };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentSection < totalSections - 1) {
      setCurrentSection((prev) => prev + 1);
    } else if (e.deltaY < 0 && currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentSection]);

  return (
    <div className="h-[calc(100vh-5rem)] overflow-hidden">
      <div
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateY(-${currentSection * 100}vh)` }}
      >
        {/* 섹션 1: 메인 로고 및 비주얼라이저 */}
        <section className="h-screen flex flex-col items-center justify-center bg-transparent p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-[300px] h-[300px] mb-8"
          >
            <AudioVertexVisualizer size="large" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-6xl font-bold text-colorE6FFF7 mt-8 tracking-wider"
          >
            FIXSPEECH
          </motion.h1>
        </section>

        {/* 섹션 2: 실시간 분석 소개 */}
        <section className="h-screen flex items-center justify-center bg-transparent p-4">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSection === 1 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-colorE6FFF7">
              온라인 피드백을 제공하는 보이스 트레이너
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
              매일 목소리 점수를 확인하고
              <br />
              당신의 말하기 습관을 개선하세요
            </p>
            <div className="flex justify-center"></div>
          </motion.div>
        </section>

        {/* 섹션 3: 맞춤형 컨텐츠 소개 */}
        <section className="h-screen flex items-center justify-center bg-transparent p-4">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSection === 2 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-colorE6FFF7">
              맞춤형 학습 컨텐츠
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
              우리가 분석한 목소리 점수를 기반으로
              <br />
              개인별 학습 컨텐츠를 추천해드려요
            </p>
            <div className="flex justify-center gap-8"></div>
          </motion.div>
        </section>

        {/* 섹션 4: 게임과 훈련 소개 */}
        <section className="h-screen flex items-center justify-center bg-transparent p-4">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSection === 3 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-colorE6FFF7">
              즐겁게 배우는 목소리 트레이닝
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
              재미있는 게임으로 발음을 교정하고
              <br />
              아나운서의 음성을 따라하며 성장하세요
            </p>
            <div className="flex justify-center gap-8"></div>
          </motion.div>
        </section>

        {/* 섹션 5: 로그인 */}
        <section className="h-screen flex items-center justify-center bg-transparent p-4">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSection === 4 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-colorE6FFF7 mt-8 tracking-wider">
              FIXSPEECH
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-colorE6FFF7 mb-8">
              시작하기
            </h2>
            <button
              onClick={handleLogin}
              className="neon-kakao-button hover:scale-105 transition-transform text-xl"
              aria-label="카카오 계정으로 로그인"
            >
              카카오 로그인
            </button>
          </motion.div>
        </section>
      </div>

      {/* 네비게이션 도트 */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
        {/* <button
          onClick={() =>
            currentSection > 0 && setCurrentSection(currentSection - 1)
          }
          className={`mb-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentSection > 0
              ? "bg-[#4DFFB5] hover:bg-[#3DE0A0]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={currentSection === 0}
          aria-label="이전 섹션으로 이동"
        >
          ▲
        </button> */}

        <div className="space-y-4">
          {Array.from({ length: totalSections }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`w-3 h-3 rounded-full block transition-all duration-300 ${
                currentSection === index
                  ? "bg-color4DFFB5/80 scale-125"
                  : "bg-gray-400 hover:bg-color4DFFB5/80"
              }`}
              aria-label={`섹션 ${index + 1}로 이동`}
            />
          ))}
        </div>

        {/* <button
          onClick={() =>
            currentSection < totalSections - 1 &&
            setCurrentSection(currentSection + 1)
          }
          className={`mt-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentSection < totalSections - 1
              ? "bg-[#4DFFB5] hover:bg-[#3DE0A0]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={currentSection === totalSections - 1}
          aria-label="다음 섹션으로 이동"
        >
          ▼
        </button> */}
      </div>
    </div>
  );
}

export default Login;
