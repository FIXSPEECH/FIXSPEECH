import librosa
import numpy as np
import parselmouth
from parselmouth.praat import call
from fastapi import UploadFile, HTTPException
import tempfile
import os
import logging
import json
import time
from pydub import AudioSegment
import io


# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_audio(file):
    """
    오디오 파일을 로드하여 신호와 샘플링 레이트를 반환
    """
    y, sr = librosa.load(file)  # 원본 샘플링 속도 유지
    return y, sr

def load_sound(file):
    """
    Parselmouth Sound 객체 생성
    """
    return parselmouth.Sound(file)

def getFundamentalFrequency(y, sr):
    """
    기본 주파수(F0) 추출
    """
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    times = librosa.times_like(f0, sr=sr)

    # 유성음 F0 값 추출
    voiced_f0 = f0[voiced_flag]
    voiced_times = times[voiced_flag]
    return voiced_times, voiced_f0, voiced_flag

def getFormants(sound):
    """
    포먼트(F1, F2, F3) 추출
    """
    formant = call(sound, "To Formant (burg)", 0.025, 5, 5500, 0.025, 50)
    times = np.arange(0, sound.duration, 0.01)
    f1_values = [formant.get_value_at_time(1, t) for t in times]
    f2_values = [formant.get_value_at_time(2, t) for t in times]
    f3_values = [formant.get_value_at_time(3, t) for t in times]

    return times, f1_values, f2_values, f3_values

def getHNR(sound):
    """
    HNR(Harmonics-to-Noise Ratio) 계산
    """
    hnr = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
    times = np.arange(0, sound.duration, 0.01)
    hnr_values = [hnr.get_value(t) for t in times]

    # NaN과 음수 값 제거 후 평균 계산
    clean_hnr_values = [value for value in hnr_values if not np.isnan(value) and value > 0]
    mean_hnr = np.mean(clean_hnr_values) if clean_hnr_values else 0
    return times, hnr_values, mean_hnr

def getSpectralSlope(y, sr, voiced_flag):
    """
    스펙트럴 기울기 계산
    """
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    times = librosa.times_like(spectral_centroids, sr=sr)

    valid_indices = voiced_flag[:min(len(times), len(voiced_flag))]
    voiced_times = times[valid_indices]
    voiced_spectral_centroids = spectral_centroids[valid_indices]

    spectral_slope = np.gradient(voiced_spectral_centroids)

    return voiced_times, spectral_slope

def getAMR(y, sr):
    """
    진폭 변조율(Amplitude Modulation Rate) 계산
    """
    rms = librosa.feature.rms(y=y)[0]
    amr = librosa.feature.delta(rms)
    times = librosa.times_like(rms, sr=sr)

    return times, amr

def getJitter(sound):
    """
    지터(주파수 변동률) 계산
    """
    point_process = call(sound, "To PointProcess (periodic, cc)", 75, 600)

    try:
        text_grid = call(sound, "To TextGrid (silences)", 100, 0.1, -25, 0.1, 0.1, "silent", "voiced")
        num_intervals = call(text_grid, "Get number of intervals", 1)
    except Exception as e:
        logger.error(f"Error creating TextGrid or retrieving intervals: {e}")
        return float('nan')

    total_jitter = 0
    count = 0

    # 각 구간별 지터 계산
    for interval_index in range(num_intervals):
        start_time = call(text_grid, "Get start time of interval", 1, interval_index + 1)
        end_time = call(text_grid, "Get end time of interval", 1, interval_index + 1)
        label = call(text_grid, "Get label of interval", 1, interval_index + 1)

        if label == "voiced" and end_time - start_time >= 0.1:
            jitter = call(point_process, "Get jitter (local)", start_time, end_time, 0.0001, 0.04, 1.3)
            if jitter is not None and not (jitter != jitter):  # NaN 체크
                total_jitter += jitter
                count += 1

    avg_jitter = total_jitter / count if count > 0 else float('nan')
    return avg_jitter

def getMel(y, sr, voiced_flag):
    """
    멜 스펙트로그램과 MFCC 계산
    """
    mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)

    valid_indices = voiced_flag[:mel_spectrogram_db.shape[1]]
    voiced_mel_spectrogram_db = mel_spectrogram_db[:, valid_indices]
    mfcc = librosa.feature.mfcc(S=voiced_mel_spectrogram_db, sr=sr, n_mfcc=13)
    times = librosa.times_like(mfcc[0], sr=sr)

    return times, mel_spectrogram_db, mfcc

