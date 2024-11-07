import { useNavigate } from "react-router-dom";
import "../../styles/Header/Header.css";

function Header() {
  const navigate = useNavigate();

  return (
    <div className="logo-header">
      <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        FIXSPEECH
      </span>
    </div>
  );
}

export default Header;
