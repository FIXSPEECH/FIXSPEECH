from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
import librosa
import numpy as np
import tempfile
import json
import os
import time
from fastapi import UploadFile, HTTPException
import analyze_wav_file


# 기존 함수들을 포함하고 새로운 함수 추가
def get_f0_data(y, sr):
    """
    F0 데이터 (시간별 주파수) 추출
    """
    f0, _, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    times = librosa.times_like(f0, sr=sr)
    return times, f0

async def analyze_announcer(file:UploadFile):
    """
    아나운서의 F0 데이터를 추출하여 반환
    """
    try:
        # 사용자 파일 읽기
        contents = await file.read()

        # WAV 변환
        wav_contents = analyze_wav_file.convert_to_wav(contents, file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(wav_contents)
            temp_file.flush()
            announcer_file_path = temp_file.name

        # 사용자 음성에서 F0 데이터 추출
        announcer_y, announcer_sr = librosa.load(announcer_file_path, sr=None)
        announcer_times, announcer_f0 = get_f0_data(announcer_y, announcer_sr)

        # JSON 형식으로 F0 데이터 정리
        announcer_f0_data = [{"time": t, "frequency": f if not np.isnan(f) else None} for t, f in zip(announcer_times, announcer_f0)]

        # 결과 반환
        return {
            "status": "success",
            "data": {
                "announcer_f0_data": announcer_f0_data,
            }
        }

    except Exception as e:
        # 에러 처리
        raise HTTPException(status_code=500, detail=str(e))


# async def announcer_mimic(file: UploadFile, announcer_f0_data: list):
async def announcer_mimic(file: UploadFile, announcer_f0_data: list):
    """
    사용자 음성을 분석하고 아나운서와의 F0 유사도, 메트릭 평가, 추천사항 등을 반환
    """
    start_time = time.time()
    try:
        # 사용자 파일 읽기
        contents = await file.read()

        # WAV 변환
        wav_contents = analyze_wav_file.convert_to_wav(contents, file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(wav_contents)
            temp_file.flush()
            user_file_path = temp_file.name

        # 사용자 음성에서 F0 데이터 추출
        user_y, user_sr = librosa.load(user_file_path, sr=None)
        user_times, user_f0 = get_f0_data(user_y, user_sr)

        # 아나운서의 F0 데이터 (JSON 데이터로부터)
        announcer_times = [data["time"] for data in announcer_f0_data]
        announcer_f0 = [data["frequency"] for data in announcer_f0_data]

        # F0 유사도 계산 (fastdtw 사용)
        user_f0_clean = np.array([val for val in user_f0 if not np.isnan(val)])
        announcer_f0_clean = np.array([val for val in announcer_f0 if val is not None])
        distance, path = fastdtw(user_f0_clean, announcer_f0_clean, dist=euclidean)

        # JSON 형식으로 F0 데이터 정리
        user_f0_data = [{"time": t, "frequency": f if not np.isnan(f) else None} for t, f in zip(user_times, user_f0)]

        # 메트릭 계산 및 평가 수행
        metrics = analyze_wav_file.calculate_metrics_simple(user_file_path)

        # 결과 반환
        return {
            "status": "success",
            "data": {
                "f0_similarity_distance": distance,
                "user_f0_data": user_f0_data,
                "metrics": metrics
            }
        }

    except Exception as e:
        # 에러 처리
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Error processing audio file",
                "detail": str(e),
                "code": "PROCESSING_ERROR"
            }
        )
    finally:
        # 임시 파일 삭제
        if os.path.exists(user_file_path):
            os.remove(user_file_path)
        await file.close()
