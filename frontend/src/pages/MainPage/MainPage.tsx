import Buttons from "./components/Buttons";
import UserInfo from "./components/UserInfo";
import History from "./components/History";
import RecentVoice from "./components/RecentVoice";

function MainPage() {
  return (
    <>
      <main role="main" className="flex flex-col md:flex-row">
        <section aria-label="사용자 정보 및 기록" className="w-full md:w-1/2 p-3">
          <div
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50
            hover:border-cyan-500/50 rounded-lg h-full flex flex-col shadow-lg"
          >
            <UserInfo />
            <History />
          </div>
        </section>
        <section aria-label="최근 음성" className="w-full md:w-1/2 p-3">
          <div
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50
            hover:border-cyan-500/50 rounded-lg h-full flex flex-col shadow-lg"
          >
            <RecentVoice />
          </div>
        </section>
      </main>
      <Buttons />
    </>
  );
}

export default MainPage;
