import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import "./PlaceDetailPage.css";

// 더미 데이터 (locale별로 관리)
const PLACE_DATA = {
  ko: {
    place_1: {
      id: "place_1",
      name: "스누피 가든",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
      hours: "09:00 ~ 18:00",
      likes: 739,
      description: "스누피와 피너츠 캐릭터들이 있는 아름다운 정원입니다. 가족 방문과 사진 촬영에 완벽한 곳입니다...",
      fullScript: `스누피와 피너츠 캐릭터들이 있는 아름다운 정원입니다. 가족 방문과 사진 촬영에 완벽한 곳으로 멋진 테마 설치물들이 있습니다.

제주도 중심부에 위치한 이 매력적인 명소는 방문객들에게 자연과 사랑받는 만화 캐릭터들의 독특한 조화를 제공합니다. 정원은 일년 내내 피는 계절 꽃들로 세심하게 조경되어 있습니다.

방문객들은 다양한 포토존, 테마 카페, 기념품 상점을 즐길 수 있습니다. 정원은 벚꽃이 만개하는 봄에 특히 아름다워 마법 같은 분위기를 연출합니다.

모든 연령대에 적합한 이 명소는 번잡한 관광지에서 벗어난 평화로운 휴식처를 제공합니다. 이 장소에서만 판매하는 독점 스누피 상품을 위해 기념품점 방문을 잊지 마세요.`
    },
    place_2: {
      id: "place_2",
      name: "사려니숲길",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2342&q=80",
      hours: "24시간",
      likes: 739,
      description: "고대 나무들과 자연의 아름다움으로 둘러싸인 신비로운 숲길입니다. 하이킹과 자연 사진촬영에 완벽합니다...",
      fullScript: `고대 나무들과 자연의 아름다움으로 둘러싸인 신비로운 숲길입니다. 하이킹과 자연 사진촬영에 완벽한 숨막히는 경치를 자랑합니다.

이 매혹적인 숲길은 제주에서 가장 고요한 산책 경험 중 하나를 제공합니다. 길은 울창한 숲을 통과하며 햇빛이 나뭇잎 사이로 스며들어 마법 같은 분위기를 연출합니다.

모든 체력 수준에 적합한 이 트레일은 잘 관리된 길과 가끔 나타나는 휴식 공간들을 특징으로 합니다. 이 숲을 터전으로 하는 다양한 조류와 작은 동물들을 관찰할 기회가 풍부합니다.

계절마다 숲은 극적으로 변화합니다 - 무성한 녹색 여름부터 황금빛 가을 색깔, 그리고 평화로운 겨울 풍경까지. 이 길은 붐비는 관광지에서 벗어나 평온함을 찾는 사진작가들과 자연 애호가들에게 특히 인기가 높습니다.`
    },
    place_3: {
      id: "place_3",
      name: "함덕해수욕장",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
      hours: "24시간",
      likes: 512,
      description: "수정처럼 맑은 에메랄드 바다와 깨끗한 백사장이 있는 해변입니다. 수영과 수상스포츠로 인기가 높습니다...",
      fullScript: `수정처럼 맑은 에메랄드 바다와 깨끗한 백사장이 있는 해변입니다. 우수한 시설을 갖춘 수영과 수상스포츠로 인기가 높습니다.

함덕해수욕장은 제주에서 가장 사랑받는 해안 명소 중 하나로, 얕고 잔잔한 바다로 유명하여 어린이가 있는 가족들에게 완벽합니다. 해변은 부드러운 백사장과 놀랍도록 맑은 터키석 빛 바다를 자랑합니다.

이 지역은 샤워시설, 탈의실, 신선한 해산물을 제공하는 근처 식당들을 포함한 우수한 편의시설을 제공합니다. 여름철에는 다양한 수상 활동과 비치발리볼 코트로 해변이 활기를 띱니다.

해변 자체를 넘어서는 경치의 아름다움은 사진 촬영을 위한 멋진 배경을 제공하는 극적인 절벽과 암석 지형으로 확장됩니다. 함덕해수욕장에서 바라보는 일몰은 특히 장관이어서 커플들에게 로맨틱한 장소가 됩니다.`
    }
  },
  en: {
    place_1: {
      id: "place_1",
      name: "Snoopy Garden",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
      hours: "09:00 ~ 18:00",
      likes: 739,
      description: "A beautiful garden featuring Snoopy and Peanuts characters. Perfect for family visits and photography...",
      fullScript: `A beautiful garden featuring Snoopy and Peanuts characters. Perfect for family visits and photography with stunning themed installations.

Located in the heart of Jeju Island, this charming attraction offers visitors a unique blend of nature and beloved cartoon characters. The garden features meticulously landscaped areas with seasonal flowers that bloom throughout the year.

Visitors can enjoy various photo spots, themed cafes, and souvenir shops. The garden is especially beautiful during spring when cherry blossoms are in full bloom, creating a magical atmosphere.

The attraction is suitable for all ages and provides a peaceful escape from the bustling tourist areas. Don't forget to visit the gift shop for exclusive Snoopy merchandise available only at this location.`
    },
    place_2: {
      id: "place_2", 
      name: "Saryani Forest Road",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2342&q=80",
      hours: "24 hours",
      likes: 739,
      description: "A mystical forest road surrounded by ancient trees and natural beauty. Perfect for hiking and nature photography...",
      fullScript: `A mystical forest road surrounded by ancient trees and natural beauty. Perfect for hiking and nature photography with breathtaking scenery.

This enchanting forest path offers one of Jeju's most serene walking experiences. The road winds through dense woodland where sunlight filters through the canopy, creating a magical atmosphere.

The trail is suitable for all fitness levels and features well-maintained paths with occasional rest areas. Wildlife spotting opportunities are abundant, with various bird species and small animals calling this forest home.

During different seasons, the forest transforms dramatically - from lush green summers to golden autumn colors and peaceful winter landscapes. The road is particularly popular among photographers and nature enthusiasts seeking tranquility away from crowded tourist spots.`
    },
    place_3: {
      id: "place_3",
      name: "Hamdeok Beach", 
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
      hours: "24 hours",
      likes: 512,
      description: "A pristine white sand beach with crystal clear emerald waters. Popular for swimming and water sports...",
      fullScript: `A pristine white sand beach with crystal clear emerald waters. Popular for swimming and water sports with excellent facilities.

Hamdeok Beach is one of Jeju's most beloved coastal destinations, known for its shallow, calm waters that make it perfect for families with children. The beach features soft white sand and remarkably clear turquoise water.

The area offers excellent amenities including shower facilities, changing rooms, and nearby restaurants serving fresh seafood. During summer months, the beach comes alive with various water activities and beach volleyball courts.

The scenic beauty extends beyond the beach itself, with dramatic cliffs and rock formations providing stunning backdrops for photography. Sunset views from Hamdeok Beach are particularly spectacular, making it a romantic destination for couples.`
    }
  }
  // zh, ja도 추가 가능...
};

