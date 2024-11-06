import { useEffect, useRef, useState } from "react";
import useVoiceStore from "../../store/voiceStore";
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import { ExampleGet } from "../../services/PronouncePractice/PronouncePracticeGet";
import ArrowRight from '../../Icons/ArrowRightIcon'

interface PronounceExampleProps {
    color: string; // color prop의 타입 정의
    trainingId: number;
    size: number;
  }


function PronounceExample({color, trainingId, size}:PronounceExampleProps){
    const {audioURL, isRecording} = useVoiceStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false); // 현재 재생 상태
    const [example, setExample] = useState<string>("")


    const handlePlayAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause(); // 재생 중일 경우 일시 정지
              setIsPlaying(false);
            } else {
              audioRef.current.play(); // 일시 정지 중일 경우 재생
              setIsPlaying(true);
            }
          }
      };

    

    // 연습 문제 가져오기
    const getExample = async () => {
        try {
            const response = await ExampleGet(trainingId);
            setExample(response.data)
            console.log('연습 데이터', example)
        } catch(e) {
            console.log(e)
        }
    }


    // 페이지 로딩 시 연습문제 가져오기
    useEffect(() => {
        getExample();
    },[])
     
    

    return (
    <>
        <div className="flex justify-center items-center w-screen">
         <div style={{ width: `${size}rem`, height: `${size}rem`}}>
            {!isRecording && audioURL && (
            <div>
            <audio ref={audioRef} src={audioURL} 
                onEnded={() => setIsPlaying(false)} // 오디오가 끝나면 상태를 다시 false로 설정
            /> 
            <VolumeDownIcon 
            onClick={handlePlayAudio} 
            style={{ cursor: 'pointer', color, fontSize: `${size}rem` }}
            className="mb-6" 
            />
            </div>
            )}
           </div>

            <div className="text-[#FF8C82] break-words sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center mr-20">
            {example}
            </div>
            </div>

            {/* ArrowRight 컴포넌트를 수직 중앙에 정렬하고 오른쪽에 붙이기 */}
            <div className="ml-auto mr-10 flex">
            <ArrowRight  onClick={getExample}/>
            </div>     
        </>
        
    )
}

export default PronounceExample;
