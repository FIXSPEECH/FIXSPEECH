from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
import librosa
import numpy as np
import tempfile
import os
import json
from fastapi import UploadFile, HTTPException
import analyze_wav_file
import logging
import noisereduce as nr


# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("announcer_mimic")


def get_f0_data(y, sr):
    """
    F0 데이터 (시간별 주파수) 추출
    """
    f0, _, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    times = librosa.times_like(f0, sr=sr)
    return times, f0


def extract_f0_and_prepare_data(y, sr):
    """
    F0 데이터를 추출하여 NaN을 0으로 대체하고, frequency 값만 리스트로 반환
    """
    _, f0 = get_f0_data(y, sr)
    f0_cleaned = [f if not np.isnan(f) else 0 for f in f0]  # NaN 값은 0으로 대체
    return f0_cleaned


def load_and_denoise(file_path):
    """
    오디오 파일을 로드하고 노이즈 제거 처리
    """
    y, sr = librosa.load(file_path, sr=None)
    y_denoised = nr.reduce_noise(y=y, sr=sr)
    return y_denoised, sr


async def process_uploaded_audio(file: UploadFile):
    """
    업로드된 파일을 임시로 저장하여 경로 반환
    """
    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        temp_file.write(contents)
        temp_file.flush()
        return temp_file.name


async def analyze_announcer_alone(file: UploadFile):
    """
    아나운서 음성 단독 분석
    """
    file_path = await process_uploaded_audio(file)
    try:
        announcer_y, announcer_sr = load_and_denoise(file_path)
        announcer_f0_data = extract_f0_and_prepare_data(announcer_y, announcer_sr)

        return {
            "status": "success",
            "data": {
                "announcer_f0_data": announcer_f0_data,
            }
        }
    except Exception as e:
        logger.error(f"Error in analyze_announcer_alone: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


def normalize_f0(f0_data):
    """
    피치 데이터(f0_data)를 평균 0, 표준 편차 1로 정규화.
    """
    f0_data = np.array(f0_data)
    mean_f0 = np.mean(f0_data[f0_data > 0])  # 0이 아닌 값만 사용해 평균 계산
    std_f0 = np.std(f0_data[f0_data > 0])    # 0이 아닌 값만 사용해 표준 편차 계산
    normalized_f0 = (f0_data - mean_f0) / std_f0
    return normalized_f0

def calculate_similarity_percentage(distance, max_distance):
    """
    DTW 거리를 백분율 유사도로 변환 (0에서 max_distance 사이의 값을 기준으로 계산).
    """
    similarity = 1 - (distance / max_distance)
    return max(0, min(similarity * 100, 100))

async def announcer_mimic(user_file: UploadFile, announcer_file: UploadFile, downsample_factor=10):
    user_file_path = None
    announcer_file_path = None
    try:
        logger.info("Starting announcer_mimic function.")
        
        # 두 음성 파일을 로컬에 임시로 저장
        user_file_path = await process_uploaded_audio(user_file)
        announcer_file_path = await process_uploaded_audio(announcer_file)
        logger.info(f"Saved user file to {user_file_path}")
        logger.info(f"Saved announcer file to {announcer_file_path}")
        
        # 음성 파일에서 F0 데이터 추출
        user_y, user_sr = librosa.load(user_file_path, sr=None)
        announcer_y, announcer_sr = librosa.load(announcer_file_path, sr=None)
        logger.info("Loaded audio files successfully.")
        
        # F0 데이터 준비 (raw 데이터)
        user_f0_raw = np.array(extract_f0_and_prepare_data(user_y, user_sr))
        announcer_f0_raw = np.array(extract_f0_and_prepare_data(announcer_y, announcer_sr))
        
        # 유효한 주파수 값만 남기고 1차원 배열로 유지
        user_f0_clean = user_f0_raw[np.isfinite(user_f0_raw) & (user_f0_raw > 0)].ravel()
        announcer_f0_clean = announcer_f0_raw[np.isfinite(announcer_f0_raw) & (announcer_f0_raw > 0)].ravel()

        # 정규화하여 비교용으로 사용
        user_f0_norm = (user_f0_clean - np.mean(user_f0_clean)) / np.std(user_f0_clean)
        announcer_f0_norm = (announcer_f0_clean - np.mean(announcer_f0_clean)) / np.std(announcer_f0_clean)

        # 정규화된 데이터로 유사도 계산 (DTW를 이용한 거리 계산)
        try:
            distance, path = fastdtw(user_f0_norm, announcer_f0_norm, dist=2)
            similarity_percentage = 100 * (1 - min(distance / max(len(user_f0_norm), len(announcer_f0_norm)), 1))
            logger.info(f"Calculated DTW distance: {distance}, similarity: {similarity_percentage}%")
        except Exception as e:
            logger.error(f"Error in DTW calculation: {e}")
            raise HTTPException(status_code=500, detail="Error in DTW calculation")

        # response로 보낼 raw 데이터 다운샘플링 처리 (0 제외 후)
        user_f0_downsampled = user_f0_raw[user_f0_raw > 0][::downsample_factor]
        announcer_f0_downsampled = announcer_f0_raw[announcer_f0_raw > 0][::downsample_factor]

        return {
            "status": "success",
            "data": {
                "f0_similarity_distance": distance,
                "f0_similarity_percentage": similarity_percentage,
                "user_f0_data": user_f0_downsampled.tolist(),
                "announcer_f0_data": announcer_f0_downsampled.tolist(),
            }
        }
    except ValueError as e:
        logger.error(f"Data Error: {e}")
        raise HTTPException(status_code=400, detail=f"Data Error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 임시 파일 삭제
        if user_file_path and os.path.exists(user_file_path):
            os.remove(user_file_path)
            logger.info(f"Deleted user file at {user_file_path}")
        if announcer_file_path and os.path.exists(announcer_file_path):
            os.remove(announcer_file_path)
            logger.info(f"Deleted announcer file at {announcer_file_path}")
        await user_file.close()
        await announcer_file.close()
        logger.info("Closed file resources.")
