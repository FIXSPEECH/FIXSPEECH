import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../stores/authStore";

function ProtectedRoute() {
  const isLogin = useAuthStore((state) => state.isLogin);

  return isLogin ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
