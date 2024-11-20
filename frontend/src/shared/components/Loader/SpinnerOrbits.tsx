import styled from "@emotion/styled";

interface SpinnerOrbitsProps {
  size: number; // size prop 추가
}

const SpinnerOrbits = ({ size }: SpinnerOrbitsProps) => {
  return (
    <SpinnerBox size={size}>
      <BlueOrbit size={size * 0.55} />
      <GreenOrbit size={size * 0.4} />
      <RedOrbit size={size * 0.3} />
      <WhiteOrbit className="w1" size={size * 0.2} />
      <WhiteOrbit className="w2" size={size * 0.2} />
      <WhiteOrbit className="w3" size={size * 0.2} />
    </SpinnerBox>
  );
};

const spin3DKeyframes = `
  @keyframes spin3D {
    from {
      transform: rotate3d(.5,.5,.5, 360deg);
    }
    to{
      transform: rotate3d(0deg);
    }
  }
`;

const SpinnerBox = styled.div<SpinnerOrbitsProps>`
  ${spin3DKeyframes}
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
`;

const Orbit = styled.div<{ size: number }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  z-index: 99;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;

const BlueOrbit = styled(Orbit)`
  border: 1px solid #91daffa5;
  animation: spin3D 3s linear 0.2s infinite;
`;

const GreenOrbit = styled(Orbit)`
  border: 1px solid #91ffbfa5;
  animation: spin3D 2s linear 0s infinite;
`;

const RedOrbit = styled(Orbit)`
  border: 1px solid #ffca91a5;
  animation: spin3D 1s linear 0s infinite;
`;

const WhiteOrbit = styled(Orbit)`
  border: 2px solid #ffffff;
  animation: spin3D 10s linear 0s infinite;

  &.w1 {
    transform: rotate3D(1, 1, 1, 90deg);
  }
  &.w2 {
    transform: rotate3D(1, 2, 0.5, 90deg);
  }
  &.w3 {
    transform: rotate3D(0.5, 1, 2, 90deg);
  }
`;

export default SpinnerOrbits;
