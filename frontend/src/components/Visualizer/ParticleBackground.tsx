import { useEffect, useRef } from "react";
import * as THREE from "three";

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js 설정
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 색상 팔레트 정의
    const colorPalettes = [
      // 파스텔톤
      { r: 255 / 255, g: 182 / 255, b: 193 / 255 }, // 핑크
      { r: 173 / 255, g: 216 / 255, b: 230 / 255 }, // 하늘색
      { r: 144 / 255, g: 238 / 255, b: 144 / 255 }, // 라이트그린
      { r: 221 / 255, g: 160 / 255, b: 221 / 255 }, // 라벤더
      { r: 255 / 255, g: 218 / 255, b: 185 / 255 }, // 피치
      // 비비드한 색상
      { r: 255 / 255, g: 105 / 255, b: 180 / 255 }, // 핫핑크
      { r: 65 / 255, g: 105 / 255, b: 225 / 255 }, // 로얄블루
      { r: 50 / 255, g: 205 / 255, b: 50 / 255 }, // 라임그린
      { r: 148 / 255, g: 0 / 255, b: 211 / 255 }, // 바이올렛
      { r: 255 / 255, g: 165 / 255, b: 0 / 255 }, // 오렌지
    ];

    // 파티클 시스템 설정
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // 위치 설정
      positions[i] = (Math.random() - 0.5) * 1000;
      positions[i + 1] = (Math.random() - 0.5) * 1000;
      positions[i + 2] = (Math.random() - 0.5) * 1000;

      // 랜덤 색상 선택
      const colorPalette =
        colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
      colors[i] = colorPalette.r;
      colors[i + 1] = colorPalette.g;
      colors[i + 2] = colorPalette.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending, // 색상 블렌딩 효과 추가
      })
    );

    scene.add(particles);
    camera.position.z = 500;

    // 디바이스 방향 상태 추적
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    // 디바이스 방향 이벤트 핸들러
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta && event.gamma) {
        // beta는 앞뒤 기울기 (-180° ~ 180°)
        // gamma는 좌우 기울기 (-90° ~ 90°)
        targetTiltX = (event.gamma / 90) * Math.PI * 0.1;
        targetTiltY = (event.beta / 180) * Math.PI * 0.1;
      }
    };

    // 애니메이션
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.001;

      // 부드러운 틸트 효과
      tiltX += (targetTiltX - tiltX) * 0.05;
      tiltY += (targetTiltY - tiltY) * 0.05;

      particles.rotation.x += 0.0002 + tiltY * 0.01;
      particles.rotation.y += 0.0002 + tiltX * 0.01;

      // 카메라 위치도 기울기에 따라 조정
      camera.position.x = tiltX * 50;
      camera.position.y = -tiltY * 50;
      camera.lookAt(scene.position);

      // 파티클 움직임 추가
      const positions = particles.geometry.attributes.position
        .array as Float32Array;
      const colors = particles.geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        // 웨이브 모션
        positions[i + 2] += Math.sin(time * 2 + i) * 0.1;

        // 색상 천천히 변화
        const colorIndex =
          Math.floor((Math.sin(time + i) + 1) * 5) % colorPalettes.length;
        const targetColor = colorPalettes[colorIndex];

        colors[i] += (targetColor.r - colors[i]) * 0.01;
        colors[i + 1] += (targetColor.g - colors[i + 1]) * 0.01;
        colors[i + 2] += (targetColor.b - colors[i + 2]) * 0.01;
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 윈도우 리사이즈 핸들러
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // 이벤트 리스너 추가
    window.addEventListener("deviceorientation", handleDeviceOrientation);

    // 클린업
    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};

export default ParticleBackground;
