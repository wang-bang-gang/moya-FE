import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import "./PlaceDetailPage.css";

export default function PlaceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation(); // state 데이터 받기 위해 추가
  const { locale, t } = useLanguage(); // t 함수도 가져오기
  const audioRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_SPRING_API_URL;
  
  // API 상태 관리
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 오디오 및 UI 상태 관리
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showFullScript, setShowFullScript] = useState(false);

  
  // 다국어 텍스트 반환 함수
  const getLocalizedText = (key, fallback = "") => {
    return t(key) || fallback;
  };

  // MapPage에서 전달받은 데이터가 있는지 확인
  useEffect(() => {
    const passedPlaceData = location.state?.placeData;
    
    if (passedPlaceData && location.state?.fromMap) {
      console.log('MapPage에서 전달받은 데이터 사용:', passedPlaceData);
      
      // MapPage 데이터를 PlaceDetailPage 형식으로 변환
      const transformedData = {
        id: passedPlaceData.id,
        name: passedPlaceData.nameEn || passedPlaceData.place_name,
        image: passedPlaceData.thumb || passedPlaceData.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
        hours: passedPlaceData.business_hours || getLocalizedText('no_info', '정보 없음'),
        likes: passedPlaceData.likes || passedPlaceData.like || 0,
        description: passedPlaceData.place_description || getLocalizedText('no_description', '설명이 없습니다.'),
        audioFullUrl: passedPlaceData.audio_full_key || passedPlaceData.audio_preview_key,
        audioDuration: passedPlaceData.audio_duration || 180
      };
      
      setPlaceData(transformedData);
      setLikes(transformedData.likes);
      setLoading(false);
      
      // 필요하다면 추가 상세 정보만 별도로 호출
      const placeNo = passedPlaceData.place_no || (passedPlaceData.id ? passedPlaceData.id.replace('place_', '') : null);
      if (placeNo) {
        fetchAdditionalDetailData(placeNo);
      }
      
    } else {
      // 전달받은 데이터가 없으면 기존 API 호출 방식 사용
      fetchPlaceDetail();
    }
  }, [id, locale, location.state]);

  // 추가 상세 정보만 가져오는 함수 (선택적)
  const fetchAdditionalDetailData = async (placeNo) => {
    try {
      console.log('추가 상세 정보 요청:', placeNo);
      
      const response = await fetch(
        `${API_BASE_URL}/api/places/${placeNo}/detail?locale=${locale}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const detailData = await response.json();
        console.log('추가 상세 정보:', detailData);
        
        // 기존 데이터에 상세 정보 추가/업데이트
        setPlaceData(prev => ({
          ...prev,
          hours: detailData.businessHours || prev.hours,
          description: detailData.description || prev.description,
          audioFullUrl: detailData.audioFullUrl || prev.audioFullUrl,
          audioDuration: detailData.audioDuration || prev.audioDuration
        }));
      }
    } catch (error) {
      console.warn('추가 상세 정보 로드 실패:', error);
      // 에러가 발생해도 기존 데이터로 계속 진행
    }
  };

  // API 호출 함수 (직접 접근시에만 사용)
  const fetchPlaceDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const placeNo = id.startsWith('place_') ? id.replace('place_', '') : id;
      console.log('API로 장소 정보 요청:', placeNo);
      
      // 1. nearby API에서 기본 정보 가져오기 (locale 포함)
      let nearbyPlaceData = null;
      try {
        const nearbyResponse = await fetch(
          `${API_BASE_URL}/api/places/nearby?lat=33.4996&lng=126.5312&locale=${locale}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (nearbyResponse.ok) {
          const nearbyData = await nearbyResponse.json();
          console.log('nearby API 응답:', nearbyData);
          
          // 해당 place_no와 일치하는 데이터 찾기
          nearbyPlaceData = nearbyData.find(place => place.id === parseInt(placeNo));
          console.log('매칭된 nearby 데이터:', nearbyPlaceData);
        }
      } catch (nearbyError) {
        console.warn('nearby API 호출 실패:', nearbyError);
      }

      // 2. detail API에서 상세 정보 가져오기 (locale 포함)
      let detailData = null;
      try {
        const detailResponse = await fetch(
          `${API_BASE_URL}/api/places/${placeNo}/detail?locale=${locale}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (detailResponse.ok) {
          detailData = await detailResponse.json();
          console.log('detail API 응답:', detailData);
        }
      } catch (detailError) {
        console.warn('detail API 호출 실패:', detailError);
      }

      // 3. 데이터 조합
      if (nearbyPlaceData || detailData) {
        const combinedData = {
          id: id,
          name: nearbyPlaceData?.name || detailData?.name || getLocalizedText('unknown_place', 'Unknown Place'),
          image: nearbyPlaceData?.imageUrl || detailData?.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: detailData?.businessHours || getLocalizedText('no_info', '정보 없음'),
          likes: nearbyPlaceData?.likeCount || detailData?.likeCount || 0,
          description: nearbyPlaceData?.description || detailData?.description || getLocalizedText('no_description', '설명이 없습니다.'),
          audioFullUrl: detailData?.audioFullUrl || nearbyPlaceData?.audioPreviewKey,
          audioDuration: detailData?.audioDuration || 180
        };

        console.log('조합된 최종 데이터:', combinedData);
        setPlaceData(combinedData);
        setLikes(combinedData.likes);
      } else {
        throw new Error('API에서 데이터를 가져올 수 없습니다.');
      }
      
    } catch (error) {
      console.error('장소 정보 로드 실패:', error);
      console.log('더미 데이터로 대체합니다.');
      
      const dummyData = getDummyPlaceData(id, locale);
      setPlaceData(dummyData);
      setLikes(dummyData.likes);
    } finally {
      setLoading(false);
    }
  };

  // 더미 데이터 생성 함수 (API 실패시 폴백용) - 다국어 지원
  const getDummyPlaceData = (placeId, currentLocale) => {
    const dummyData = {
      ko: {
        place_1: {
          id: "place_1",
          name: "스누피 가든",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: "09:00 ~ 18:00",
          likes: 739,
          description: "스누피와 피너츠 캐릭터들이 있는 아름다운 정원입니다. 가족 방문과 사진 촬영에 완벽한 곳입니다. 제주도 중심부에 위치한 이 매력적인 명소는 방문객들에게 자연과 사랑받는 만화 캐릭터들의 독특한 조화를 제공합니다.",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 180
        },
        place_2: {
          id: "place_2",
          name: "사려니숲길",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2342&q=80",
          hours: "24시간",
          likes: 739,
          description: "고대 나무들과 자연의 아름다움으로 둘러싸인 신비로운 숲길입니다. 하이킹과 자연 사진촬영에 완벽한 숨막히는 경치를 자랑합니다.",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 210
        },
        place_3: {
          id: "place_3",
          name: "함덕해수욕장",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: "24시간",
          likes: 512,
          description: "수정처럼 맑은 에메랄드 바다와 깨끗한 백사장이 있는 해변입니다. 수영과 수상스포츠로 인기가 높습니다.",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 195
        }
      },
      en: {
        place_1: {
          id: "place_1",
          name: "Snoopy Garden",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: "09:00 AM ~ 06:00 PM",
          likes: 739,
          description: "A beautiful garden featuring Snoopy and Peanuts characters. Perfect for family visits and photography with stunning themed installations.",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 180
        },
        place_2: {
          id: "place_2", 
          name: "Saryani Forest Road",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2342&q=80",
          hours: "24 hours",
          likes: 739,
          description: "A mystical forest road surrounded by ancient trees and natural beauty. Perfect for hiking and nature photography with breathtaking scenery.",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 210
        },
        place_3: {
          id: "place_3",
          name: "Hamdeok Beach", 
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: "24 hours",
          likes: 512,
          description: "A pristine white sand beach with crystal clear emerald waters. Popular for swimming and water sports with excellent facilities.",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 195
        }
      },
      zh: {
        place_1: {
          id: "place_1",
          name: "史努比花园",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: "上午09:00 ~ 下午06:00",
          likes: 739,
          description: "拥有史努比和花生漫画角色的美丽花园。适合全家一起享受的主题公园。",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 180
        },
        place_2: {
          id: "place_2",
          name: "思连伊林荫道",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2342&q=80",
          hours: "24小时",
          likes: 739,
          description: "被古树环绕的神秘森林小径。可以与大自然的声音一起治愈心灵的地方。",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 210
        },
        place_3: {
          id: "place_3",
          name: "咸德海水浴场",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: "24小时",
          likes: 512,
          description: "拥有清澈海水和白色沙滩的原始海滩。济州岛代表性的旅游景点之一。",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 195
        }
      },
      ja: {
        place_1: {
          id: "place_1",
          name: "スヌーピーガーデン",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: "午前09:00 ~ 午後06:00",
          likes: 739,
          description: "スヌーピーとピーナッツのキャラクターがいる美しい庭園。家族一緒に楽しめるテーマパークです。",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 180
        },
        place_2: {
          id: "place_2",
          name: "サリョニの森の道",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2342&q=80",
          hours: "24時間",
          likes: 739,
          description: "古い木々に囲まれた神秘的な森の道。自然の音と共に癒される場所です。",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 210
        },
        place_3: {
          id: "place_3",
          name: "ハムドクビーチ",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2340&q=80",
          hours: "24時間",
          likes: 512,
          description: "透明な海と白い砂浜がある美しいビーチ。済州島の代表的な観光地の一つです。",
          audioFullUrl: "https://d3al414gz151lh.cloudfront.net/ko_samsung.mp3",
          audioDuration: 195
        }
      }
    };
    
    const localeData = dummyData[currentLocale] || dummyData['en'];
    return localeData[placeId] || localeData.place_1;
  };

  // 뒤로가기
  const handleGoBack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    console.log("뒤로가기 버튼 클릭됨");
    
    try {
      navigate(-1);
    } catch (error) {
      console.error("뒤로가기 오류:", error);
      navigate('/MapPage');
    }
  };

  // 오디오 재생/정지
  const handlePlayPause = async () => {
    try {
      if (!audioRef.current && placeData?.audioFullUrl) {
        console.log("오디오 객체 생성 시작");
        
        // 실제 오디오 URL 사용
        audioRef.current = new Audio(placeData.audioFullUrl);
        
        // 오디오 이벤트 리스너들
        audioRef.current.addEventListener('timeupdate', () => {
          setCurrentTime(audioRef.current.currentTime);
        });
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });
        
        audioRef.current.addEventListener('loadedmetadata', () => {
          console.log('메타데이터 로드됨, 총 시간:', audioRef.current.duration);
          if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          } else {
            // 메타데이터에서 duration을 가져올 수 없으면 API에서 받은 값 사용
            setDuration(placeData.audioDuration);
          }
        });

        audioRef.current.addEventListener('error', (e) => {
          console.error('오디오 에러:', e);
          alert(getLocalizedText('audio_error', '오디오를 재생할 수 없습니다.'));
          setIsPlaying(false);
        });

        console.log('오디오 로드 시작:', placeData.audioFullUrl);
        audioRef.current.load();
      }

      if (!placeData?.audioFullUrl) {
        alert(getLocalizedText('no_audio', '오디오 파일이 없습니다.'));
        return;
      }

      if (isPlaying) {
        console.log('오디오 일시정지');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('오디오 재생 시도');
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log('오디오 재생 성공');
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("오디오 재생 오류:", error);
      
      if (error.name === 'NotAllowedError') {
        alert(getLocalizedText('audio_permission', '오디오 재생을 위해 브라우저 권한을 허용해주세요.'));
      } else if (error.name === 'NotSupportedError') {
        alert(getLocalizedText('audio_format_error', '오디오 형식을 지원하지 않습니다.'));
      } else {
        alert(getLocalizedText('audio_play_error', '오디오 재생 중 오류가 발생했습니다.'));
      }
      
      setIsPlaying(false);
    }
  };

  // 프로그레스 바 클릭
  const handleProgressClick = (e) => {
    if (audioRef.current && duration > 0) {
      const progressBar = e.currentTarget;
      const clickX = e.clientX - progressBar.getBoundingClientRect().left;
      const progressWidth = progressBar.offsetWidth;
      const newTime = (clickX / progressWidth) * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 좋아요 토글 (API 호출)
  const handleLikeToggle = () => {
  // 좋아요 상태만 토글
  setIsLiked(!isLiked);
  
  // 좋아요 수 증감 (로컬 상태만)
  setLikes(prev => isLiked ? prev - 1 : prev + 1);
  
  console.log(`좋아요 ${isLiked ? '취소' : '추가'}됨`);
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

  // 로딩 상태
  if (loading) {
    return (
      <div className="placeDetailPage">
        <div className="loadingState">
          <div className="loadingSpinner">⟳</div>
          <p>{getLocalizedText('loading_place_info', '장소 정보를 불러오는 중...')}</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && !placeData) {
    return (
      <div className="placeDetailPage">
        <div className="errorState">
          <i className="fa-solid fa-exclamation-triangle"></i>
          <p>{getLocalizedText('failed_to_load_place', '장소 정보를 불러올 수 없습니다.')}</p>
          <button onClick={() => navigate('/MapPage')}>
            {getLocalizedText('go_back', '돌아가기')}
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!placeData) {
    return (
      <div className="placeDetailPage">
        <div className="errorState">
          <p>{getLocalizedText('no_place_info', '장소 정보가 없습니다.')}</p>
          <button onClick={() => navigate('/MapPage')}>
            {getLocalizedText('go_back', '돌아가기')}
          </button>
        </div>
      </div>
    );
  }

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

        {/* 오디오 플레이어 - 오디오가 있을 때만 표시 */}
        {placeData.audioFullUrl && (
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
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <span className="timeDisplay">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        )}
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
            {showFullScript ? placeData.description : 
              (placeData.description.length > 100 ? 
              placeData.description.substring(0, 100) + '...' : 
              placeData.description)
            }
            {placeData.description.length > 100 && !showFullScript && (
              <button 
                className="moreButton"
                onClick={() => setShowFullScript(true)}
                aria-label="Show more description"
              >
                {getLocalizedText('show_more', '더보기')}
              </button>
            )}
          </p>
          
          {showFullScript && placeData.description.length > 100 && (
            <button 
              className="lessButton"
              onClick={() => setShowFullScript(false)}
              aria-label="Show less description"
            >
              {getLocalizedText('show_less', '접기')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}