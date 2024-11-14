import styled from "@emotion/styled";

const GradientCirclePlanes = () => {
  return (
    <SpinnerBox>
      <BlueOrbit className="leo" />
      <GreenOrbit className="leo" />
      <RedOrbit className="leo" />
      <WhiteOrbit className="w1 leo" />
      <WhiteOrbit className="w2 leo" />
      <WhiteOrbit className="w3 leo" />
      <LeoBorder1>
        <LeoCore1 />
      </LeoBorder1>
      <LeoBorder2>
        <LeoCore2 />
      </LeoBorder2>
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

const spin3DAlternateKeyframes = `
  @keyframes spin3DAlternate {
    0% {
      transform: rotate3d(.5,.5,.5, 0deg);
    }
    50% {
      transform: rotate3d(.5,.5,.5, 180deg);
    }
    100% {
      transform: rotate3d(.5,.5,.5, 360deg);
    }
  }
`;

const SpinnerBox = styled.div`
  ${spin3DKeyframes}
  ${spin3DAlternateKeyframes}
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
  animation: spin3DAlternate 10s linear infinite;

  &.w1 {
    animation-delay: -2s;
  }
  &.w2 {
    animation-delay: -4s;
  }
  &.w3 {
    animation-delay: -6s;
  }
`;

const LeoBorder1 = styled.div`
  position: absolute;
  width: 150px;
  height: 150px;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgb(63, 249, 220);
  background: linear-gradient(
    0deg,
    rgba(63, 249, 220, 0.1) 33%,
    rgba(63, 249, 220, 1) 100%
  );
  animation: spin3D 1.8s linear 0s infinite;
`;

const LeoCore1 = styled.div`
  width: 100%;
  height: 100%;
  background-color: #37474faa;
  border-radius: 50%;
`;

const LeoBorder2 = styled.div`
  position: absolute;
  width: 150px;
  height: 150px;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgb(251, 91, 83);
  background: linear-gradient(
    0deg,
    rgba(251, 91, 83, 0.1) 33%,
    rgba(251, 91, 83, 1) 100%
  );
  animation: spin3D 2.2s linear 0s infinite;
`;

const LeoCore2 = styled.div`
  width: 100%;
  height: 100%;
  background-color: #37474faa;
  border-radius: 50%;
`;

export default GradientCirclePlanes;
