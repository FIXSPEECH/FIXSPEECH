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
  // 큐브 구조 설정
  N_PER_SIDE: 12, // 한 변의 큐브 개수 (전체 큐브 수 = N_PER_SIDE^3)
  CUBE_SIDE_LENGTH: 0.4, // 각 큐브의 크기
  CUBE_SPACING_SCALAR: 1, // 큐브 간 간격 배수

  // 크기 변화 설정
  MIN_SCALE: 0.2, // 최소 크기 배수
  MAX_SCALE: 1.2, // 최대 크기 배수

  // 기본 색상 설정 (소리가 없을 때)
  COLOR_START: new Color("#ff1744"), // 시작 색상 (빨강)
  COLOR_MID: new Color("#ff9800"), // 중간 색상 (주황)
  COLOR_END: new Color("#00e5ff"), // 끝 색상 (하늘)

  // 오디오 반응 색상 설정 (소리가 있을 때)
  AUDIO_COLORS: [
    new Color("#ff1744"), // 빨강
    new Color("#e040fb"), // 보라
    new Color("#00e5ff"), // 하늘
    new Color("#76ff03"), // 라임
    new Color("#ffeb3b"), // 노랑
  ],

  // 애니메이션 설정
  ROTATION_SPEED: 0.005, // 회전 속도

  // 조명 설정
  AMBIENT_LIGHT: {
    intensity: 0.5, // 환경광 강도
  },

  // 오디오 분석 설정
  FFT_SIZE: 2048, // FFT 크기 (오디오 분석 정밀도)

  // 색상 전환 설정
  AUDIO_THRESHOLD: 0.1, // 소리 감지 임계값
  MIN_BRIGHTNESS: 0.5, // 최소 밝기
  MIN_SATURATION: 0.7, // 최소 채도
};