export default function PlaceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { locale, t } = useLanguage();
  const audioRef = useRef(null);
  
  // 현재 언어에 맞는 데이터 가져오기, 없으면 영어로 폴백
  const currentPlaceData = PLACE_DATA[locale] || PLACE_DATA['en'];
  const placeData = currentPlaceData[id] || currentPlaceData.place_1; // 기본값
  
  // 상태 관리
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3분 (더미)
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(placeData.likes);
  const [showFullScript, setShowFullScript] = useState(false);

  // 뒤로가기
  const handleGoBack = () => {
    // 현재 재생 중이면 정지
    if (audioRef.current) {
      audioRef.current.pause();
    }
    console.log("뒤로가기 버튼 클릭됨");
    
    try {
      navigate(-1); // 이전 페이지로 이동
    } catch (error) {
      console.error("뒤로가기 오류:", error);
      // 대안: 직접 MapPage로 이동
      navigate('/MapPage');
    }
  };

  // 오디오 재생/정지
  const handlePlayPause = async () => {
    try {
      if (!audioRef.current) {
        // 더미 오디오 생성
        const dummyAudioUrl = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";
        audioRef.current = new Audio(dummyAudioUrl);
        
        // 오디오 이벤트 설정
        audioRef.current.addEventListener('timeupdate', () => {
          setCurrentTime(audioRef.current.currentTime);
        });
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });
        
        audioRef.current.addEventListener('loadedmetadata', () => {
          setDuration(audioRef.current.duration);
        });
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("오디오 재생 오류:", error);
    }
  };

  // 프로그레스 바 클릭
  const handleProgressClick = (e) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const clickX = e.clientX - progressBar.getBoundingClientRect().left;
      const progressWidth = progressBar.offsetWidth;
      const newTime = (clickX / progressWidth) * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 좋아요 토글 (API 호출)
  const handleLikeToggle = async () => {
    try {
      const newLikedState = !isLiked;
      const action = newLikedState ? 'like' : 'unlike';
      
      // 즉시 UI 업데이트 (Optimistic Update)
      setIsLiked(newLikedState);
      setLikes(prev => newLikedState ? prev + 1 : prev - 1);
      
      // 실제 API 호출
      const response = await fetch(`/api/places/${placeData.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // 실제 구현시 토큰 추가
        },
        body: JSON.stringify({
          action: action, // 'like' 또는 'unlike'
          place_no: placeData.id.replace('place_', '') // place_1 → 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 서버에서 받은 실제 좋아요 수로 업데이트
      if (result.likes !== undefined) {
        setLikes(result.likes);
      }
      
      console.log(`${action} 성공:`, result);
      
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      
      // 에러 발생시 UI 롤백
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev + 1 : prev - 1);
      
      // 사용자에게 에러 알림
      alert('좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 시간 포맷팅
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // placeData가 변경될 때 상태 초기화
  useEffect(() => {
    setLikes(placeData.likes);
    setIsLiked(false);
    setShowFullScript(false);
  }, [placeData.likes, locale, id]);

  return (
    <div className="placeDetailPage">
      {/* 상단 이미지 섹션 */}
      <div 
        className="heroSection"
        style={{ backgroundImage: `url(${placeData.image})` }}
      >
        {/* 뒤로가기 버튼 */}
        <button 
          className="backButton" 
          onClick={handleGoBack}
          type="button"
          aria-label="Go back"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        {/* 장소명 */}
        <h1 className="placeName">{placeData.name}</h1>

        {/* 오디오 플레이어 */}
        <div className="audioPlayer">
          <button 
            className="playButton" 
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          
          <div className="progressContainer" onClick={handleProgressClick}>
            <div className="progressBar">
              <div 
                className="progressFill"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <span className="timeDisplay">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* 하단 정보 섹션 */}
      <div className="infoSection">
        {/* 제목과 좋아요 */}
        <div className="titleRow">
          <div className="titleInfo">
            <h2 className="infoTitle">{placeData.name}</h2>
            <div className="hours">
              <i className="fa-regular fa-clock"></i>
              <span>{placeData.hours}</span>
            </div>
          </div>
          
          <button 
            className={`likeButton ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            aria-label={isLiked ? "Unlike this place" : "Like this place"}
          >
            <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-thumbs-up`}></i>
            <span>{likes}</span>
          </button>
        </div>

        {/* 설명 텍스트 */}
        <div className="description">
          <p>
            {showFullScript ? placeData.fullScript : placeData.description}
            {!showFullScript && (
              <button 
                className="moreButton"
                onClick={() => setShowFullScript(true)}
                aria-label="Show more description"
              >
                {t('more')}
              </button>
            )}
          </p>
          
          {showFullScript && (
            <button 
              className="lessButton"
              onClick={() => setShowFullScript(false)}
              aria-label="Show less description"
            >
              {t('less')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}