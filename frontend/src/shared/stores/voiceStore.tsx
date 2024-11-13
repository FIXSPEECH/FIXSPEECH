import {create} from 'zustand';
import { devtools } from 'zustand/middleware';

interface VoiceState {
    isRecording: boolean;
    audioURL : string | null;
    audioBlob: Blob | null;
    setIsRecording : (isRecording: boolean) => void;
    setAudioURL : (audioURL: string | null) => void;
    setAudioBlob: (audioBlob: Blob | null) => void;
}


const useVoiceStore = create<VoiceState>()(
    devtools((set) => ({
      isRecording: false,
      audioURL: null,
      audioBlob: null,
      setIsRecording: (isRecording) => set({ isRecording }),
      setAudioURL: (audioURL) => set({ audioURL }),
      setAudioBlob: (audioBlob) => set({audioBlob})
    }))
  );

export default useVoiceStore