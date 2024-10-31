import librosa
import numpy as np
import parselmouth
from parselmouth.praat import call
from fastapi import UploadFile, HTTPException
import tempfile
import os
import matplotlib.pyplot as plt
import librosa.display
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_audio(file):
    y, sr = librosa.load(file)
    return y, sr

def load_sound(file):
    return parselmouth.Sound(file)

def getFundamentalFrequency(y, sr):
    f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    times = librosa.times_like(f0, sr=sr)
    
    # # Plotting F0 with unvoiced segments highlighted
    # plt.figure(figsize=(10, 6))
    # plt.plot(times, f0, label='Original F0', color='blue', alpha=0.5)
    # plt.fill_between(times, 0, 200, where=np.isnan(f0), color='gray', alpha=0.3, label='Unvoiced Segments')
    # plt.xlabel('Time (s)')
    # plt.ylabel('Frequency (Hz)')
    # plt.title('Fundamental Frequency (F0)')
    # plt.legend(loc='upper right')
    # plt.grid(True)
    # plt.close()

    return times, f0, voiced_flag

def getFormants(sound):
    formant = call(sound, "To Formant (burg)", 0.025, 5, 5500, 0.025, 50)
    times = np.arange(0, sound.duration, 0.01)
    f1_values = [formant.get_value_at_time(1, t) for t in times]
    f2_values = [formant.get_value_at_time(2, t) for t in times]
    f3_values = [formant.get_value_at_time(3, t) for t in times]

    # # Plotting Formants with unvoiced segments highlighted
    # plt.figure(figsize=(10, 6))
    # plt.plot(times, f1_values, label='F1', color='red', alpha=0.7)
    # plt.plot(times, f2_values, label='F2', color='green', alpha=0.7)
    # plt.plot(times, f3_values, label='F3', color='blue', alpha=0.7)
    # plt.fill_between(times, 0, max(f3_values), where=np.isnan(f1_values), color='gray', alpha=0.3, label='Unvoiced Segments')
    # plt.xlabel('Time (s)')
    # plt.ylabel('Frequency (Hz)')
    # plt.title('Formant Frequencies Over Time')
    # plt.legend(loc='upper right')
    # plt.grid(True)
    # plt.close()

    return times, f1_values, f2_values, f3_values

def getHNR(sound):
    hnr = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
    times = np.arange(0, sound.duration, 0.01)
    hnr_values = [hnr.get_value(t) for t in times]

    clean_hnr_values = [value for value in hnr_values if not np.isnan(value) and value > 0]
    mean_hnr = np.mean(clean_hnr_values) if clean_hnr_values else 0

    # # Plotting HNR with unvoiced segments highlighted
    # plt.figure(figsize=(10, 6))
    # plt.plot(times, hnr_values, label='HNR', color='purple', alpha=0.7)
    # plt.fill_between(times, 0, max(clean_hnr_values), where=np.isnan(hnr_values), color='gray', alpha=0.3, label='Unvoiced Segments')
    # plt.xlabel('Time (s)')
    # plt.ylabel('HNR (dB)')
    # plt.title('Harmonics-to-Noise Ratio Over Time (Filtered)')
    # plt.ylim(0, max(clean_hnr_values) if clean_hnr_values else 0)
    # plt.grid(True)
    # plt.legend(loc='upper right')
    # plt.close()

    return times, hnr_values, mean_hnr

def getSpectralSlope(y, sr, voiced_flag):
    # Calculate spectral centroids
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    times = librosa.times_like(spectral_centroids, sr=sr)

    # 유성구간만 사용
    voiced_times = times[voiced_flag[:len(times)]]
    voiced_spectral_centroids = spectral_centroids[voiced_flag[:len(times)]]

    # Calculate spectral slope for voiced segments only
    spectral_slope = np.gradient(voiced_spectral_centroids)

    # # Plotting
    # plt.figure(figsize=(10, 6))
    # plt.plot(voiced_times, spectral_slope, label='Spectral Slope (Voiced Segments)', color='orange', alpha=0.7)
    # plt.xlabel('Time (s)')
    # plt.ylabel('Spectral Slope')
    # plt.title('Spectral Slope Over Time (Voiced Segments Only)')
    # plt.grid(True)
    # plt.legend(loc='upper right')
    # plt.close()

    return voiced_times, spectral_slope

def getAMR(y, sr):
    rms = librosa.feature.rms(y=y)[0]
    amr = librosa.feature.delta(rms)
    times = librosa.times_like(rms, sr=sr)

    # # Plotting
    # plt.figure(figsize=(10, 6))
    # plt.plot(times, amr, label='Amplitude Modulation Rate', color='cyan', alpha=0.7)
    # plt.xlabel('Time (s)')
    # plt.ylabel('AMR')
    # plt.title('Amplitude Modulation Rate Over Time')
    # plt.grid(True)
    # plt.legend(loc='upper right')
    # plt.close()

    return times, amr

def getJitterAndShimmer(sound):
    point_process = call(sound, "To PointProcess (periodic, cc)", 75, 500)
    jitter = call(point_process, "Get jitter (local)", 0, 0.02, 0.0001, 0.02, 1.3)
    shimmer = call([sound, point_process], "Get shimmer (local)", 0, 0.02, 0.0001, 0.02, 1.3, 0.99)

    print(f"Jitter: {jitter}")
    print(f"Shimmer: {shimmer}")

    return jitter, shimmer

