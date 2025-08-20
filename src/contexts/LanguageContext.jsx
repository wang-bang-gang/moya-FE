import { createContext, useContext, useState, useEffect } from 'react';

// 언어 컨텍스트 생성
const LanguageContext = createContext();

// 언어별 번역 데이터
const translations = {
  ko: {
    // MapPage
    'listen_feel_explore': 'listen, feel and explore with',
    'around_you_now': '지금 당신 주변',
    'loading_places': '장소를 불러오는 중...',
    'failed_to_load': '로드 실패:',
    
    // PlaceDetailPage
    'less': '접기',
    'more': '더보기',
    
    // 공통
    'my_location': '내 위치',
    'likes': '좋아요',
    'hours': '운영시간',
    'sec': '초',
    'minute': '분',
    
    // 장소명들 (실제로는 API에서 받아올 데이터)
    'Snoopy Garden': '스누피 가든',
    'Saryani Forest Road': '사려니숲길',
    'Hamdeok Beach': '함덕해수욕장'
  },
  
  en: {
    // MapPage
    'listen_feel_explore': 'listen, feel and explore with',
    'around_you_now': 'Around you now',
    'loading_places': 'Loading places...',
    'failed_to_load': 'Failed:',
    
    // PlaceDetailPage
    'less': 'less',
    'more': 'more',
    
    // 공통
    'my_location': 'My location',
    'likes': 'likes',
    'hours': 'hours',
    'sec': 'sec',
    'minute': 'minute',
    
    // 장소명들
    'Snoopy Garden': 'Snoopy Garden',
    'Saryani Forest Road': 'Saryani Forest Road',
    'Hamdeok Beach': 'Hamdeok Beach'
  },
  
  zh: {
    // MapPage
    'listen_feel_explore': '与MOYA一起聆听、感受和探索',
    'around_you_now': '您身边的地方',
    'loading_places': '正在加载地点...',
    'failed_to_load': '加载失败：',
    
    // PlaceDetailPage
    'less': '收起',
    'more': '更多',
    
    // 공통
    'my_location': '我的位置',
    'likes': '点赞',
    'hours': '营业时间',
    'sec': '秒',
    'minute': '分钟',
    
    // 장소명들
    'Snoopy Garden': '史努比花园',
    'Saryani Forest Road': '思连伊林荫道',
    'Hamdeok Beach': '咸德海水浴场'
  },
  
  ja: {
    // MapPage
    'listen_feel_explore': 'MOYAと一緒に聞いて、感じて、探索する',
    'around_you_now': 'あなたの周りの場所',
    'loading_places': '場所を読み込んでいます...',
    'failed_to_load': '読み込み失敗：',
    
    // PlaceDetailPage
    'less': '閉じる',
    'more': 'もっと見る',
    
    // 공통
    'my_location': '現在地',
    'likes': 'いいね',
    'hours': '営業時間',
    'sec': '秒',
    'minute': '分',
    
    // 장소명들
    'Snoopy Garden': 'スヌーピーガーデン',
    'Saryani Forest Road': 'サリョニの森の道',
    'Hamdeok Beach': 'ハムドクビーチ'
  }
};

// 언어 컨텍스트 프로바이더
export function LanguageProvider({ children }) {
  // localStorage에서 저장된 언어 불러오기, 기본값은 한국어
  const [locale, setLocale] = useState(() => {
    try {
      return localStorage.getItem('app_locale') || 'ko';
    } catch {
      return 'ko';
    }
  });

  // 언어 변경 함수
  const changeLanguage = (newLocale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem('app_locale', newLocale);
    } catch (error) {
      console.warn('언어 설정 저장 실패:', error);
    }
  };

  // 번역 함수
  const t = (key, fallback = key) => {
    return translations[locale]?.[key] || translations['en']?.[key] || fallback;
  };

  // 언어 정보 객체
  const languageInfo = {
    ko: { name: '한국어', flag: 'Korea_flag.png' },
    en: { name: 'ENGLISH', flag: 'USA_flag.png' },
    zh: { name: '简体中文', flag: 'China_flag.png' },
    ja: { name: '日本語', flag: 'Japan_flag.png' }
  };

  const value = {
    locale,
    changeLanguage,
    t,
    languageInfo,
    currentLanguage: languageInfo[locale]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// 언어 컨텍스트 사용 훅
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}