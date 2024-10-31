import librosa
import numpy as np
import parselmouth
from parselmouth.praat import call
from fastapi import UploadFile, HTTPException
import tempfile
import os

async def analyze_audio(file: UploadFile):
    try:
        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        # 오디오 파일 로드 및 분석
        y, sr = librosa.load(temp_path)
        sound = parselmouth.Sound(temp_path)

        # 기본 분석 수행
        metrics = calculate_metrics(temp_path)

        # 임시 파일 삭제
        os.unlink(temp_path)

        return metrics

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to analyze audio: {str(e)}")

def calculate_metrics(file_path):
    try:
        y, sr = librosa.load(file_path)
        sound = parselmouth.Sound(file_path)

        # 기본 주파수 분석
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0 = call(pitch, "Get mean", 0, 0, "Hertz")
        
        # HNR 분석
        hnr = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
        mean_hnr = call(hnr, "Get mean", 0, 0)

        # Jitter와 Shimmer 분석
        point_process = call(sound, "To PointProcess (periodic, cc)", 75, 500)
        num_points = call(point_process, "Get number of points")
        
        if num_points >= 3:
            jitter = call(point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
            shimmer = call([sound, point_process], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 0.99)
        else:
            jitter = 0.0
            shimmer = 0.0

        # 스펙트럼 및 에너지 분석
        rms = librosa.feature.rms(y=y)[0]
        mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr)
        mfcc = librosa.feature.mfcc(S=librosa.power_to_db(mel_spectrogram), n_mfcc=13)

        metrics = {
            "clarity": float(mean_hnr),  # 명료도
            "intonation": float(np.std(call(pitch, "Get values in frame", 1, call(pitch, "Get number of frames")))),  # 억양
            "pace": float(np.mean(np.diff(librosa.times_like(rms)))),  # 속도
            "volume": float(np.mean(rms)),  # 음량
            "accuracy": float(jitter),  # 정확도 (성대 떨림)
            "emotion": float(np.mean(mfcc[1:])),  # 감정 표현
            "stress": float(shimmer),  # 강세
            "rhythm": float(np.std(rms)),  # 리듬
            "naturalness": float(np.mean(mfcc[0])),  # 자연스러움
            "pause_frequency": float(np.sum(rms < np.mean(rms) * 0.1) / len(rms)),  # 휴지 빈도
            "energy": float(np.mean(mel_spectrogram))  # 에너지
        }

        # NaN 값 처리
        for key in metrics:
            if np.isnan(metrics[key]):
                metrics[key] = 0.0

        # 1-10 스케일로 정규화
        for key in metrics:
            metrics[key] = min(10, max(1, float(metrics[key] * 5)))

        return metrics

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in audio analysis: {str(e)}")
