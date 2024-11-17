import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import Register from './components/Register';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bgTranslation from '../src/locale/bg.json';
import enTranslation from '../src/locale/eng.json';
import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import Admin from './components/admin/Admin';
import Management from './components/management/Management';
import Finance from './components/finance/Finance';
import Repair from './components/repair/Repair';
import Statistic from './components/statistic/Statistic';
import Cashier from './components/cashier/Cashier';
import ForgotPassword from './components/ForgotPassword';
import Profile from './components/Profile';
import TitleChanger from './components/TitleChanger';
import HomesGroup from './components/management/HomesGroup';
import Home from './components/management/Home';
import './Notification.css';
import './Loader.css';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLoading } from './LoadingContext';
import { Bars } from 'react-loader-spinner';
import { useUser } from './UserContext';
import Fund from './components/fund/Fund';

const LANGUAGE_KEY = 'selectedLanguage';

i18n.use(initReactI18next).init({
  resources: {
    bg: { translation: bgTranslation },
    en: { translation: enTranslation }
  },
  lng: localStorage.getItem(LANGUAGE_KEY) || 'bg',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

const App = () => {
  const { isLoading } = useLoading();
  const { user } = useUser();

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  return (
    <div className="App">
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader">
            <Bars
              color="#3498db"
              height={80}
              width={80}
            />
          </div>
        </div>
      )}
      <Router>
        <TitleChanger />
        <ToastContainer position="top-left" autoClose={3000} theme="colored" hideProgressBar={true} rtl={false} transition={Slide} />
        <Header />
        <Routes>
          <Route path="" element={user ? <Management /> : <Homepage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/management" element={<Management />} />
          <Route path="/management/homesGroup/:id" element={<HomesGroup />} />
          <Route path="/management/homesGroup/:id/home/:id" element={<Home />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/fund" element={<Fund />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/statistic" element={<Statistic />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
};

export default App;