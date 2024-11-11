import React, { useState } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
  disabled?: boolean;
}

const AudioRecorder = ({
  onRecordingComplete,
  disabled = false,
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  // WAV 헤더 작성 유틸리티 함수
  const writeUTFBytes = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // WAV 변환 함수
  const convertToWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    const numOfChannels = 1; // 모노
    const sampleRate = 16000; // 16kHz
    const bytesPerSample = 2;
    const length = audioBuffer.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);

    // WAV 헤더 작성
    writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeUTFBytes(view, 8, "WAVE");
    writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true); // PCM 포맷
    view.setUint16(20, 1, true); // 모노
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * bytesPerSample, true);
    view.setUint16(32, numOfChannels * bytesPerSample, true);
    view.setUint16(34, 16, true); // 16 bits per sample
    writeUTFBytes(view, 36, "data");
    view.setUint32(40, length, true);

    // 오디오 데이터 작성 (Float32 to Int16 변환)
    const channelData = audioBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16Sample, true);
      offset += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm", // 브라우저 호환성을 위해 webm 사용
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });

        // webm을 wav로 변환
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // 16kHz 모노로 리샘플링
        const offlineContext = new OfflineAudioContext(
          1,
          audioBuffer.duration * 16000,
          16000
        );
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();

        const resampled = await offlineContext.startRendering();

        // WAV 형식으로 변환
        const wavBlob = await convertToWav(resampled);
        const audioFile = new File([wavBlob], "recorded_audio.wav", {
          type: "audio/wav",
        });

        onRecordingComplete(audioFile);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw new Error("마이크 접근 권한이 필요합니다.");
    }
  };

  // 녹음 중지 함수
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className={`px-6 py-2 rounded-lg transition-colors ${
        disabled
          ? "bg-gray-600 cursor-not-allowed"
          : isRecording
          ? "bg-red-500 hover:bg-red-600"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {isRecording ? "녹음 중지" : "녹음 시작"}
    </button>
  );
};

export default AudioRecorder;
