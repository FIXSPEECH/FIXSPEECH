import { useEffect, useRef } from "react";
import * as THREE from "three";

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js 설정
    const scene = new THREE.Scene();

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    // 컨테이너 스타일 설정
    containerRef.current.style.position = "fixed";
    containerRef.current.style.top = "0";
    containerRef.current.style.left = "0";
    containerRef.current.style.zIndex = "-1";
    containerRef.current.appendChild(renderer.domElement);

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 1000;

    // 카메라 그룹 생성
    const cameraGroup = new THREE.Group();
    cameraGroup.add(camera);
    scene.add(cameraGroup);

    // 파티클 생성
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // 파티클 색상 팔레트
    const colorPalette = [
      new THREE.Color(0x4a90e2), // 파란색
      new THREE.Color(0x50e3c2), // 청록색
      new THREE.Color(0x9013fe), // 보라색
      new THREE.Color(0xffffff), // 흰색
    ];

    for (let i = 0; i < particleCount * 3; i += 3) {
      // 위치 설정
      posArray[i] = (Math.random() - 0.5) * 2000; // x
      posArray[i + 1] = (Math.random() - 0.5) * 2000; // y
      posArray[i + 2] = (Math.random() - 0.5) * 2000; // z

      // 랜덤 색상 선택
      const color =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 모션 추적을 위한 상태
    const motion = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      velocityX: 0,
      velocityY: 0,
    };

    // 스프링 설정
    const spring = {
      tension: 0.1,
      friction: 0.3,
      precision: 0.01,
    };

    // 리사이즈 핸들러
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // 디바이스 방향 핸들러
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta && event.gamma) {
        motion.targetX = (event.gamma / 90) * 100;
        motion.targetY = (event.beta / 180) * 100;
      }
    };

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);

      // 스프링 물리 시뮬레이션
      const springForceX = (motion.targetX - motion.x) * spring.tension;
      const springForceY = (motion.targetY - motion.y) * spring.friction;

      motion.velocityX += springForceX;
      motion.velocityY += springForceY;

      motion.velocityX *= 1 - spring.friction;
      motion.velocityY *= 1 - spring.friction;

      motion.x += motion.velocityX;
      motion.y += motion.velocityY;

      // 카메라 그룹 회전
      cameraGroup.rotation.y = THREE.MathUtils.lerp(
        cameraGroup.rotation.y,
        ((motion.x * Math.PI) / 180) * 0.3,
        0.1
      );
      cameraGroup.rotation.x = THREE.MathUtils.lerp(
        cameraGroup.rotation.x,
        ((motion.y * Math.PI) / 180) * 0.3,
        0.1
      );

      // 카메라 안정화 회전
      camera.rotation.y = THREE.MathUtils.lerp(
        camera.rotation.y,
        ((-motion.x * Math.PI) / 180) * 0.1,
        0.05
      );
      camera.rotation.x = THREE.MathUtils.lerp(
        camera.rotation.x,
        ((-motion.y * Math.PI) / 180) * 0.1,
        0.05
      );

      // 파티클 시스템 자체 회전
      particleSystem.rotation.x += 0.00005;
      particleSystem.rotation.y += 0.00005;

      renderer.render(scene, camera);
    };

    // 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    animate();

    // 클린업
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
};

export default ParticleBackground;
