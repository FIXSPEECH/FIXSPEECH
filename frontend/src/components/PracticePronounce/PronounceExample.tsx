import { useEffect, useRef, useState } from "react";
import useVoiceStore from "../../store/voiceStore";
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import { ExampleGet } from "../../services/PronouncePractice/PronouncePracticeGet";

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
    useEffect(() => {
        const getExample = async () => {
            try {
                const response = await ExampleGet(trainingId);
                setExample(response)
                console.log('연습 데이터', example)
            } catch(e) {
                console.log(e)
            }
        }


        getExample();
    })
     
    

    return (
        <div className="flex justify-center items-center ">
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

            <div className="text-white">{example}</div>

            <div className="text-[#FF8C82] text-4xl break-words"> 떡볶이 떡은 떡볶이용 떡이고 떡국 떡은 떡국용 떡이다 </div>
         
        </div>
    )
}

export default PronounceExample;
