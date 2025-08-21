import './LanguageSelect.css';
import Korea_flag from '../images/Korea_flag.png';
import USA_flag from '../images/USA_flag.png';
import China_flag from '../images/China_flag.png';
import Japan_flag from '../images/Japan_flag.png';
import ProgressBar from "../../components/Progressbar.jsx";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

function LanguageSelect(){
  const navigate = useNavigate();
  const { changeLanguage } = useLanguage();

  // 언어 선택 및 페이지 이동 (단순화)
  const handleLanguageSelect = (locale) => {
    changeLanguage(locale);
    console.log(`언어 변경됨: ${locale}`);
    navigate("/MapPage"); // 바로 이동
  };

  return (
    <div className="languageSelect">
      <ProgressBar/>
      <h1 className='moya-logo'>M<span className='O-of-MOYA'>O</span>YA</h1>
      <p className='describe'>Memory Of Your Voice</p>
      
      <div className='selection-box'>
        <button onClick={() => handleLanguageSelect('ko')}>
          <img src={Korea_flag} alt="한국어"/>
          <p>한국어</p>
        </button>
        <button onClick={() => handleLanguageSelect('en')}>
          <img src={USA_flag} alt="English"/>
          <p>ENGLISH</p>
        </button>
        <button onClick={() => handleLanguageSelect('cn')}>
          <img src={China_flag} alt="简体中文"/>
          <p>简体中文</p>
        </button>
        <button onClick={() => handleLanguageSelect('jp')}>
          <img src={Japan_flag} alt="日本語"/>
          <p>日本語</p>
        </button>
      </div>
      <p className='copyright'>© MOYA.All rights reserved.</p>
    </div>
  )
}

export default LanguageSelect;