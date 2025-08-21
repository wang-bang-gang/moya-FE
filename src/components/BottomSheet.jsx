import { useRef, useState } from "react";
import "./BottomSheet.css";

export default function BottomSheet({ title, children, isLoading = false, error = null }) {
  const [expanded, setExpanded] = useState(false);
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const startH = useRef(0);
  const dragging = useRef(false);

  const COLLAPSED = 55; // vh
  const EXPANDED = 80;  // vh

  function onDown(e) {
    dragging.current = true;
    startY.current = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    startH.current = parseFloat(getComputedStyle(sheetRef.current).height);
  }

  function onMove(e) {
    if (!dragging.current) return;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const dy = startY.current - y; // 위로 드래그하면 +
    const newH = Math.max(200, Math.min(window.innerHeight * 0.95, startH.current + dy));
    sheetRef.current.style.height = `${newH}px`;
  }

  function onUp() {
    if (!dragging.current) return;
    dragging.current = false;
    const h = parseFloat(getComputedStyle(sheetRef.current).height);
    const vh = (h / window.innerHeight) * 100;
    setExpanded(Math.abs(vh - EXPANDED) < Math.abs(vh - COLLAPSED));
  }

  return (
    <div
      ref={sheetRef}
      className="sheet"
      style={{ height: expanded ? `${EXPANDED}vh` : `${COLLAPSED}vh` }}
    >
      <div className="sheetHeader">
        <div
          className="sheetHandle"
          onClick={() => setExpanded(v => !v)}
          onMouseDown={onDown} 
          onMouseMove={onMove} 
          onMouseUp={onUp}
          onTouchStart={onDown} 
          onTouchMove={onMove} 
          onTouchEnd={onUp}
          aria-label="Toggle sheet"
        />
        <div className="sheetHeadContent">
          {title}
          {isLoading && <span className="loadingSpinner">⟳</span>}
        </div>
      </div>

      <div className="sheetBody">
        {error ? (
          <div className="errorMessage">
            <i className="fa-solid fa-exclamation-triangle"></i>
            <p>데이터를 불러올 수 없습니다.</p>
            <small>{error}</small>
          </div>
        ) : isLoading ? (
          <div className="loadingMessage">
            <div className="loadingSpinner">⟳</div>
            <p>장소를 불러오는 중...</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}