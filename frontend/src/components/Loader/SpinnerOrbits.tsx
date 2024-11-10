import styled from "@emotion/styled";

const SpinnerOrbits = () => {
  return (
    <SpinnerBox>
      <BlueOrbit className="leo" />
      <GreenOrbit className="leo" />
      <RedOrbit className="leo" />
      <WhiteOrbit className="w1 leo" />
      <WhiteOrbit className="w2 leo" />
      <WhiteOrbit className="w3 leo" />
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

const SpinnerBox = styled.div`
  ${spin3DKeyframes}
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
`;

const Orbit = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  z-index: 99;
`;

const BlueOrbit = styled(Orbit)`
  width: 165px;
  height: 165px;
  border: 1px solid #91daffa5;
  animation: spin3D 3s linear 0.2s infinite;
`;

const GreenOrbit = styled(Orbit)`
  width: 120px;
  height: 120px;
  border: 1px solid #91ffbfa5;
  animation: spin3D 2s linear 0s infinite;
`;

const RedOrbit = styled(Orbit)`
  width: 90px;
  height: 90px;
  border: 1px solid #ffca91a5;
  animation: spin3D 1s linear 0s infinite;
`;

const WhiteOrbit = styled(Orbit)`
  width: 60px;
  height: 60px;
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
