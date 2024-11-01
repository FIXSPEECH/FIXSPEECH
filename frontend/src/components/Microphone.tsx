// import { useState } from 'react';
// import MicNoneIcon from '@mui/icons-material/MicNone';
// import MicIcon from '@mui/icons-material/Mic';

// interface MicrophoneProps {
//     color: string; // color prop의 타입 정의
// }

// function Microphone({color}: MicrophoneProps){
//     const [isRecord, setIsRecord] = useState<boolean>(false)

//     const handleToggleRecord = () => {
//         setIsRecord(prev => !prev); // isRecord 값을 토글
//     };

//     return (
//         <div onClick={handleToggleRecord} style={{ cursor: 'pointer' }}> 
//         {isRecord ? (
//             <MicIcon style={{ color }} /> 
//         ) : (
//             <MicNoneIcon style={{ color }} /> 
//         )}
//     </div>
//     )
// }

// export default Microphone;


import { useState, useEffect } from 'react';
import MicNoneIcon from '@mui/icons-material/MicNone';
import MicIcon from '@mui/icons-material/Mic';

interface MicrophoneProps {
    color: string; // color prop의 타입 정의
}

function Microphone({ color }: MicrophoneProps) {
    const [isRecord, setIsRecord] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleToggleRecord = async () => {
        if (!isRecord) {
            try {
                // 녹음을 시작하는 경우
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);

                recorder.ondataavailable = (event) => {
                    setAudioChunks((prev) => [...prev, event.data]); // 데이터 조각을 저장
                };

                recorder.onstop = () => {
                    if (audioChunks.length > 0) {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const url = URL.createObjectURL(audioBlob);
                        setAudioUrl(url); // 생성된 오디오 URL을 상태에 저장
                    }
                    setAudioChunks([]); // 조각 초기화
                };

                recorder.start();
                setMediaRecorder(recorder);
            } catch (error) {
                console.error('Error accessing microphone:', error);
            }
        } else {
            // 녹음을 중지하는 경우
            mediaRecorder?.stop();
            mediaRecorder?.stream.getTracks().forEach(track => track.stop()); // 스트림 종료
        }

        setIsRecord(prev => !prev); // isRecord 값을 토글
    };

    useEffect(() => {
        return () => {
            // 컴포넌트가 언마운트될 때 스트림 종료
            mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        };
    }, [mediaRecorder]);

    return (
        <div onClick={handleToggleRecord} style={{ cursor: 'pointer' }}>
            {isRecord ? (
                <MicIcon style={{ color }} />
            ) : (
                <MicNoneIcon style={{ color }} />
            )}

            {audioUrl && <audio controls src={audioUrl}>녹음된 소리 듣기</audio>}
        </div>
    );
}

export default Microphone;
