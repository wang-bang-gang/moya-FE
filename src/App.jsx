import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css'
import Onboarding1 from './assets/pages/Onboarding1';
import Onboarding2 from './assets/pages/Onboarding2';
import LanguageSelect from './assets/pages/LanguageSelect';
import MapPage from './assets/pages/MapPage';
import PlaceDetailPage from './assets/pages/PlaceDetailPage';

import './styles/fonts.css' 

function App() {
    function setScreenSize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  useEffect(() => {
    setScreenSize();
    window.addEventListener("resize", setScreenSize);
    return () => window.removeEventListener("resize", setScreenSize);
  });

  return (
    <LanguageProvider>
      <LoadScript 
        googleMapsApiKey={"AIzaSyD59dMKSMMJA-ZFqDzl6wXuY3qDz9vOu_w"}
        preventGoogleFontsLoading={true}
      >
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Onboarding1 />} />
              <Route path="/Onboarding2" element={<Onboarding2 />} />
              <Route path="/LanguageSelect" element={<LanguageSelect />}/>
              <Route path="/MapPage" element={<MapPage />}/>
              <Route path="/place/:id" element={<PlaceDetailPage />}/>
            </Routes>
          </div>
        </Router>
      </LoadScript>
    </LanguageProvider>
  )
}

export default App