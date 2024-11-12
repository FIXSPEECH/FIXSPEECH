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

def evaluate_metric(value: float, gender: str, metric_name: str) -> dict:
    """
    각 메트릭의 값을 평가하여 등급과 해석을 반환
    """
    criteria = {
        "명료도(Clarity)": {
            "male": {
                "excellent": lambda x: x > 15,
                "good": lambda x: 13 <= x <= 15,
                "reference": "남성: 15dB 이상이 최적",
                "unit": "dB"
            },
            "female": {
                "excellent": lambda x: x > 16,
                "good": lambda x: 14 <= x <= 16,
                "reference": "여성: 16dB 이상이 최적",
                "unit": "dB"
            }
        },
        "억양 패턴 일관성 (Intonation Pattern Consistency)": {
            "male": {
                "excellent": lambda x: 15 <= x <= 30,
                "good": lambda x: 10 <= x < 15,
                "reference": "남성: 15~30Hz가 적정 범위",
                "unit": "Hz"
            },
            "female": {
                "excellent": lambda x: 20 <= x <= 35,
                "good": lambda x: 15 <= x < 20,
                "reference": "여성: 20~35Hz가 적정 범위",
                "unit": "Hz"
            }
        },
        "멜로디 지수(Melody Index)": {
            "male": {
                "excellent": lambda x: x > -40,
                "good": lambda x: -50 <= x <= -40,
                "reference": "남성: -40 이상이 최적",
                "unit": "MFCC"
            },
            "female": {
                "excellent": lambda x: x > -35,
                "good": lambda x: -45 <= x <= -35,
                "reference": "여성: -35 이상이 최적",
                "unit": "MFCC"
            }
        },
        "말의 리듬(Speech Rhythm)": {
            "male": {
                "excellent": lambda x: 0.06 <= x <= 0.1,
                "good": lambda x: 0.05 <= x < 0.06 or 0.1 < x <= 0.11,
                "reference": "남성: 0.06~0.1초가 적정 범위",
                "unit": "초"
            },
            "female": {
                "excellent": lambda x: 0.05 <= x <= 0.09,
                "good": lambda x: 0.04 <= x < 0.05 or 0.09 < x <= 0.1,
                "reference": "여성: 0.05~0.09초가 적정 범위",
                "unit": "초"
            }
        },
        "휴지 타이밍(Pause Timing)": {
            "male": {
                "excellent": lambda x: 0.09 <= x <= 0.13,
                "good": lambda x: 0.08 <= x < 0.09 or 0.13 < x <= 0.14,
                "reference": "남성: 0.09~0.13초가 적정 범위",
                "unit": "초"
            },
            "female": {
                "excellent": lambda x: 0.08 <= x <= 0.12,
                "good": lambda x: 0.07 <= x < 0.08 or 0.12 < x <= 0.13,
                "reference": "여성: 0.08~0.12초가 적정 범위",
                "unit": "초"
            }
        },
        "속도 변동성(Rate Variability)": {
            "male": {
                "excellent": lambda x: 60 <= x <= 75,
                "good": lambda x: 75 < x <= 85,
                "reference": "남성: 60~75Hz가 적정 범위",
                "unit": "Hz"
            },
            "female": {
                "excellent": lambda x: 65 <= x <= 80,
                "good": lambda x: 80 < x <= 90,
                "reference": "여성: 65~80Hz가 적정 범위",
                "unit": "Hz"
            }
        },
        "성대 떨림(Jitter)": {
            "male": {
                "excellent": lambda x: x <= 0.03,
                "good": lambda x: 0.03 < x <= 0.05,
                "reference": "남성: 0.03 이하가 최적",
                "unit": "비율"
            },
            "female": {
                "excellent": lambda x: x <= 0.02,
                "good": lambda x: 0.02 < x <= 0.04,
                "reference": "여성: 0.02 이하가 최적",
                "unit": "비율"
            }
        },
        "강도 변동성(AMR)": {
            "male": {
                "excellent": lambda x: 0.004 <= x <= 0.007,
                "good": lambda x: 0.003 <= x < 0.004 or 0.007 < x <= 0.008,
                "reference": "남성: 0.004~0.007이 적정 범위",
                "unit": "비율"
            },
            "female": {
                "excellent": lambda x: 0.003 <= x <= 0.006,
                "good": lambda x: 0.002 <= x < 0.003 or 0.006 < x <= 0.007,
                "reference": "여성: 0.003~0.006이 적정 범위",
                "unit": "비율"
            }
        },
        "발화의 에너지(Utterance Energy)": {
            "male": {
                "excellent": lambda x: x >= -24,
                "good": lambda x: -26 <= x < -24,
                "reference": "남성: -24dB 이상이 최적",
                "unit": "dB"
            },
            "female": {
                "excellent": lambda x: x >= -23,
                "good": lambda x: -25 <= x < -23,
                "reference": "여성: -23dB 이상이 최적",
                "unit": "dB"
            }
        }
    }

    metric_criteria = criteria.get(metric_name, {}).get(gender.lower(), {})
    if not metric_criteria:
        return {
            "value": value,
            "grade": "unknown",
            "unit": "unknown",
            "reference": "기준 없음",
            "interpretation": "평가 불가"
        }

    # 등급 평가
    if metric_criteria["excellent"](value):
        grade = "excellent"
        interpretation = "매우 우수한 수준입니다"
    elif metric_criteria["good"](value):
        grade = "good"
        interpretation = "양호한 수준입니다"
    else:
        grade = "poor"
        interpretation = "개선이 필요한 수준입니다"

    return {
        "value": value,
        "grade": grade,
        "unit": metric_criteria["unit"],
        "reference": metric_criteria["reference"],
        "interpretation": interpretation
    }