def calculate_combined_rate_variability(times, voiced_flag, f0, spectral_slope):
    """
    음성의 전체적인 변동성 계산
    """
    valid_indices = voiced_flag[:len(times)]
    voiced_times = times[valid_indices]
    unvoiced_times = times[~valid_indices]

    voiced_durations = np.diff(voiced_times)
    unvoiced_durations = np.diff(unvoiced_times)

    # F0 변화량 계산
    f0_changes = np.diff(f0)
    voiced_variability_f0 = np.std(f0_changes) if len(f0_changes) > 1 else 0

    # 스펙트럴 기울기 변화량 계산
    spectral_slope_voiced = spectral_slope[:min(len(spectral_slope), len(f0_changes))]
    voiced_variability_slope = np.std(spectral_slope_voiced) if len(spectral_slope_voiced) > 1 else 0

    # 무성음 구간 변동성 계산
    unvoiced_variability = np.std(unvoiced_durations) if len(unvoiced_durations) > 1 else 0

    # 가중치를 적용한 최종 변동성 계산
    rate_variability = (voiced_variability_f0 * 0.5 + voiced_variability_slope * 0.1 + unvoiced_variability * 0.4)
    return rate_variability

def evaluate_metric(name, value):
    """
    각 메트릭의 값을 평가하여 등급과 해석을 반환
    """
    criteria = {
        "명료도(Clarity)": {
            "ranges": [
                (20, float('inf'), "excellent"),
                (10, 20, "good"),
                (-float('inf'), 10, "poor")
            ],
            "unit": "dB",
            "reference": "20dB 이상이 최적",
            "interpretations": {
                "excellent": "매우 명료한 음성입니다",
                "good": "보통의 명료도를 보입니다",
                "poor": "명료도가 낮습니다"
            }
        },
        "억양 패턴 일관성 (Intonation Pattern Consistency)": {
            "ranges": [
                (40, 60, "excellent"),
                (30, 40, "good"),
                (60, 70, "good"),
                (-float('inf'), 30, "poor"),
                (70, float('inf'), "poor")
            ],
            "unit": "Hz",
            "reference": "40-60Hz가 최적",
            "interpretations": {
                "excellent": "자연스러운 억양 변화를 보입니다",
                "good": "대체로 자연스러운 억양입니다",
                "poor": "부자연스러운 억양 변화를 보입니다"
            }
        },
        "멜로디 지수(Melody Index)": {
            "ranges": [
                (-50, -30, "excellent"),
                (-60, -50, "good"),
                (-30, -20, "good"),
                (-float('inf'), -60, "poor"),
                (-20, float('inf'), "poor")
            ],
            "unit": "MFCC",
            "reference": "-50 ~ -30이 최적",
            "interpretations": {
                "excellent": "최적의 음성 멜로디를 보입니다",
                "good": "적절한 음성 멜로디를 보입니다",
                "poor": "음성 멜로디가 부자연스럽습니다"
            }
        },
        "말의 리듬(Speech Rhythm)": {
            "ranges": [
                (0.03, 0.06, "excellent"),
                (0.02, 0.03, "good"),
                (0.06, 0.07, "good"),
                (-float('inf'), 0.02, "poor"),
                (0.07, float('inf'), "poor")
            ],
            "unit": "초",
            "reference": "0.03-0.06초가 최적",
            "interpretations": {
                "excellent": "적절한 발화 리듬을 보입니다",
                "good": "대체로 자연스러운 리듬입니다",
                "poor": "발화 리듬이 부자연스럽습니다"
            }
        },
        "휴지 타이밍(Pause Timing)": {
            "ranges": [
                (0.1, 0.15, "excellent"),
                (0.08, 0.1, "good"),
                (0.15, 0.18, "good"),
                (-float('inf'), 0.08, "poor"),
                (0.18, float('inf'), "poor")
            ],
            "unit": "초",
            "reference": "0.1-0.15초가 최적",
            "interpretations": {
                "excellent": "자연스러운 휴지를 보입니다",
                "good": "대체로 적절한 휴지를 보입니다",
                "poor": "휴지가 부자연스럽습니다"
            }
        },
        "속도 변동성(Rate Variability)": {
            "ranges": [
                (80, 90, "excellent"),
                (70, 80, "good"),
                (90, 100, "good"),
                (-float('inf'), 70, "poor"),
                (100, float('inf'), "poor")
            ],
            "unit": "지수",
            "reference": "80-90이 최적",
            "interpretations": {
                "excellent": "적절한 속도 변화를 보입니다",
                "good": "대체로 안정적인 속도를 보입니다",
                "poor": "속도 변화가 불안정합니다"
            }
        },
        "성대 떨림(Jitter)": {
            "ranges": [
                (0.01, 0.03, "excellent"),
                (0.005, 0.01, "good"),
                (0.03, 0.04, "good"),
                (-float('inf'), 0.005, "poor"),
                (0.04, float('inf'), "poor")
            ],
            "unit": "비율",
            "reference": "0.01-0.03이 최적",
            "interpretations": {
                "excellent": "안정적인 성대 진동을 보입니다",
                "good": "대체로 안정적인 성대 진동입니다",
                "poor": "성대 진동이 불안정합니다"
            }
        },
        "강도 변동성(AMR)": {
            "ranges": [
                (0.003, 0.007, "excellent"),
                (0.002, 0.003, "good"),
                (0.007, 0.008, "good"),
                (-float('inf'), 0.002, "poor"),
                (0.008, float('inf'), "poor")
            ],
            "unit": "비율",
            "reference": "0.003-0.007이 최적",
            "interpretations": {
                "excellent": "적절한 강도 변화를 보입니다",
                "good": "대체로 안정적인 강도를 보입니다",
                "poor": "강도 변화가 불안정합니다"
            }
        },
        "발화의 에너지(Utterance Energy)": {
            "ranges": [
                (-25, -20, "excellent"),
                (-30, -25, "good"),
                (-20, -15, "good"),
                (-float('inf'), -30, "poor"),
                (-15, float('inf'), "poor")
            ],
            "unit": "dB",
            "reference": "-25 ~ -20dB이 최적",
            "interpretations": {
                "excellent": "적절한 발화 에너지를 보입니다",
                "good": "대체로 적절한 에너지를 보입니다",
                "poor": "발화 에너지가 부적절합니다"
            }
        }
    }

    if name not in criteria:
        return {
            "value": round(value, 2),
            "grade": "unknown",
            "unit": "N/A",
            "reference": "기준이 정의되지 않음",
            "interpretation": "평가 기준이 정의되지 않았습니다"
        }

    metric_criteria = criteria[name]
    grade = "unknown"
    
    for min_val, max_val, g in metric_criteria["ranges"]:
        if min_val <= value <= max_val:
            grade = g
            break

    return {
        "value": round(value, 2),
        "grade": grade,
        "unit": metric_criteria["unit"],
        "reference": metric_criteria["reference"],
        "interpretation": metric_criteria["interpretations"].get(grade, "평가할 수 없는 범위입니다")
    }

