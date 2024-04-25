import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import Register from './components/Register';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'
import bgTranslation from '../src/locale/bg.json'
import enTranslation from '../src/locale/eng.json'
import './App.css';
import logo from '../src/assets/images/app/logo.png';
import bills from '../src/assets/images/app/home_page/bills.png';
import expenses from '../src/assets/images/app/home_page/expenses.png';
import multiPlaces from '../src/assets/images/app/home_page/multi-places.png';
import resident from '../src/assets/images/app/home_page/resident.png';
import secure from '../src/assets/images/app/home_page/secure.png';
import surveillance from '../src/assets/images/app/home_page/surveillance.png';
import Footer from './components/Footer';
import Header from './components/Header';
import Admin from './components/Admin';
import Manager from './components/Manager';
import Finance from './components/Finance';
import Repair from './components/Repair';
import Statistic from './components/Statistic';
import Cashier from './components/Cashier';
import ForgotPassword from './components/ForgotPassword';
import Notification from './components/Notification';
import Profile from './components/Profile';

const LANGUAGE_KEY = 'selectedLanguage'

i18n.
  use(initReactI18next).
  init({
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

function App() {
  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY)
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage)
    }

  }, [])


  return (
    <div className="App">
      <Router>
        <Header />
        <Notification />
        <Routes>
          <Route path="" element={<Homepage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/statistic" element={<Statistic />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
