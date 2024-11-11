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

def extract_f0_and_prepare_data(y, sr):
    times, f0 = get_f0_data(y, sr)
    f0_data = [{"time": t, "frequency": f if not np.isnan(f) else 0} for t, f in zip(times, f0)]
    temp = str(f0_data).replace(" ","")
    return temp

async def process_uploaded_audio(file: UploadFile):
    contents = await file.read()
    wav_contents = analyze_wav_file.convert_to_wav(contents, file.filename)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        temp_file.write(wav_contents)
        temp_file.flush()
        return temp_file.name

async def analyze_announcer_alone(file_path: str):
    """
    아나운서 음성 분석 함수 - 파일 경로를 입력받아 처리
    """
    try:
        # 경로로 로드된 파일에서 음성 데이터를 처리
        announcer_y, announcer_sr = librosa.load(file_path, sr=None)
        announcer_f0_data = extract_f0_and_prepare_data(announcer_y, announcer_sr)

        return {
            "status": "success",
            "data": {
                "announcer_f0_data": announcer_f0_data,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

async def announcer_mimic(file: UploadFile, announcer_f0_data: list):
    start_time = time.time()
    try:
        user_file_path = await process_uploaded_audio(file)
        user_y, user_sr = librosa.load(user_file_path, sr=None)
        user_f0_data = extract_f0_and_prepare_data(user_y, user_sr)

        announcer_f0_clean = np.array([val for val in announcer_f0_data if val["frequency"] is not None])
        user_f0_clean = np.array([val["frequency"] for val in user_f0_data if val["frequency"] is not None])

        distance, path = fastdtw(user_f0_clean, announcer_f0_clean, dist=euclidean)
        metrics = analyze_wav_file.calculate_metrics_simple(user_file_path)

        return {
            "status": "success",
            "data": {
                "f0_similarity_distance": distance,
                "user_f0_data": user_f0_data,
                "metrics": metrics
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(user_file_path):
            os.remove(user_file_path)
        await file.close()