def calculate_overall_score(metrics):
    """
    전체 메트릭을 기반으로 종합 점수 계산
    """
    grade_scores = {
        "excellent": 100,
        "good": 75,
        "poor": 35,
        "unknown": 0
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

def calculate_metrics(file_path, gender=None):
    """
    음성 파일의 모든 메트릭 계산
    gender가 제공되면 성별 기준에 따라 평가도 함께 수행
    """
    y, sr = load_audio(file_path)
    sound = load_sound(file_path)

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

    # gender가 제공된 경우 평가 수행
    if gender:
        evaluated_metrics = {}
        for name, value in metrics.items():
            evaluated_metrics[name] = evaluate_metric(value, gender, name)
        return evaluated_metrics
    
    # gender가 없는 경우 단순 메트릭 값만 반환
    return metrics

def calculate_metrics_simple(file):
    """
    음성 파일의 메트릭 값만 계산
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

    # 단순 메트릭 값만 반환
    return {
        "명료도(Clarity)": round(float(mean_hnr), 2),
        "억양 패턴 일관성 (Intonation Pattern Consistency)": round(float(np.std(f0)), 2),
        "멜로디 지수(Melody Index)": round(float(np.mean(mfcc)), 2),
        "말의 리듬(Speech Rhythm)": round(float(np.mean(np.diff(times_f0[voiced_flag[:len(times_f0)]]))), 3),
        "휴지 타이밍(Pause Timing)": round(float(np.mean(np.diff(times_f0[~voiced_flag[:len(times_f0)]]))), 3),
        "속도 변동성(Rate Variability)": round(float(rate_variability), 2),
        "성대 떨림(Jitter)": round(float(jitter), 3),
        "강도 변동성(AMR)": round(float(np.std(amr)), 3),
        "발화의 에너지(Utterance Energy)": round(float(utterance_energy), 2)
    }

def convert_np_to_python(obj):
    """
    NumPy 타입을 Python 기본 타입으로 변환하고 무한값/NaN 처리
    """
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (np.float32, np.float64, float)):
        if np.isnan(obj) or np.isinf(obj):
            return 0.0  # 또는 다른 기본값
        return float(obj)
    if isinstance(obj, np.integer):
        return int(obj)
    return obj


async def analyze_audio(file: UploadFile, gender: str):
    """
    업로드된 오디오 파일 분석 처리
    """
    start_time = time.time()  # 시작 시간 기록
    
    try:
        contents = await file.read()

        # 임시 파일 생성 및 처리
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(contents)
            temp_file.flush()
            temp_path = temp_file.name

        try:
            # gender를 포함하여 메트릭 계산 및 평가
            evaluated_metrics = calculate_metrics(temp_path, gender)
            
            # NumPy 타입을 Python 기본 타입으로 변환
            evaluated_metrics = json.loads(json.dumps(evaluated_metrics, default=convert_np_to_python))
            
            # 전체 점수 계산
            overall_score = calculate_overall_score(evaluated_metrics)
            
            # 추천사항 생성
            recommendations = generate_recommendations(evaluated_metrics)
            
            # 처리 시간 계산
            processing_time = round(time.time() - start_time, 2)
            
            return {
                "status": "success",
                "data": {
                    "metrics": evaluated_metrics,
                    "overall_score": overall_score,
                    "recommendations": recommendations,
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
