import "./PlaceCard.css";

export default function PlaceCard({ 
  title, 
  distanceLabel, 
  likes, 
  imageUrl, 
  onClick, 
  onPreviewClick, 
  isPlaying
}) {
  
  const handlePreviewClick = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (onPreviewClick) {
      onPreviewClick();
    }
  };

  return (
    <div className="placeCard" onClick={onClick}>
      <div className="placeThumb">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="thumbPlaceholder">MOYA</div>
        )}
      </div>

      <div className="placeInfo">
        <div className="placeTitle" title={title}>{title}</div>
        <div className="placeMeta">
          <span className="placeDistance">
            <i className="fa-solid fa-location-dot"></i> {distanceLabel}
          </span>
        </div>
        <div className="placeMeta secondary">
          <span>
            <i className="fa-solid fa-thumbs-up"></i> {likes ?? 0}
          </span>
        </div>
      </div>

      <div 
        className={`placePreview ${isPlaying ? 'playing' : ''}`}
        onClick={handlePreviewClick}
      >
        <span>30sec</span>
        <span className="previewPlay">
          {isPlaying ? '◾' : '▶'}
        </span>
      </div>
    </div>
  );
}