import "./Onboarding2.css";
import ProgressBar from "../../components/Progressbar.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Onboarding2() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    setIsExiting(true);

    // 애니메이션이 끝난 후 페이지 이동
    setTimeout(() => {
      navigate("/LanguageSelect");
    }, 500); // 0.5초 후 이동
  };

  return (
    <div className={`onboarding-page2 ${isExiting ? "slide-out" : ""}`}>
      <ProgressBar />
      <h1>
        M<span className="O-of-MOYA">O</span>YA
      </h1>
      <div className="card">
        <p className="slogan">is your personal </p>
        <p className="slogan">audio guide.</p>
        <div className="describe">
          <p className="describe-top">We recognize where you are,</p>
          <p>and shares stories in your language—</p>
          <p>just like a friendly local showing you around.</p>
        </div>
      </div>
      <div className="button-wrapper2">
        <button className="next-btn" onClick={handleNext}>
          →
        </button>
      </div>
    </div>
  );
}

export default Onboarding2;
