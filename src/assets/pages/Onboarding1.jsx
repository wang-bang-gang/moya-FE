import './Onboarding1.css';
import ProgressBar from "../../components/Progressbar.jsx";
import { useNavigate } from "react-router-dom";

function Onboarding1(){
    const navigate = useNavigate();
    
    return (
        <div className='onboarding-page'>
            <ProgressBar step={1} />
            <h1>M<span className='O-of-MOYA'>O</span>YA</h1>
            <div className="card">
            <p className='slogan'>No guidebook,</p>
            <p className='slogan'>No group.</p>
            <p className='describe'>
                Just you, and the voice of this place.
            </p>
            </div>
            <div className="button-wrapper">
                <button className="next-btn" onClick={() => navigate("/onboarding2")}>→</button>
            </div>
        </div>
    )
}

export default Onboarding1;