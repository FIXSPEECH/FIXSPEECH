function SituationPractice() {
  return (
    <div className="h-screen p-8">
      <div className="text-white text-3xl font-bold mb-6">상황별 연습</div>

      <div className="bg-[#2A2A2A] rounded-lg p-6 mb-8">
        <div className="text-white text-xl mb-4">대본 내용</div>
        <div className="text-gray-300">여기에 대본 내용이 표시됩니다...</div>
        <div className="text-gray-300">끝나면 분석 결과 나타내야합니다</div>
      </div>

      <div className="flex justify-center space-x-6">
        <button className="bg-[#FF8C82] text-white px-8 py-3 rounded-lg hover:bg-[#ff7a6e] transition-colors">
          녹음 시작
        </button>
        <button className="border border-[#B9E5E8] text-[#B9E5E8] px-8 py-3 rounded-lg hover:bg-[#B9E5E8] hover:text-black transition-colors">
          다시하기
        </button>
      </div>
    </div>
  );
}

export default SituationPractice;
