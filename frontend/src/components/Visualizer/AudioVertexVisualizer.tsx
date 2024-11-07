import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// 타입 정의
type AudioVertexVisualizerProps = {
  size?: "small" | "medium" | "large";
};

// 사이즈별 설정값
const SIZE_CONFIG = {
  small: {
    DETAIL: 2, // 성긴 그리드
    SENSITIVITY: 0.06, // 높은 민감도
    TIME_SCALE: 1.0, // 빠른 움직임
  },
  medium: {
    DETAIL: 15, // 중간 그리드
    SENSITIVITY: 0.04, // 중간 민감도
    TIME_SCALE: 0.7, // 중간 속도
  },
  large: {
    DETAIL: 25, // 촘촘한 그리드
    SENSITIVITY: 0.03, // 낮은 민감도
    TIME_SCALE: 0.5, // 느린 움직임
  },
};

// 기본 시각화 설정
const VISUALIZATION_CONFIG = {
  SPHERE: {
    RADIUS: 4,
    DETAIL: 25,
  },
  CAMERA: {
    INITIAL_POSITION: [0, 0, 14] as [number, number, number],
    FOV: 45,
    NEAR: 0.1,
    FAR: 1000,
    ROTATION_SPEED: 0.05,
  },
  BLOOM: {
    INTENSITY: 0.4,
    THRESHOLD: 0.5,
    SMOOTHING: 0.8,
  },
  AUDIO: {
    FFT_SIZE: 32,
    SENSITIVITY: 0.03,
    SMOOTHING: 0.9,
  },
};

// 사이즈별 설정 생성 함수
const getVisualizationConfig = (size: "small" | "medium" | "large") => ({
  ...VISUALIZATION_CONFIG,
  SPHERE: {
    RADIUS: 4,
    DETAIL: SIZE_CONFIG[size].DETAIL,
  },
  AUDIO: {
    ...VISUALIZATION_CONFIG.AUDIO,
    SENSITIVITY: SIZE_CONFIG[size].SENSITIVITY,
  },
  TIME_SCALE: SIZE_CONFIG[size].TIME_SCALE,
});

// 버텍스 쉐이더: 정점의 위치를 변형하는 코드
const vertexShader = `
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+10.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  float pnoise(vec3 P, vec3 rep) {
    vec3 Pi0 = mod(floor(P), rep);
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }

  uniform float u_time;
  uniform float u_frequency;

  varying float vDisplacement;  // fragment shader로 전달할 변수

  void main() {
    float noise = 1.5 * pnoise(position + u_time, vec3(10.));
    float displacement = u_frequency * noise * 0.1;
    vec3 newPosition = position + normal * displacement;
  
    vDisplacement = displacement;  // fragment shader로 전달
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

// 프래그먼트 쉐이더: 색상을 결정하는 코드
const fragmentShader = `
  varying float vDisplacement;

  // 메탈릭/네온 스타일의 색상
  vec3 colorA = vec3(0.0, 1.0, 0.8);  // 네온 터콰이즈
  vec3 colorB = vec3(0.2, 0.0, 1.0);  // 일렉트릭 블루

  void main() {
    float mixValue = (vDisplacement + 1.0) * 0.5;
    vec3 color = mix(colorA, colorB, mixValue);
    
    // 메탈릭한 광택 효과
    color += vec3(0.15) * pow(mixValue, 3.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// 메인 컴포넌트
export const AudioVertexVisualizer = ({
  size = "large",
}: AudioVertexVisualizerProps) => {
  const config = getVisualizationConfig(size);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        style={{ position: "absolute", top: 0, left: 0 }}
        camera={{
          position: config.CAMERA.INITIAL_POSITION,
          fov: config.CAMERA.FOV,
          near: config.CAMERA.NEAR,
          far: config.CAMERA.FAR,
        }}
      >
        <Scene config={config} />
        <EffectComposer>
          <Bloom
            intensity={config.BLOOM.INTENSITY}
            luminanceThreshold={config.BLOOM.THRESHOLD}
            luminanceSmoothing={config.BLOOM.SMOOTHING}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

// Scene 컴포넌트: 3D 오브젝트와 쉐이더 처리
function Scene({
  config,
}: {
  config: ReturnType<typeof getVisualizationConfig>;
}) {
  // Refs for audio and mesh
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef({ x: 0, y: 0 });

  // 마우스 상태 관리
  const mouseRef = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  // Uniforms for shaders
  const uniforms = {
    u_time: { value: 0 },
    u_frequency: { value: 0 },
  };

  // 마우스 이벤트 핸들러
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { width, height } = gl.domElement;

      // 마우스 위치를 -1에서 1 사이의 값으로 정규화
      const normalizedX = (clientX / width) * 2 - 1;
      const normalizedY = (clientY / height) * 2 - 1;

      // 회전값 설정
      rotationRef.current.x = normalizedY * Math.PI * 0.5;
      rotationRef.current.y = normalizedX * Math.PI * 0.5;

      mouseRef.current.x = clientX / width;
      mouseRef.current.y = clientY / height;
    };

    const canvas = gl.domElement;
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gl]);

  // 오디오 초기화 함수
  const initAudio = async () => {
    try {
      // 이미 실행 중인 AudioContext가 있다면 재사용
      if (audioContextRef.current?.state === "running") {
        return;
      }

      // 새로운 AudioContext 생성
      const context = new AudioContext();
      audioContextRef.current = context;

      // 마이크 접근 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // 오디오 처리 설정
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = config.AUDIO.FFT_SIZE;
      analyser.smoothingTimeConstant = config.AUDIO.SMOOTHING;
      source.connect(analyser);
      analyserRef.current = analyser;

      // AudioContext 시작
      await context.resume();
      console.log("마이크 연결 성공!");
    } catch (err) {
      console.error("마이크 접근 실패:", err);
      // 실패 시 3초 후 재시도
      setTimeout(initAudio, 3000);
    }
  };

  // 컴포넌트 마운트 시 자동 시작
  useEffect(() => {
    const startAudio = async () => {
      try {
        await initAudio();
      } catch (error) {
        console.error("오디오 초기화 실패:", error);
      }
    };

    startAudio();

    // 클린업
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current = null;
      }
    };
  }, []);

  // 페이지 가시성 변경 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        initAudio();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 애니메이션 프레임마다 실행
  useFrame((state) => {
    if (!meshRef.current || !analyserRef.current) return;

    // 오디오 데이터 분석
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

    // 쉐이더 유니폼 업데이트
    uniforms.u_frequency.value = average * config.AUDIO.SENSITIVITY;
    uniforms.u_time.value = state.clock.getElapsedTime() * config.TIME_SCALE;

    // 부드러운 회전
    meshRef.current.rotation.x +=
      (rotationRef.current.x - meshRef.current.rotation.x) *
      config.CAMERA.ROTATION_SPEED;
    meshRef.current.rotation.y +=
      (rotationRef.current.y - meshRef.current.rotation.y) *
      config.CAMERA.ROTATION_SPEED;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry
        args={[config.SPHERE.RADIUS, config.SPHERE.DETAIL]}
      />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={true}
      />
    </mesh>
  );
}

export default AudioVertexVisualizer;