def getMel(y, sr, voiced_flag):
    mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)

    # 유성구간만 고려하여 MFCC 계산
    voiced_mel_spectrogram_db = mel_spectrogram_db[:, voiced_flag[:mel_spectrogram_db.shape[1]]]
    mfcc = librosa.feature.mfcc(S=voiced_mel_spectrogram_db, sr=sr, n_mfcc=13)
    times = librosa.times_like(mfcc[0], sr=sr)

    # # Plotting Mel Spectrogram
    # plt.figure(figsize=(10, 6))
    # librosa.display.specshow(mel_spectrogram_db, sr=sr, x_axis='time', y_axis='mel', fmax=8000)
    # plt.colorbar(format='%+2.0f dB')
    # plt.title('Mel Spectrogram')
    # plt.xlabel('Time (s)')
    # plt.ylabel('Frequency (Hz)')
    # plt.close()

    # # Plotting MFCC
    # plt.figure(figsize=(10, 6))
    # librosa.display.specshow(mfcc, sr=sr, x_axis='time')
    # plt.colorbar()
    # plt.title('MFCC (Voiced Segments Only)')
    # plt.xlabel('Time (s)')
    # plt.ylabel('MFCC Coefficients')
    # plt.close()

    return times, mel_spectrogram_db, mfcc

def calculate_combined_rate_variability(times, voiced_flag, f0, spectral_slope):
    # Extract voiced and unvoiced segments times
    voiced_times = times[voiced_flag]
    unvoiced_times = times[~voiced_flag]

    # Calculate the duration of voiced and unvoiced segments
    voiced_durations = np.diff(voiced_times)
    unvoiced_durations = np.diff(unvoiced_times)

    # Calculate variability for voiced segments (F0 changes)
    f0_changes = np.diff(f0[voiced_flag])
    voiced_variability_f0 = np.std(f0_changes) if len(f0_changes) > 1 else 0

    # Calculate variability for spectral slope for voiced segments only
    spectral_slope_voiced = spectral_slope[voiced_flag[:len(spectral_slope)]]
    voiced_variability_slope = np.std(spectral_slope_voiced) if len(spectral_slope_voiced) > 1 else 0

    # Calculate variability for unvoiced segments (length consistency)
    unvoiced_variability = np.std(unvoiced_durations) if len(unvoiced_durations) > 1 else 0

    # Combine the variability metrics with adjusted weights
    rate_variability = (voiced_variability_f0 * 0.5 + voiced_variability_slope * 0.1 + unvoiced_variability * 0.4)

    print(f"Voiced F0 Variability: {voiced_variability_f0}")
    print(f"Voiced Spectral Slope Variability: {voiced_variability_slope}")
    print(f"Unvoiced Variability: {unvoiced_variability}")
    print(f"Rate Variability: {rate_variability}")

    return rate_variability

def clean_nan_values(value):
    if isinstance(value, (np.floating, float)):
        if np.isnan(value):
            return 0.0
        return float(value)
    return value

def calculate_metrics(file):
    y, sr = load_audio(file)
    sound = load_sound(file)

    times_f0, f0, voiced_flag = getFundamentalFrequency(y, sr)
    times_formant, f1_values, f2_values, f3_values = getFormants(sound)
    times_hnr, hnr_values, mean_hnr = getHNR(sound)
    times_spectral_slope, spectral_slope = getSpectralSlope(y, sr, voiced_flag)
    times_amr, amr = getAMR(y, sr)
    jitter, shimmer = getJitterAndShimmer(sound)
    times_mel, mel_spectrogram_db, mfcc = getMel(y, sr, voiced_flag)

    # Calculate combined rate variability
    rate_variability = calculate_combined_rate_variability(times_f0, voiced_flag, f0, spectral_slope)

    # Calculate utterance energy using RMS and Mel Spectrogram with adjusted weights
    rms = librosa.feature.rms(y=y)[0]
    mean_rms = np.mean(rms)
    mean_mel_energy = np.mean(mel_spectrogram_db)
    utterance_energy = mean_rms * 0.6 + mean_mel_energy * 0.4

    metrics = {
        '명료도(Clarity)': clean_nan_values(mean_hnr),
        '억양 패턴 일관성 (Intonation Pattern Consistency)': clean_nan_values(np.std(f0[~np.isnan(f0)])),
        '멜로디 지수(Melody Index)': clean_nan_values(np.mean(mfcc)),
        '말의 리듬(Speech Rhythm)': clean_nan_values(np.mean(np.diff(times_f0[voiced_flag]))),
        '휴지 타이밍(Pause Timing)': clean_nan_values(np.mean(np.diff(times_f0[~voiced_flag]))),
        '속도 변동성(Rate Variability)': clean_nan_values(rate_variability),
        '성대 떨림(Jitter)': clean_nan_values(jitter),
        '강도 변동성(Shimmer)': clean_nan_values(shimmer),
        '강도 변동성(AMR)': clean_nan_values(np.std(amr)),
        '발화의 에너지(Utterance Energy)': clean_nan_values(utterance_energy)
    }

    # 모든 값이 JSON 직렬화 가능한지 확인
    for key, value in metrics.items():
        if isinstance(value, (np.floating, float)) and np.isnan(value):
            metrics[key] = 0.0

    return metrics

async def analyze_audio(file: UploadFile):
    temp_file = None
    try:
        contents = await file.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(contents)
            temp_file.flush()
            temp_path = temp_file.name
        
        try:
            metrics = calculate_metrics(temp_path)
            
            # 최종 검사
            for key, value in metrics.items():
                if isinstance(value, (np.floating, float)) and np.isnan(value):
                    metrics[key] = 0.0
            
            return {
                "status": "success",
                "data": {
                    "metrics": metrics
                }
            }
        finally:
            if os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.error(f"Error deleting temporary file: {str(e)}")
                    
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
