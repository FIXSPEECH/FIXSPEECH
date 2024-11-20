from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
import librosa
import numpy as np
import tempfile
import os
import requests
from fastapi import UploadFile, HTTPException
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


def download_audio_from_url(url: str):
    """
    URL에서 오디오 파일을 다운로드하여 임시 파일로 저장
    """
    response = requests.get(url)
    response.raise_for_status()  # 다운로드 오류 처리
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        temp_file.write(response.content)
        temp_file.flush()
        return temp_file.name


def normalize_f0(f0_data):
    """
    피치 데이터(f0_data)를 평균 0, 표준 편차 1로 정규화.
    """
    f0_data = np.array(f0_data)
    mean_f0 = np.mean(f0_data[f0_data > 0])  # 0이 아닌 값만 사용해 평균 계산
    std_f0 = np.std(f0_data[f0_data > 0])    # 0이 아닌 값만 사용해 표준 편차 계산
    normalized_f0 = (f0_data - mean_f0) / std_f0
    return normalized_f0


def downsample_to_match_length(data, target_length):
    """
    주어진 데이터를 목표 길이에 맞춰 균등한 간격으로 다운샘플링하고, 소수점 2자리까지만 반환합니다.
    """
    indices = np.linspace(0, len(data) - 1, target_length, dtype=int)
    return [round(data[i], 2) for i in indices]


async def announcer_mimic(user_file: UploadFile, announcer_url: str):
    user_file_path = None
    announcer_file_path = None
    try:
        logger.info("Starting announcer_mimic function.")
        
        # 사용자 음성 파일을 로컬에 임시로 저장
        user_file_path = await process_uploaded_audio(user_file)
        logger.info(f"Saved user file to {user_file_path}")
        
        # URL에서 아나운서 음성 파일 다운로드 및 로컬 저장
        announcer_file_path = download_audio_from_url(announcer_url)
        logger.info(f"Downloaded announcer file from URL and saved to {announcer_file_path}")
        
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
        user_f0_norm = normalize_f0(user_f0_clean)
        announcer_f0_norm = normalize_f0(announcer_f0_clean)

        # 정규화된 데이터로 유사도 계산 (DTW를 이용한 거리 계산)
        try:
            distance, path = fastdtw(user_f0_norm, announcer_f0_norm, dist=2)
            similarity_percentage = round(100 * (1 - min(distance / max(len(user_f0_norm), len(announcer_f0_norm)), 1)), 2)
            logger.info(f"Calculated DTW distance: {distance}, similarity: {similarity_percentage}%")
        except Exception as e:
            logger.error(f"Error in DTW calculation: {e}")
            raise HTTPException(status_code=500, detail="Error in DTW calculation")

        # 다운샘플링하여 비교용 데이터 준비 (0 제외 후)
        min_length = min(len(user_f0_clean), len(announcer_f0_clean))
        user_f0_downsampled = downsample_to_match_length(user_f0_clean, min_length)
        announcer_f0_downsampled = downsample_to_match_length(announcer_f0_clean, min_length)

        return {
            "status": "success",
            "data": {
                "f0_similarity_distance": round(distance, 2),
                "f0_similarity_percentage": similarity_percentage,
                "user_f0_data": str(user_f0_downsampled),
                "announcer_f0_data": str(announcer_f0_downsampled),
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
        logger.info("Closed file resources.")
