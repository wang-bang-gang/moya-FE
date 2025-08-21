import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadingPage.css";

function LoadingPage() {
  const navigate = useNavigate();
  const [loadingText, setLoadingText] = useState("지도를 불러오는 중");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 로딩 텍스트 변경 애니메이션 (3초에 맞춰 조정)
    const loadingMessages = [
      "지도를 불러오는 중",
      "위치 정보를 확인하는 중",
      "주변 명소를 찾는 중",
    ];

    let messageIndex = 0;
    const textInterval = setInterval(() => {
      if (messageIndex < loadingMessages.length - 1) {
        messageIndex++;
        setLoadingText(loadingMessages[messageIndex]);
      }
    }, 1000); // 1초마다 메시지 변경

    // 프로그레스 바 애니메이션 (3초 동안)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          // 프로그레스 완료 후 바로 지도 페이지로 이동
          setTimeout(() => {
            navigate("/MapPage", { replace: true }); // replace로 뒤로가기 방지
          }, 200);
          return 100;
        }
        return prev + 3.33; // 100% ÷ 30틱 = 약 3.33% (3초)
      });
    }, 100); // 0.1초마다 업데이트

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="loading-page">
      <div className="loading-container">
        {/* MOYA 로고 */}
        <div className="loading-logo">
          <h1>
            M<span className="O-of-MOYA">O</span>YA
          </h1>
          <p className="loading-subtitle">Memory Of Your Voice</p>
        </div>

        {/* 로딩 애니메이션 */}
        <div className="loading-animation">
          <div className="loading-circle">
            <div className="loading-spinner"></div>
            <div className="loading-icon">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <div className="loading-text">
          <p>{loadingText}...</p>
        </div>

        {/* 로딩 프로그레스 바 */}
        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div
              className="loading-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="loading-progress-text">{Math.round(progress)}%</div>
        </div>

        {/* 팁 메시지 */}
        <div className="loading-tips">
          <div className="tip-icon">💡</div>
          <p>위치 권한을 허용하면 더 정확한 정보를 제공받을 수 있어요!</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;
