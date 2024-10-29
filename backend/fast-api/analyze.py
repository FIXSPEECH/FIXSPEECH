import librosa
import numpy as np
import matplotlib.pyplot as plt
import parselmouth
from parselmouth.praat import call


def getFundementalFrequency(file):
    # 오디오 파일 로드
    y, sr = librosa.load(file)

    # F0 (기본 주파수) 계산, flag 는 유성구간, 무성구간 구분, probs 는 유성구간일 확률
    # probs > 0.5 인 구간이 flag = True
    f0, voiced_flag, voiced_probs = librosa.pyin(y,
                                                 fmin=librosa.note_to_hz('C2'),
                                                 fmax=librosa.note_to_hz('C7'))

    # 시간 축 계산
    times = librosa.times_like(f0, sr=sr)

    # 남성 목소리 범위 필터링 (85 Hz ~ 180 Hz)
    # 남성 범위에 해당하지 않는 부분은 NaN으로 설정
    male_f0 = np.where((f0 >= 85) & (f0 <= 180), f0, np.nan)
    # type(f0) 는 numpy.ndarray 로 행렬구조이지만 파이썬의 연결리스트가 아닌 연속적인 메모리에 배치
    # 성형대수 연산 속도가 향샹된다고 함
    print(type(f0))

    # F0 시각화 (원본과 남성 필터링)
    plt.figure(figsize=(10, 6))
    plt.plot(times, f0, label='Original F0', color='blue', alpha=0.5)
    plt.plot(times, male_f0, label='Filtered Male Voice F0', color='red')
    plt.xlabel('Time (s)')
    plt.ylabel('Frequency (Hz)')
    plt.title('Filtered Male Voice F0 (85 Hz - 180 Hz)')
    plt.legend(loc='upper right')
    plt.grid(True)
    plt.show()

    return times, f0, male_f0


def getFormants(file):
    # 일단 포먼트 쳐내

    # 음성 신호의 공명 주파수. 목소리의 음색 결정
    # 오디오 파일 로드
    sound = parselmouth.Sound(file)

    # 포먼트 추출 (burg method)
    formant = call(sound, "To Formant (burg)", 0.025, 5, 5500, 0.025, 50)

    # 시간 간격으로 F1, F2, F3 추출
    times = np.arange(0, sound.duration, 0.01)  # 0.01초 간격으로 추출
    f1_values = [formant.get_value_at_time(1, t) for t in times]
    f2_values = [formant.get_value_at_time(2, t) for t in times]
    f3_values = [formant.get_value_at_time(3, t) for t in times]

    # 포먼트 시각화
    plt.figure(figsize=(10, 6))
    plt.plot(times, f1_values, label='F1', color='red', alpha=0.7)
    plt.plot(times, f2_values, label='F2', color='green', alpha=0.7)
    plt.plot(times, f3_values, label='F3', color='blue', alpha=0.7)
    plt.xlabel('Time (s)')
    plt.ylabel('Frequency (Hz)')
    plt.title('Formant Frequencies Over Time')
    plt.legend(loc='upper right')
    plt.grid(True)
    plt.show()

    return times, f1_values, f2_values, f3_values


def getHNR(file):
    # 유성구간만 정리
    
    # HNR 계산
    sound = parselmouth.Sound(file)
    hnr = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
    times = np.arange(0, sound.duration, 0.01)
    hnr_values = [hnr.get_value(t) for t in times]

    # 유성 구간만 필터링
    clean_hnr_values = [value for value in hnr_values if not np.isnan(value) and value > 0]
    mean_hnr = np.mean(clean_hnr_values) if clean_hnr_values else 0
    print(f"Filtered Average HNR: {mean_hnr:.2f} dB")  # 유성 구간 평균 HNR 출력

    # HNR 시각화
    plt.figure(figsize=(10, 6))
    plt.plot(times, hnr_values, label='HNR', color='purple', alpha=0.7)
    plt.xlabel('Time (s)')
    plt.ylabel('HNR (dB)')
    plt.title('Harmonics-to-Noise Ratio Over Time (Filtered)')
    plt.ylim(0, max(clean_hnr_values) if clean_hnr_values else 0)  # y축을 0 이상으로 제한
    plt.grid(True)
    plt.legend(loc='upper right')
    plt.show()

    return times, hnr_values, mean_hnr




