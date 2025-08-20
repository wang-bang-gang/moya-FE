import { useLocation } from "react-router-dom";
import "./ProgressBar.css";

function ProgressBar() {
  const location = useLocation();

  let currentStep = 1;
  if (location.pathname === "/onboarding2") currentStep = 2;
  if (location.pathname === "/LanguageSelect") currentStep = 3;

  return (
    <div className="progress-bar">
      <div className={`step ${currentStep === 1 ? "active" : ""}`}></div>
      <div className={`step ${currentStep === 2 ? "active" : ""}`}></div>
      <div className={`step ${currentStep === 3 ? "active" : ""}`}></div>
    </div>
  );
}

export default ProgressBar;
