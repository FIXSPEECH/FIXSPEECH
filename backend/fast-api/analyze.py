import librosa
import numpy as np
import matplotlib.pyplot as plt
import parselmouth
from parselmouth.praat import call

def load_audio(file):
    y, sr = librosa.load(file)
    return y, sr

def load_sound(file):
    return parselmouth.Sound(file)

def getFundamentalFrequency(y, sr):
    f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    times = librosa.times_like(f0, sr=sr)

    # Extract voiced F0 values
    voiced_f0 = f0[voiced_flag]
    voiced_times = times[voiced_flag]
    return voiced_times, voiced_f0, voiced_flag

def getFormants(sound):
    formant = call(sound, "To Formant (burg)", 0.025, 5, 5500, 0.025, 50)
    times = np.arange(0, sound.duration, 0.01)
    f1_values = [formant.get_value_at_time(1, t) for t in times]
    f2_values = [formant.get_value_at_time(2, t) for t in times]
    f3_values = [formant.get_value_at_time(3, t) for t in times]

    return times, f1_values, f2_values, f3_values

def getHNR(sound):
    hnr = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
    times = np.arange(0, sound.duration, 0.01)
    hnr_values = [hnr.get_value(t) for t in times]

    clean_hnr_values = [value for value in hnr_values if not np.isnan(value) and value > 0]
    mean_hnr = np.mean(clean_hnr_values) if clean_hnr_values else 0
    print(f"Filtered Average HNR: {mean_hnr:.2f} dB")

    return times, hnr_values, mean_hnr

def getSpectralSlope(y, sr, voiced_flag):
    # Calculate spectral centroids
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    times = librosa.times_like(spectral_centroids, sr=sr)

    # 유성구간만 사용
    valid_indices = voiced_flag[:min(len(times), len(voiced_flag))]
    voiced_times = times[valid_indices]
    voiced_spectral_centroids = spectral_centroids[valid_indices]

    # Calculate spectral slope for voiced segments only
    spectral_slope = np.gradient(voiced_spectral_centroids)

    return voiced_times, spectral_slope

def getAMR(y, sr):
    rms = librosa.feature.rms(y=y)[0]
    amr = librosa.feature.delta(rms)
    times = librosa.times_like(rms, sr=sr)

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
    valid_indices = voiced_flag[:mel_spectrogram_db.shape[1]]
    voiced_mel_spectrogram_db = mel_spectrogram_db[:, valid_indices]
    mfcc = librosa.feature.mfcc(S=voiced_mel_spectrogram_db, sr=sr, n_mfcc=13)
    times = librosa.times_like(mfcc[0], sr=sr)

    return times, mel_spectrogram_db, mfcc

def calculate_combined_rate_variability(times, voiced_flag, f0, spectral_slope):
    # Extract voiced and unvoiced segments times
    valid_indices = voiced_flag[:len(times)]
    voiced_times = times[valid_indices]
    unvoiced_times = times[~valid_indices]

    # Calculate the duration of voiced and unvoiced segments
    voiced_durations = np.diff(voiced_times)
    unvoiced_durations = np.diff(unvoiced_times)

    # Calculate variability for voiced segments (F0 changes)
    f0_changes = np.diff(f0)
    voiced_variability_f0 = np.std(f0_changes) if len(f0_changes) > 1 else 0

    # Calculate variability for spectral slope for voiced segments only
    spectral_slope_voiced = spectral_slope[:min(len(spectral_slope), len(f0_changes))]
    voiced_variability_slope = np.std(spectral_slope_voiced) if len(spectral_slope_voiced) > 1 else 0

    # Calculate variability for unvoiced segments (length consistency)
    unvoiced_variability = np.std(unvoiced_durations) if len(unvoiced_durations) > 1 else 0

    # Combine the variability metrics with adjusted weights
    rate_variability = (voiced_variability_f0 * 0.5 + voiced_variability_slope * 0.1 + unvoiced_variability * 0.4)

    return rate_variability

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
        '명료도(Clarity)': mean_hnr,
        '억양 패턴 일관성 (Intonation Pattern Consistency)': np.std(f0),
        '멜로디 지수(Melody Index)': np.mean(mfcc),
        '말의 리듬(Speech Rhythm)': np.mean(np.diff(times_f0[voiced_flag[:len(times_f0)]])),
        '휴지 타이밍(Pause Timing)': np.mean(np.diff(times_f0[~voiced_flag[:len(times_f0)]])),
        '속도 변동성(Rate Variability)': rate_variability,
        '성대 떨림(Jitter)': jitter,
        '강도 변동성(Shimmer)': shimmer,
        '강도 변동성(AMR)': np.std(amr),
        '발화의 에너지(Utterance Energy)': utterance_energy
    }

    return metrics

# Example usage
metrics = calculate_metrics('longsample.wav')
for key, value in metrics.items():
    print(f"{key}: {value}")
