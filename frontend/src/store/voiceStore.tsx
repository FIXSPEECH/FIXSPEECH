import {create} from 'zustand';
import { devtools } from 'zustand/middleware';

interface VoiceState {
    isRecording: boolean;
    audioURL : string | null;
    setIsRecording : (isRecording: boolean) => void
    setAudioURL : (audioURL: string | null) => void
}


const useVoiceStore = create<VoiceState>()(
    devtools((set) => ({
      isRecording: false,
      audioURL: null,
      setIsRecording: (isRecording) => set({ isRecording }),
      setAudioURL: (audioURL) => set({ audioURL }),
    }))
  );

export default useVoiceStore