def getSpectralSlope(file):
    # 목소리의 날카로움이나 부드러움을 평가하는 지표
    # 스펙트럼의 기울기를 계산하여 음색의 특성을 파악
    y, sr = librosa.load(file)
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_slope = np.gradient(spectral_centroids)
    times = librosa.times_like(spectral_centroids, sr=sr)

    # 스펙트럼 경사 시각화
    plt.figure(figsize=(10, 6))
    plt.plot(times, spectral_slope, label='Spectral Slope',
             color='orange', alpha=0.7)
    plt.xlabel('Time (s)')
    plt.ylabel('Spectral Slope')
    plt.title('Spectral Slope Over Time')
    plt.grid(True)
    plt.legend(loc='upper right')
    plt.show()

    return times, spectral_slope


def getAMR(file):
    # Amplitude Modulation Rate (AMR)
    # 목소리의 떨림이나 감정적 변화를 나타냄
    # 안정된 목소리 지표로 사용 가능
    y, sr = librosa.load(file)
    rms = librosa.feature.rms(y=y)[0]
    amr = librosa.feature.delta(rms)  # 진폭 변화율을 이용해 AMR 계산
    times = librosa.times_like(rms, sr=sr)

    # AMR 시각화
    plt.figure(figsize=(10, 6))
    plt.plot(times, amr, label='Amplitude Modulation Rate',
             color='cyan', alpha=0.7)
    plt.xlabel('Time (s)')
    plt.ylabel('AMR')
    plt.title('Amplitude Modulation Rate Over Time')
    plt.grid(True)
    plt.legend(loc='upper right')
    plt.show()

    return times, amr


def getJitterAndShimmer(file):
    # Jitter and Shimmer 추출
    # Jitter 는 주파수 변동, Shimmer 는 진폭 변동
    # 값이 낮을 수록 안정적인 목소리
    sound = parselmouth.Sound(file)
    point_process = call(sound, "To PointProcess (periodic, cc)", 75, 500)

    # Jitter 추출
    jitter = call(point_process, "Get jitter (local)",
                  0, 0.02, 0.0001, 0.02, 1.3)

    # Shimmer 추출
    shimmer = call([sound, point_process],
                   "Get shimmer (local)", 0, 0.02, 0.0001, 0.02, 1.3)

    print(f"Jitter: {jitter}")
    print(f"Shimmer: {shimmer}")

    return jitter, shimmer


def getMel(file):
    # 멜 스펙트럼은 원래의 주파수 정보를 멜 스케일로 변환한 스펙트럼.
    # 사람의 청각 특성을 반영한 주파수 분포를 직접적으로 분석하고 시각화하는 데 적합
    # MFCC는 멜 스펙트럼을 요약하여 음성의 특성을 더욱 압축한 형태
    # 음성의 형태, 음색과 같은 특징을 추출할 때 사용
    y, sr = librosa.load(file)
    mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)

    # MFCC 계산
    mfcc = librosa.feature.mfcc(S=mel_spectrogram_db, sr=sr, n_mfcc=13)
    times = librosa.times_like(mfcc[0], sr=sr)

    # 멜 스펙트럼 시각화
    plt.figure(figsize=(10, 6))
    librosa.display.specshow(mel_spectrogram_db, sr=sr,
                             x_axis='time', y_axis='mel', fmax=8000)
    plt.colorbar(format='%+2.0f dB')
    plt.title('Mel Spectrogram')
    plt.xlabel('Time (s)')
    plt.ylabel('Frequency (Hz)')
    plt.show()

    # MFCC 시각화
    plt.figure(figsize=(10, 6))
    librosa.display.specshow(mfcc, sr=sr, x_axis='time')
    plt.colorbar()
    plt.title('MFCC')
    plt.xlabel('Time (s)')
    plt.ylabel('MFCC Coefficients')
    plt.show()

    return times, mel_spectrogram_db, mfcc


getHNR('test.wav')