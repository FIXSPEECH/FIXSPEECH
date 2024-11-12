import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  Matrix4,
  MeshBasicMaterial,
  Color,
  type InstancedMesh,
  Group,
} from "three";

// =============== 시각화 설정값 (조절 가능) ===============
const VISUALIZER_CONFIG = {
  // 구형 배치 설정
  RADIUS: 2, // 전체 구의 반지름
  N_CUBES: 1000, // 총 큐브 개수
  CUBE_SIZE: 0.08, // 큐브 크기
  MIN_SCALE: 0.9, // 최소 크기 배율 (0.8 -> 0.9로 증가)
  MAX_SCALE: 1.3, // 최대 크기 배율 (1.5 -> 1.3으로 감소)
  SCALE_SMOOTHING: 0.05, // 크기 변화 부드러움 (0.1 -> 0.05로 감소)

  // 색상 설정
  COLOR_START: new Color("#00ffff"), // 네온 시안
  COLOR_END: new Color("#0033cc"), // 진한 네이비
  COLOR_ACTIVE: new Color("#ffff00"), // 선명한 노랑

  // 애니메이션 설정
  ROTATION_SPEED: 0.0003, // 회전 속도 감소
  COLOR_TRANSITION_SPEED: 0.03, // 색상 전환 속도 감소

  // 조명 설정
  AMBIENT_LIGHT: {
    intensity: 0.8,
  },

  // 오디오 분석 설정
  SAMPLE_SIZE: 32, // 오디오 샘플 크기

  // 반응성 설정
  AUDIO_SENSITIVITY: 4.0, // 오디오 민감도 증가 (2.5 -> 4.0)
  VOLUME_THRESHOLD: 0.05, // 볼륨 임계값 (작은 소리에도 반응하도록)
  BASE_SCALE: 0.2, // 기본 스케일 값 (항상 어느정도 움직임 보장)
};