const AudioCubeVisualizer = () => {
  const groupRef = useRef<Group>(null!);
  const meshRef = useRef<InstancedMesh>(null!);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

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

        analyserRef.current.fftSize = VISUALIZER_CONFIG.FFT_SIZE;
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

  // 큐브 색상 초기화
  useEffect(() => {
    if (!meshRef.current) return;

    const { N_PER_SIDE } = VISUALIZER_CONFIG;
    const center = (N_PER_SIDE - 1) / 2;

    for (let row = 0; row < N_PER_SIDE; row++) {
      for (let col = 0; col < N_PER_SIDE; col++) {
        for (let depth = 0; depth < N_PER_SIDE; depth++) {
          const instanceIdx = row * N_PER_SIDE ** 2 + col * N_PER_SIDE + depth;

          const distanceFromCenter =
            Math.sqrt(
              Math.pow(row - center, 2) +
                Math.pow(col - center, 2) +
                Math.pow(depth - center, 2)
            ) /
            (center * Math.sqrt(3));

          const angleFromCenter =
            Math.atan2(row - center, col - center) / (2 * Math.PI) + 0.5;

          const color = new Color();
          color.lerpColors(
            VISUALIZER_CONFIG.COLOR_START,
            VISUALIZER_CONFIG.COLOR_END,
            (angleFromCenter + distanceFromCenter) * 0.5
          );
          meshRef.current.setColorAt(instanceIdx, color);
        }
      }
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, []);

  // 애니메이션 프레임 업데이트
  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;

    // 전체 그룹 회전
    groupRef.current.rotation.y += VISUALIZER_CONFIG.ROTATION_SPEED;
    groupRef.current.rotation.x += VISUALIZER_CONFIG.ROTATION_SPEED * 0.5;

    if (!isListening || !analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const { N_PER_SIDE, CUBE_SIDE_LENGTH, CUBE_SPACING_SCALAR } =
      VISUALIZER_CONFIG;
    const faceSize = N_PER_SIDE * (1 + CUBE_SPACING_SCALAR) * CUBE_SIDE_LENGTH;
    const center = (N_PER_SIDE - 1) / 2;

    for (let row = 0; row < N_PER_SIDE; row++) {
      for (let col = 0; col < N_PER_SIDE; col++) {
        for (let depth = 0; depth < N_PER_SIDE; depth++) {
          const instanceIdx = row * N_PER_SIDE ** 2 + col * N_PER_SIDE + depth;

          const distanceFromCenter =
            Math.sqrt(
              Math.pow(row - center, 2) +
                Math.pow(col - center, 2) +
                Math.pow(depth - center, 2)
            ) /
            (center * Math.sqrt(3));

          const normCubeX = row / (N_PER_SIDE - 1);
          const normCubeY = col / (N_PER_SIDE - 1);
          const normCubeZ = depth / (N_PER_SIDE - 1);

          const x = faceSize * (normCubeX - 0.5);
          const y = faceSize * (normCubeY - 0.5);
          const z = faceSize * (normCubeZ - 0.5);

          tmpMatrix.setPosition(x, y, z);

          const audioIndex = Math.floor(
            distanceFromCenter * dataArrayRef.current.length
          );
          const audioValue = dataArrayRef.current[audioIndex] / 255;

          const scale =
            VISUALIZER_CONFIG.MIN_SCALE +
            (1 - distanceFromCenter) *
              audioValue *
              (VISUALIZER_CONFIG.MAX_SCALE - VISUALIZER_CONFIG.MIN_SCALE);

          tmpMatrix.elements[0] = scale;
          tmpMatrix.elements[5] = scale;
          tmpMatrix.elements[10] = scale;

          meshRef.current.setMatrixAt(instanceIdx, tmpMatrix);

          const color = new Color();
          const angleFromCenter =
            Math.atan2(row - center, col - center) / (2 * Math.PI) + 0.5;

          if (audioValue < 0.1) {
            // 소리가 거의 없을 때: 부드러운 그라디언트
            color.lerpColors(
              VISUALIZER_CONFIG.COLOR_START,
              VISUALIZER_CONFIG.COLOR_END,
              (angleFromCenter + distanceFromCenter) * 0.5
            );
          } else {
            // 소리가 날 때: 다채로운 색상 그라디언트
            const colorIndex = Math.floor(
              angleFromCenter * VISUALIZER_CONFIG.AUDIO_COLORS.length
            );
            const nextColorIndex =
              (colorIndex + 1) % VISUALIZER_CONFIG.AUDIO_COLORS.length;
            const colorFraction =
              (angleFromCenter * VISUALIZER_CONFIG.AUDIO_COLORS.length) % 1;

            // 인접한 두 색상 사이의 부드러운 전환
            const baseColor = new Color().lerpColors(
              VISUALIZER_CONFIG.AUDIO_COLORS[colorIndex],
              VISUALIZER_CONFIG.AUDIO_COLORS[nextColorIndex],
              colorFraction
            );

            // 거리에 따른 밝기 변화
            color.copy(baseColor);
            const brightness = 0.5 + (1 - distanceFromCenter) * 0.5;
            color.multiplyScalar(brightness);

            // 오디오 강도에 따른 채도 조절
            const saturationBoost = 0.7 + audioValue * 0.3;
            color.multiplyScalar(saturationBoost);
          }

          meshRef.current.setColorAt(instanceIdx, color);
        }
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={VISUALIZER_CONFIG.AMBIENT_LIGHT.intensity} />
      <group ref={groupRef}>
        <instancedMesh
          ref={meshRef}
          castShadow={true}
          receiveShadow={true}
          args={[
            new BoxGeometry(),
            new MeshBasicMaterial(),
            VISUALIZER_CONFIG.N_PER_SIDE ** 3,
          ]}
        >
          <boxGeometry
            attach="geometry"
            args={[
              VISUALIZER_CONFIG.CUBE_SIDE_LENGTH,
              VISUALIZER_CONFIG.CUBE_SIDE_LENGTH,
              VISUALIZER_CONFIG.CUBE_SIDE_LENGTH,
            ]}
          />
          <meshBasicMaterial attach="material" toneMapped={false} />
        </instancedMesh>
      </group>
    </>
  );
};

export default AudioCubeVisualizer;
