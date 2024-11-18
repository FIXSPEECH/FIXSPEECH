import { useNavigate, useRouteError } from "react-router-dom";
import Button from "@mui/material/Button";

function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError() as Error;

  return (
    <div 
      className="h-screen flex flex-col items-center justify-center"
      role="main"
      aria-labelledby="error-title"
    >
      <h1 id="error-title" className="text-white text-4xl mb-4">404 Error</h1>
      <p className="text-white text-xl mb-8">
        죄송합니다. 요청하신 페이지를 찾을 수 없습니다.
      </p>
      {error && (
        <p className="text-[#B9E5E8] mb-8" role="alert">
          에러 상세: {error?.message || "알 수 없는 오류"}
        </p>
      )}
      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          backgroundColor: "#B9E5E8",
          "&:hover": {
            backgroundColor: "#95b5b7",
          },
        }}
        aria-label="메인 페이지로 이동"
      >
        메인으로 돌아가기
      </Button>
    </div>
  );
}

export default ErrorPage;
