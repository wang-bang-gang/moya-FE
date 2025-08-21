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
    
    // PlaceDetailPage - 기존
    'less': '접기',
    'more': '더보기',
    
    // PlaceDetailPage - 새로 추가된 키들
    'no_info': '정보 없음',
    'no_description': '설명이 없습니다.',
    'unknown_place': '알 수 없는 장소',
    'loading_place_info': '장소 정보를 불러오는 중...',
    'failed_to_load_place': '장소 정보를 불러올 수 없습니다.',
    'no_place_info': '장소 정보가 없습니다.',
    'go_back': '돌아가기',
    'audio_error': '오디오를 재생할 수 없습니다.',
    'no_audio': '오디오 파일이 없습니다.',
    'audio_permission': '오디오 재생을 위해 브라우저 권한을 허용해주세요.',
    'audio_format_error': '오디오 형식을 지원하지 않습니다.',
    'audio_play_error': '오디오 재생 중 오류가 발생했습니다.',
    'like_error': '좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
    
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
    
    // PlaceDetailPage - 기존
    'less': 'Show less',
    'more': 'Show more',
    
    // PlaceDetailPage - 새로 추가된 키들
    'no_info': 'No information',
    'no_description': 'No description available.',
    'unknown_place': 'Unknown Place',
    'loading_place_info': 'Loading place information...',
    'failed_to_load_place': 'Failed to load place information.',
    'no_place_info': 'No place information available.',
    'go_back': 'Go back',
    'audio_error': 'Cannot play audio.',
    'no_audio': 'No audio file available.',
    'audio_permission': 'Please allow browser permission to play audio.',
    'audio_format_error': 'Audio format not supported.',
    'audio_play_error': 'An error occurred while playing audio.',
    'like_error': 'An error occurred while processing like. Please try again.',
    
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
  
  cn: {
    // MapPage
    'listen_feel_explore': '与MOYA一起聆听、感受、探索',
    'around_you_now': '您身边的地方',
    'loading_places': '正在加载地点...',
    'failed_to_load': '加载失败：',
    
    // PlaceDetailPage - 기존
    'less': '收起',
    'more': '更多',
    
    // PlaceDetailPage - 새로 추가된 키들
    'no_info': '无信息',
    'no_description': '无描述信息。',
    'unknown_place': '未知地点',
    'loading_place_info': '正在加载地点信息...',
    'failed_to_load_place': '无法加载地点信息。',
    'no_place_info': '没有地点信息。',
    'go_back': '返回',
    'audio_error': '无法播放音频。',
    'no_audio': '没有音频文件。',
    'audio_permission': '请允许浏览器权限以播放音频。',
    'audio_format_error': '不支持音频格式。',
    'audio_play_error': '播放音频时发生错误。',
    'like_error': '处理点赞时发生错误。请重试。',
    
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
  
  jp: {
    // MapPage
    'listen_feel_explore': 'MOYAと一緒に聞いて、感じて、探索する',
    'around_you_now': 'あなたの周りの場所',
    'loading_places': '場所を読み込んでいます...',
    'failed_to_load': '読み込み失敗：',
    
    // PlaceDetailPage - 기존
    'less': '閉じる',
    'more': 'もっと見る',
    
    // PlaceDetailPage - 새로 추가된 키들
    'no_info': '情報なし',
    'no_description': '説明がありません。',
    'unknown_place': '不明な場所',
    'loading_place_info': '場所情報を読み込んでいます...',
    'failed_to_load_place': '場所情報を読み込めませんでした。',
    'no_place_info': '場所情報がありません。',
    'go_back': '戻る',
    'audio_error': 'オーディオを再生できません。',
    'no_audio': 'オーディオファイルがありません。',
    'audio_permission': 'オーディオ再生のためのブラウザ権限を許可してください。',
    'audio_format_error': 'オーディオ形式がサポートされていません。',
    'audio_play_error': 'オーディオ再生中にエラーが発生しました。',
    'like_error': 'いいね処理中にエラーが発生しました。もう一度お試しください。',
    
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