def calculate_overall_score(metrics):
    """
    전체 메트릭을 기반으로 종합 점수 계산
    """
    grade_scores = {
        "excellent": 100,
        "good": 80,
        "poor": 60,
        "unknown": 50
    }
    
    total_score = 0
    count = 0
    
    for metric in metrics.values():
        if metric["grade"] in grade_scores:
            total_score += grade_scores[metric["grade"]]
            count += 1
    
    return round(total_score / count if count > 0 else 0)

def generate_recommendations(metrics):
    """
    메트릭 평가를 기반으로 개선 추천사항 생성
    """
    recommendations = []
    
    for name, metric in metrics.items():
        if metric["grade"] == "poor":
            if "명료도" in name:
                recommendations.append("발음을 더 정확하게 하고 목소리를 선명하게 내보세요")
            elif "억양" in name:
                recommendations.append("자연스러운 억양으로 말해보세요")
            elif "멜로디" in name:
                recommendations.append("음성의 높낮이 변화를 자연스럽게 가져가보세요")
            elif "리듬" in name:
                recommendations.append("말의 속도를 더 자연스럽게 조절해보세요")
            elif "휴지" in name:
                recommendations.append("문장 사이의 쉼을 적절하게 가져가보세요")
            elif "속도" in name:
                recommendations.append("말하기 속도의 변화를 더 안정적으로 가져가보세요")
            elif "성대" in name:
                recommendations.append("성대 떨림을 안정적으로 유지해보세요")
            elif "강도" in name:
                recommendations.append("목소리의 크기 변화를 더 자연스럽게 가져가보세요")
            elif "에너지" in name:
                recommendations.append("발화 에너지를 적절한 수준으로 조절해보세요")
    
    return recommendations[:3]  # 상위 3개의 추천사항만 반환

