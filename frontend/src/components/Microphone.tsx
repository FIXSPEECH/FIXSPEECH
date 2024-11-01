import  { useState, useRef, useEffect } from 'react';
import MicNoneIcon from '@mui/icons-material/MicNone';
import MicIcon from '@mui/icons-material/Mic';

interface MicrophoneProps {
    color: string; // color prop의 타입 정의
    size: number;
}

function AudioRecorder ({color, size}: MicrophoneProps){
  const [audioURL, setAudioURL] = useState<string | null>(null);  // 녹음후 오디오 파일 재생을 위한 URL
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioURL(null);
    }
  };

  return (
    <div>
      
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? <MicIcon style={{ color, fontSize: `${size}rem`}} className='cursor-pointer'/>  :  <MicNoneIcon style={{ color, fontSize: `${size}rem`}} className='cursor-pointer'/> }
      </button>
      {!isRecording && audioURL && (
        <div>
          <audio src={audioURL} controls />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