const AudioSphereVisualizer = () => {
  const groupRef = useRef<Group>(null!);
  const meshRef = useRef<InstancedMesh>(null!);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const currentColors = useRef<Color[]>([]);
  const currentScale = useRef<number>(1);
  const prevVolumeRef = useRef<number>(0); // 이전 볼륨 저장용

  const [isListening, setIsListening] = useState(false);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  // 오디오 컨텍스트 초기화 및 마이크 연결
  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);

        analyserRef.current.smoothingTimeConstant = 0.9; // 더 부드러운 전환을 위해 증가
        analyserRef.current.fftSize = VISUALIZER_CONFIG.SAMPLE_SIZE * 2;
        source.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        setIsListening(true);
      } catch (err) {
        console.error("마이크 접근 오류:", err);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 큐브 초기화 - 나선형 구 배치
  useEffect(() => {
    if (!meshRef.current) return;

    const phi = Math.PI * (3 - Math.sqrt(5));
    currentColors.current = new Array(VISUALIZER_CONFIG.N_CUBES)
      .fill(null)
      .map(() => new Color());

    for (let i = 0; i < VISUALIZER_CONFIG.N_CUBES; i++) {
      const t = i / VISUALIZER_CONFIG.N_CUBES;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = phi * i;

      const x = Math.sin(inclination) * Math.cos(azimuth);
      const y = Math.sin(inclination) * Math.sin(azimuth);
      const z = Math.cos(inclination);

      tmpMatrix.setPosition(
        x * VISUALIZER_CONFIG.RADIUS,
        y * VISUALIZER_CONFIG.RADIUS,
        z * VISUALIZER_CONFIG.RADIUS
      );

      const scale = VISUALIZER_CONFIG.CUBE_SIZE;
      tmpMatrix.elements[0] = scale;
      tmpMatrix.elements[5] = scale;
      tmpMatrix.elements[10] = scale;

      meshRef.current.setMatrixAt(i, tmpMatrix);

      const height = Math.abs(z);
      const color = currentColors.current[i];
      color.lerpColors(
        VISUALIZER_CONFIG.COLOR_START,
        VISUALIZER_CONFIG.COLOR_END,
        height
      );
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [tmpMatrix]);

  // 애니메이션 프레임 업데이트
  useFrame(({ clock }) => {
    if (
      !groupRef.current ||
      !meshRef.current ||
      !isListening ||
      !analyserRef.current ||
      !dataArrayRef.current
    )
      return;

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
    const time = clock.getElapsedTime();

    // 전체 오디오 볼륨 계산
    let totalVolume = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      totalVolume += Math.abs(dataArrayRef.current[i] - 128);
    }
    const averageVolume = totalVolume / dataArrayRef.current.length / 128;

    // 볼륨 보간 및 기본 움직임 추가
    const smoothedVolume = averageVolume * 0.3 + prevVolumeRef.current * 0.7;
    prevVolumeRef.current = smoothedVolume;

    const normalizedVolume = Math.min(
      smoothedVolume * VISUALIZER_CONFIG.AUDIO_SENSITIVITY +
        VISUALIZER_CONFIG.BASE_SCALE,
      1
    );

    // 목표 스케일 계산 (볼륨에 따라)
    const targetScale =
      VISUALIZER_CONFIG.MIN_SCALE +
      (VISUALIZER_CONFIG.MAX_SCALE - VISUALIZER_CONFIG.MIN_SCALE) *
        normalizedVolume;

    // 현재 스케일을 목표 스케일로 부드럽게 보간
    currentScale.current +=
      (targetScale - currentScale.current) * VISUALIZER_CONFIG.SCALE_SMOOTHING;

    for (let i = 0; i < VISUALIZER_CONFIG.N_CUBES; i++) {
      const t = i / VISUALIZER_CONFIG.N_CUBES;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = Math.PI * (3 - Math.sqrt(5)) * i + time * 0.2;

      const x = Math.sin(inclination) * Math.cos(azimuth);
      const y = Math.sin(inclination) * Math.sin(azimuth);
      const z = Math.cos(inclination);

      tmpMatrix.setPosition(
        x * VISUALIZER_CONFIG.RADIUS * currentScale.current,
        y * VISUALIZER_CONFIG.RADIUS * currentScale.current,
        z * VISUALIZER_CONFIG.RADIUS * currentScale.current
      );

      const scale = VISUALIZER_CONFIG.CUBE_SIZE;
      tmpMatrix.elements[0] = scale;
      tmpMatrix.elements[5] = scale;
      tmpMatrix.elements[10] = scale;

      meshRef.current.setMatrixAt(i, tmpMatrix);

      const height = Math.abs(z);
      const currentColor = currentColors.current[i];
      const targetColor = new Color();

      // 볼륨에 따른 색상 보간 (임계값 낮춤)
      if (normalizedVolume > VISUALIZER_CONFIG.VOLUME_THRESHOLD) {
        targetColor.lerpColors(
          VISUALIZER_CONFIG.COLOR_END,
          VISUALIZER_CONFIG.COLOR_ACTIVE,
          normalizedVolume
        );
      } else {
        targetColor.lerpColors(
          VISUALIZER_CONFIG.COLOR_START,
          VISUALIZER_CONFIG.COLOR_END,
          height
        );
      }

      // 부드러운 색상 전환
      currentColor.lerp(targetColor, VISUALIZER_CONFIG.COLOR_TRANSITION_SPEED);
      meshRef.current.setColorAt(i, currentColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;

    groupRef.current.rotation.y += VISUALIZER_CONFIG.ROTATION_SPEED;
  });

  return (
    <>
      <ambientLight intensity={VISUALIZER_CONFIG.AMBIENT_LIGHT.intensity} />
      <group ref={groupRef}>
        <instancedMesh
          ref={meshRef}
          args={[
            new BoxGeometry(1, 1, 1),
            new MeshBasicMaterial({
              transparent: true,
              opacity: 0.9,
            }),
            VISUALIZER_CONFIG.N_CUBES,
          ]}
        />
      </group>
    </>
  );
};

export default AudioSphereVisualizer;
