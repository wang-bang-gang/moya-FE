import "./Onboarding1.css";
import ProgressBar from "../../components/Progressbar.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Onboarding1() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    setIsExiting(true);

    // 애니메이션이 끝난 후 페이지 이동
    setTimeout(() => {
      navigate("/onboarding2");
    }, 500); // 0.5초 후 이동
  };

  return (
    <div className={`onboarding-page ${isExiting ? "slide-out" : ""}`}>
      <ProgressBar step={1} />
      <h1>
        M<span className="O-of-MOYA">O</span>YA
      </h1>
      <div className="card">
        <p className="slogan">No guidebook,</p>
        <p className="slogan">No group.</p>
        <p className="describe">Just you, and the voice of this place.</p>
      </div>
      <div className="button-wrapper">
        <button className="next-btn" onClick={handleNext}>
          →
        </button>
      </div>
    </div>
  );
}

export default Onboarding1;
