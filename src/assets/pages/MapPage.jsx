import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { useLanguage } from "../../contexts/LanguageContext";
import BottomSheet from "../../components/BottomSheet.jsx"
import PlaceCard from "../../components/PlaceCard.jsx";
import "./MapPage.css";

// 기본 중심 (제주)
const DEFAULT_CENTER = { lat: 33.4996, lng: 126.5312 };

// 구글맵 옵션
const mapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
  ],
};

// 거리 계산 (Haversine) - 더미 데이터용 백업
function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(km) {
  if (km == null) return "";
  return `${km.toFixed(1)}km`; // 백엔드에서 km로 주므로 그대로 km로 표시
}

// 마지막 위치 캐시 로드
function loadSavedPos() {
  try {
    const raw = localStorage.getItem("MY_POS");
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.lat === "number" && typeof p?.lng === "number") return p;
  } catch (error) {
    console.warn("Failed to load saved position:", error);
  }
  return null;
}

// 실제 백엔드 API 호출 함수
async function fetchNearbyPlaces(lat, lng, locale = 'ko') {
  // 위치 정보가 없으면 더미 데이터 반환
  if (!lat || !lng) {
    console.warn('위치 정보가 없어서 더미 데이터를 사용합니다.');
    return await fetchPlacesDummy(lat, lng, locale);
  }

  try {
    // 실제 백엔드 API 호출
    const API_BASE_URL = import.meta.env.VITE_SPRING_API_URL;
    const queryParams = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      locale: locale
    });

    console.log('백엔드 API 호출:', `${API_BASE_URL}/api/places/nearby?${queryParams}`);

    const response = await fetch(`${API_BASE_URL}/api/places/nearby?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log('백엔드 응답 데이터:', data);

    // 응답이 배열인지 확인
    if (!Array.isArray(data)) {
      throw new Error('백엔드 응답이 배열이 아닙니다');
    }

    const transformedData = data.map((p) => ({
      // 백엔드 응답 필드 매핑
      place_no: p.id,
      lat: p.lat,
      lng: p.lng,
      like: p.likeCount,
      business_hours: "정보 없음", // 백엔드에서 제공하지 않는 경우
      image: p.imageUrl || "", // null일 수 있으므로 기본값 설정
      place_name: p.name,
      place_description: p.description,
      audio_preview_key: p.audioPreviewKey, // null 가능
      audio_full_key: p.audioPreviewKey, // 전체 버전이 따로 있다면 수정
      audio_duration: 180, // 기본값, 실제로는 백엔드에서 제공해야 함
      published: p.published, // 백엔드 필드 추가
      commentCount: p.commentCount, // 백엔드 필드 추가
      
      // 프론트엔드에서 사용하는 형식
      id: `place_${p.id}`,
      nameEn: p.name,
      likes: p.likeCount,
      thumb: p.imageUrl || "", // null일 수 있으므로 기본값 설정
      distanceM: p.distance, // 백엔드에서 km로 주므로 그대로 사용
    }));

    console.log('변환된 데이터:', transformedData);

    // 백엔드에서 이미 거리순으로 정렬해서 보내주므로 추가 정렬 불필요
    return transformedData;

  } catch (error) {
    console.error('백엔드 API 호출 실패:', error);
    console.log('더미 데이터로 대체합니다.');
    
    // 백엔드 실패시 더미 데이터로 대체 (개발 중 안정성)
    return await fetchPlacesDummy(lat, lng, locale);
  }
}

// 더미 API (백업용 - locale 활용)
async function fetchPlacesDummy(lat, lng, locale = 'ko') {
  const me = lat && lng ? { lat, lng } : null;
  
  // locale에 따른 장소 정보
  const getLocalizedPlaceData = (baseName) => {
    const placeData = {
      ko: {
        "Snoopy Garden": { 
          name: "스누피 가든", 
          desc: "스누피와 피너츠 캐릭터들이 있는 아름다운 정원입니다. 가족들과 함께 즐길 수 있는 테마파크입니다." 
        },
        "Saryani Forest Road": { 
          name: "사려니숲길", 
          desc: "고대 나무들로 둘러싸인 신비로운 숲길입니다. 자연의 소리와 함께 힐링할 수 있는 곳입니다." 
        },
        "Hamdeok Beach": { 
          name: "함덕해수욕장", 
          desc: "맑고 투명한 바다와 하얀 모래가 있는 깨끗한 해변입니다. 제주도의 대표적인 관광지 중 하나입니다." 
        }
      },
      en: {
        "Snoopy Garden": { 
          name: "Snoopy Garden", 
          desc: "A beautiful garden featuring Snoopy and Peanuts characters. A theme park perfect for families to enjoy together." 
        },
        "Saryani Forest Road": { 
          name: "Saryani Forest Road", 
          desc: "A mystical forest road surrounded by ancient trees. A perfect place to heal with the sounds of nature." 
        },
        "Hamdeok Beach": { 
          name: "Hamdeok Beach", 
          desc: "A pristine white sand beach with crystal clear waters. One of Jeju Island's representative tourist destinations." 
        }
      },
      zh: {
        "Snoopy Garden": { 
          name: "史努比花园", 
          desc: "拥有史努比和花生漫画角色的美丽花园。适合全家一起享受的主题公园。" 
        },
        "Saryani Forest Road": { 
          name: "思连伊林荫道", 
          desc: "被古树环绕的神秘森林小径。可以与大自然的声音一起治愈心灵的地方。" 
        },
        "Hamdeok Beach": { 
          name: "咸德海水浴场", 
          desc: "拥有清澈海水和白色沙滩的原始海滩。济州岛代表性的旅游景点之一。" 
        }
      },
      ja: {
        "Snoopy Garden": { 
          name: "スヌーピーガーデン", 
          desc: "スヌーピーとピーナッツのキャラクターがいる美しい庭園。家族一緒に楽しめるテーマパークです。" 
        },
        "Saryani Forest Road": { 
          name: "サリョニの森の道", 
          desc: "古い木々に囲まれた神秘的な森の道。自然の音と共に癒される場所です。" 
        },
        "Hamdeok Beach": { 
          name: "ハムドクビーチ", 
          desc: "透明な海と白い砂浜がある美しいビーチ。済州島の代表的な観光地の一つです。" 
        }
      }
    };
    
    return placeData[locale]?.[baseName] || placeData['en'][baseName];
  };

  // 더미 데이터 (locale에 따라 이름과 설명 변경)
  const DUMMY_API_RESPONSE = [
    {
      place_no: 1,
      lat: 33.5047,
      lng: 126.7207,
      like: 739,
      business_hours: "09:00-18:00",
      image: "",
      place_name: getLocalizedPlaceData("Snoopy Garden").name,
      place_description: getLocalizedPlaceData("Snoopy Garden").desc,
      audio_preview_key: "audio/snoopy_preview.mp3",
      audio_full_key: "audio/snoopy_full.mp3",
      audio_duration: 180
    },
    {
      place_no: 2,
      lat: 33.4152,
      lng: 126.7147,
      like: 739,
      business_hours: "24시간",
      image: "",
      place_name: getLocalizedPlaceData("Saryani Forest Road").name,
      place_description: getLocalizedPlaceData("Saryani Forest Road").desc,
      audio_preview_key: "audio/saryani_preview.mp3",
      audio_full_key: "audio/saryani_full.mp3",
      audio_duration: 210
    },
    {
      place_no: 3,
      lat: 33.5437,
      lng: 126.6720,
      like: 512,
      business_hours: "24시간",
      image: "",
      place_name: getLocalizedPlaceData("Hamdeok Beach").name,
      place_description: getLocalizedPlaceData("Hamdeok Beach").desc,
      audio_preview_key: "audio/hamdeok_preview.mp3",
      audio_full_key: "audio/hamdeok_full.mp3",
      audio_duration: 195
    }
  ];

  const withDistance = DUMMY_API_RESPONSE.map((p) => ({
    ...p,
    id: `place_${p.place_no}`,
    nameEn: p.place_name, // 이제 locale에 따른 번역된 이름
    likes: p.like,
    thumb: p.image,
    distanceM: me ? (distanceMeters(me, { lat: p.lat, lng: p.lng }) / 1000) : null, // m를 km로 변환
  }));
  
  withDistance.sort((a, b) => (a.distanceM ?? 1e12) - (b.distanceM ?? 1e12));
  await new Promise((r) => setTimeout(r, 250));
  return withDistance;
}

export default function MapPage() {
  const mapRef = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const { locale, t } = useLanguage(); // 언어 컨텍스트 사용

  // 초기 중심/내 위치
  const initialSaved = loadSavedPos();
  const [initialCenter] = useState(initialSaved || DEFAULT_CENTER);
  const [userLocation, setUserLocation] = useState(initialSaved || null);

  // 구글 준비 여부
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [markersReady, setMarkersReady] = useState(false); // 마커 렌더링 준비 상태

  // 리스트 상태
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 오디오 재생 상태
  const [playingPlaceId, setPlayingPlaceId] = useState(null);

  // 내 위치 아이콘: 주황 원 + 흰 테두리 (벡터 심볼)
  const myIcon = useMemo(() => {
    if (!isGoogleReady || !window.google?.maps?.SymbolPath) {
      return null;
    }
    
    try {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: "#FF8A00",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2.5,
        scale: 10,
      };
    } catch (error) {
      console.warn("Google Maps SymbolPath 로드 실패:", error);
      return null;
    }
  }, [isGoogleReady]);

  // 내 위치 가져오기 - 거리 기반 업데이트
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    
    let lastSavedPosition = null; // 마지막으로 저장된 위치
    
    // 거리 계산 함수 (km 단위)
    const calculateDistance = (pos1, pos2) => {
      if (!pos1 || !pos2) return 0;
      return distanceMeters(pos1, pos2) / 1000; // km로 변환
    };
    
    // 위치 업데이트 처리 함수
    const handlePositionUpdate = (position) => {
      const newPos = { 
        lat: position.coords.latitude, 
        lng: position.coords.longitude 
      };
      
      // 첫 번째 위치이거나, 100m 이상 이동했을 때만 업데이트
      if (!lastSavedPosition) {
        // 첫 번째 위치
        console.log('첫 번째 위치 설정:', newPos);
        setUserLocation(newPos);
        lastSavedPosition = newPos;
        
        try { 
          localStorage.setItem("MY_POS", JSON.stringify(newPos)); 
        } catch (error) {
          console.warn("Failed to save position:", error);
        }
      } else {
        // 거리 계산
        const distance = calculateDistance(lastSavedPosition, newPos);
        console.log(`위치 변화 감지: ${distance.toFixed(3)}km`);
        
        if (distance >= 0.1) { // 100m 이상 이동
          console.log('100m 이상 이동 - 위치 업데이트:', newPos);
          setUserLocation(newPos);
          lastSavedPosition = newPos;
          
          try { 
            localStorage.setItem("MY_POS", JSON.stringify(newPos)); 
          } catch (error) {
            console.warn("Failed to save position:", error);
          }
        } else {
          console.log('100m 미만 이동 - 위치 업데이트 스킵');
        }
      }
    };
    
    // 초기 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      (error) => {
        console.error('위치 정보를 가져올 수 없습니다:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 }
    );
    
    // 위치 변화 감시 (거리 기반 필터링 적용)
    const watchId = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => {
        console.warn('위치 감시 오류:', error);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 30_000 // 30초간 캐시 사용
      }
    );
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // API 호출 (locale 변경 시에도 다시 호출)
  useEffect(() => {
    let stop = false;
    
    async function run() {
      setLoading(true); 
      setError("");
      
      try {
        const lat = userLocation?.lat;
        const lng = userLocation?.lng;
        const list = await fetchNearbyPlaces(lat, lng, locale); // 백엔드 API 호출
        if (!stop) setPlaces(list);
      } catch (e) {
        if (!stop) setError(String(e));
      } finally {
        if (!stop) setLoading(false);
      }
    }
    
    run();
    return () => { stop = true; };
  }, [userLocation, locale]); // locale도 의존성에 추가

  // 내 위치로 이동
  const onClickUserCurrentLocation = () => {
    console.log("내 위치 버튼 클릭됨");
    
    if (!mapRef.current || !isGoogleReady) {
      alert("지도가 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (userLocation) {
      console.log("기존 위치로 이동:", userLocation);
      
      mapRef.current.panTo(userLocation);
      const currentZoom = mapRef.current.getZoom() || 0;
      console.log("현재 줌 레벨:", currentZoom);
      
      if (currentZoom < 15) {
        mapRef.current.setZoom(15);
      }
    } else {
      alert("위치 정보가 없습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // 마커 클릭시 해당 카드로 포커스
  const onMarkerClick = (place) => {
    console.log("마커 클릭됨:", place.nameEn);
    
    // 지도를 해당 위치로 이동
    if (mapRef.current) {
      const position = { lat: place.lat, lng: place.lng };
      mapRef.current.panTo(position);
      mapRef.current.setZoom(16);
    }

    // 0.3초 후에 해당 카드로 스크롤
    setTimeout(() => {
      // PlaceCard 클래스를 가진 모든 요소 찾기
      const placeCards = document.querySelectorAll('.placeCard');
      let targetCard = null;
      
      for (let card of placeCards) {
        // 카드 안에서 제목 텍스트 확인 (명소명으로만 필터링)
        const titleElement = card.querySelector('.placeTitle');
        if (titleElement && titleElement.textContent.trim() === place.nameEn.trim()) {
          targetCard = card;
          break;
        }
      }
      
      if (targetCard) {
        console.log("카드 찾음, 스크롤 실행");
        
        // 기존 하이라이트 제거
        const previousHighlighted = document.querySelector('.card-highlighted');
        if (previousHighlighted) {
          previousHighlighted.classList.remove('card-highlighted');
        }
        
        // 부드럽게 스크롤
        targetCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
        
        // card-highlighted 클래스 추가
        targetCard.classList.add('card-highlighted');
        
        // 2초 후 하이라이트 클래스 제거
        setTimeout(() => {
          targetCard.classList.remove('card-highlighted');
        }, 2000);
        
      } else {
        console.log("해당 카드를 찾을 수 없음:", place.nameEn);
      }
    }, 300);
  };

  // 오디오 미리듣기 함수 (실제 API 사용)
  // 오디오 미리듣기 함수 (CDN 링크 직접 사용)
const handleAudioPreview = async (place) => {
  try {
    // 현재 재생 중인 오디오가 있으면 정지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // 같은 플레이스를 다시 클릭하면 정지
    if (playingPlaceId === place.id) {
      setPlayingPlaceId(null);
      return;
    }

    console.log("오디오 미리듣기 요청:", place.nameEn);

    // CDN URL이 있는지 확인
    if (!place.audio_preview_key) {
      throw new Error("오디오 파일이 없습니다.");
    }

    // CDN URL 직접 사용
    const audioUrl = place.audio_preview_key;
    console.log("오디오 URL:", audioUrl);
    
    // 새로운 Audio 객체 생성
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // 즉시 재생 상태로 설정
    setPlayingPlaceId(place.id);

    // 오디오 이벤트 리스너 설정
    audio.addEventListener('loadeddata', () => {
      console.log("오디오 재생 시작");
    });

    audio.addEventListener('ended', () => {
      setPlayingPlaceId(null);
      console.log("오디오 재생 완료");
    });

    audio.addEventListener('error', (e) => {
      setPlayingPlaceId(null);
      console.error("오디오 재생 오류:", e);
      alert("오디오 재생 중 오류가 발생했습니다.");
    });

    // 30초 후 자동 정지 (또는 실제 preview 길이 사용)
    const previewDuration = 30000; // place.audio_duration * 1000 / 6 등으로 계산 가능
    const autoStopTimer = setTimeout(() => {
      if (audio && !audio.paused) {
        audio.pause();
        setPlayingPlaceId(null);
        console.log("30초 미리듣기 완료");
      }
    }, previewDuration);

    // 재생 시작
    await audio.play();

    // audio 객체에 타이머 참조 저장 (정리용)
    audio.autoStopTimer = autoStopTimer;

  } catch (error) {
    setPlayingPlaceId(null);
    console.error("오디오 미리듣기 오류:", error);
    alert("오디오를 불러올 수 없습니다. 다시 시도해주세요.");
  }
};
  // Google Maps API가 이미 로드되어 있는지 확인
  const isGoogleMapsLoaded = () => {
    return window.google && window.google.maps && window.google.maps.Map;
  };

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    // Google Maps API 로드 대기
    const checkGoogleMaps = () => {
      if (isGoogleMapsLoaded()) {
        console.log("Google Maps API 준비됨");
        setTimeout(() => {
          setIsGoogleReady(true);
        }, 100);
      } else {
        console.log("Google Maps API 대기 중...");
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    checkGoogleMaps();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="mapWrapper">
        <GoogleMap
          onLoad={(map) => { 
            console.log("구글맵 로드 완료");
            mapRef.current = map; 
            setIsGoogleReady(true);
            // 지도 로드 후 잠시 기다렸다가 마커 렌더링 허용
            setTimeout(() => {
              setMarkersReady(true);
              console.log("마커 렌더링 준비 완료");
            }, 500);
          }}
          mapContainerClassName="mapContainer"
          center={userLocation || initialCenter}
          zoom={userLocation ? 14 : 12}
          options={mapOptions}
        >
          {/* Google Maps와 마커가 모두 준비된 후에만 마커 렌더링 */}
          {isGoogleReady && markersReady && (
            <>
              {/* 내 위치(커스텀 심볼) */}
              {userLocation && myIcon && (
                <MarkerF
                  position={userLocation}
                  title="My Location"
                  icon={myIcon}
                  zIndex={9999}
                />
              )}

              {/* 명소 마커 - 클릭 이벤트 추가 */}
              {places.map((p) => (
                <MarkerF
                  key={p.id}
                  position={{ lat: p.lat, lng: p.lng }}
                  title={p.nameEn}
                  onClick={() => onMarkerClick(p)}
                />
              ))}
            </>
          )}
        </GoogleMap>

        <button 
          className="locateBtn"
          onClick={onClickUserCurrentLocation}
        >
          <i className="fa-solid fa-location-arrow"></i>
        </button>
        <button 
          className="languageBtn"
          onClick={() => navigate("/LanguageSelect")}
        >
          <i className="fa-solid fa-globe"></i>
        </button>
      </div>

      <BottomSheet
        title={
          <>
            <div className="sheetSub">{t('listen_feel_explore')} <b>MOYA</b></div>
            <div className="sheetTitle">{t('around_you_now')}</div>
          </>
        }
      >
        {loading && <div className="listState">{t('loading_places')}</div>}
        {error && <div className="listState error">{t('failed_to_load')} {error}</div>}

        {!loading && !error && places.map((p) => (
          <PlaceCard
            key={p.id}
            title={p.nameEn} // 이미 locale에 맞는 번역된 이름이 들어있음
            distanceLabel={formatDistance(p.distanceM)}
            likes={p.likes}
            imageUrl={p.thumb}
            onClick={() => {


              console.log("상세페이지 이동:", p.nameEn);
              // place 데이터를 state로 함께 전달
              navigate(`/place/${p.id}`, { 
                state: { 
                  placeData: p,
                  fromMap: true 
                } 
              });
            }}
            onPreviewClick={() => handleAudioPreview(p)}
            isPlaying={playingPlaceId === p.id}
          />
        ))}
      </BottomSheet>
    </>
  );
}