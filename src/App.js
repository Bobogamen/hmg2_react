import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import Register from './components/Register';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'
import bgTranslation from '../src/locale/bg.json'
import enTranslation from '../src/locale/eng.json'
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
import Notification from './components/Notification';
import Profile from './components/Profile';
import TitleChanger from './components/TitleChanger';
import HomesGroup from './components/management/HomesGroup';
import Home from './components/management/Home';

const LANGUAGE_KEY = 'selectedLanguage'

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
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(true)
  }, [authenticated])

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY)
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage)
    }

  }, [])

  return (
    <div className="App">
      <Router>
        <TitleChanger />
        <Header authenticated={authenticated} role={'Admin'} />
        <Notification />
        <Routes>
          <Route path="" element={authenticated ? <Management /> : <Homepage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/management" element={<Management />} />
          <Route path="/management/homesGroup/:id" element={<HomesGroup />} />
          <Route path="/management/homesGroup/:id/home/:id" element={<Home />} />
          <Route path="/finance" element={<Finance />} />
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
}

export default App;