def calculate_metrics(file):
    """
    음성 파일의 모든 메트릭 계산 및 평가
    """
    y, sr = load_audio(file)
    sound = load_sound(file)

    # 각종 음성 특징 추출
    times_f0, f0, voiced_flag = getFundamentalFrequency(y, sr)
    times_formant, f1_values, f2_values, f3_values = getFormants(sound)
    times_hnr, hnr_values, mean_hnr = getHNR(sound)
    times_spectral_slope, spectral_slope = getSpectralSlope(y, sr, voiced_flag)
    times_amr, amr = getAMR(y, sr)
    jitter = getJitter(sound)
    times_mel, mel_spectrogram_db, mfcc = getMel(y, sr, voiced_flag)

    # 변동성 및 에너지 계산
    rate_variability = calculate_combined_rate_variability(times_f0, voiced_flag, f0, spectral_slope)
    rms = librosa.feature.rms(y=y)[0]
    mean_rms = np.mean(rms)
    mean_mel_energy = np.mean(mel_spectrogram_db)
    utterance_energy = mean_rms * 0.6 + mean_mel_energy * 0.4

    # 최종 메트릭 딕셔너리 생성
    metrics = {
        '명료도(Clarity)': mean_hnr,
        '억양 패턴 일관성 (Intonation Pattern Consistency)': np.std(f0),
        '멜로디 지수(Melody Index)': np.mean(mfcc),
        '말의 리듬(Speech Rhythm)': np.mean(np.diff(times_f0[voiced_flag[:len(times_f0)]])),
        '휴지 타이밍(Pause Timing)': np.mean(np.diff(times_f0[~voiced_flag[:len(times_f0)]])),
        '속도 변동성(Rate Variability)': rate_variability,
        '성대 떨림(Jitter)': jitter,
        '강도 변동성(AMR)': np.std(amr),
        '발화의 에너지(Utterance Energy)': utterance_energy
    }

    # 각 메트릭에 대한 평가 수행
    evaluated_metrics = {}
    for name, value in metrics.items():
        evaluated_metrics[name] = evaluate_metric(name, value)

    # 전체 점수 계산
    overall_score = calculate_overall_score(evaluated_metrics)
    
    # 추천사항 생성
    recommendations = generate_recommendations(evaluated_metrics)

    return {
        "metrics": evaluated_metrics,
        "overall_score": overall_score,
        "recommendations": recommendations
    }

def convert_np_to_python(obj):
    """
    NumPy 타입을 Python 기본 타입으로 변환
    """
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, np.float32):
        return float(obj)
    if isinstance(obj, np.integer):
        return int(obj)
    return obj

def convert_to_wav(file_content: bytes, original_filename: str) -> bytes:
    """
    오디오 파일을 WAV 형식으로 변환
    """
    try:
        # 파일 확장자 확인
        file_ext = original_filename.lower().split('.')[-1]
        
        # 메모리에서 AudioSegment 객체 생성
        audio = AudioSegment.from_file(io.BytesIO(file_content), format=file_ext)
        
        # WAV 형식으로 변환
        wav_buffer = io.BytesIO()
        audio.export(wav_buffer, format='wav')
        return wav_buffer.getvalue()
        
    except Exception as e:
        logger.error(f"Error converting audio to WAV: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "Failed to convert audio to WAV format",
                "detail": str(e),
                "code": "CONVERSION_ERROR"
            }
        )

async def analyze_audio(file: UploadFile):
    """
    업로드된 오디오 파일 분석 처리
    """
    start_time = time.time()  # 시작 시간 기록
    
    try:
        contents = await file.read()
        
        # 오디오 파일을 WAV로 변환
        wav_contents = convert_to_wav(contents, file.filename)

        # 임시 파일 생성 및 처리
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(contents)
            temp_file.flush()
            temp_path = temp_file.name

        try:
            # 메트릭 계산 및 NumPy 타입 변환
            metrics = calculate_metrics(temp_path)
            metrics = json.loads(json.dumps(metrics, default=convert_np_to_python))
            
            # 처리 시간 계산
            processing_time = round(time.time() - start_time, 2)
            
            return {
                "status": "success",
                "data": {
                    "metrics": metrics,
                    "processing_time_seconds": processing_time
                }
            }
        finally:
            # 임시 파일 삭제
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        logger.error(f"Error in analyze_audio: {str(e)}", exc_info=True)
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
        await file.close()
