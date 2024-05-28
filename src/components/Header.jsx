import React, { useEffect, useState, useRef } from 'react';
import logo from '../assets/images/app/logo.png';
import bg from '../assets/images/lang/bg.png';
import eng from '../assets/images/lang/eng.png';
import { useTranslation } from 'react-i18next';
import AuthorizationButtons from './AuthorizationButtons';
import { Link } from 'react-router-dom';

const Header = ({ authenticated, role }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthorizationButtons, setShowAuthorizationButtons] = useState(false);
  const { t, i18n } = useTranslation();
  const languageImage = i18n.language === 'bg' ? eng : bg;
  const menuRef = useRef(null);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };

  }, []);

  const handleClickOutside = (event) => {
    if ((menuRef.current && !menuRef.current.contains(event.target)) || event.target.className === 'authorization-button') {
      setShowAuthorizationButtons(false);
    }
  };

  const loginFormHandler = () => {
    setShowLogin(!showLogin);
  };

  const authorizationButtonsHandler = () => {
    setShowAuthorizationButtons(!showAuthorizationButtons);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('selectedLanguage', lng);
  };

  return (
    <nav>
      <div className="d-flex">
        <a href="/">
          <img src={logo} alt="logo" className="logo" />
        </a>
        <img
          src={languageImage}
          alt={i18n.language}
          className="i18-img m-auto ms-1"
          onClick={() => changeLanguage(i18n.language === 'bg' ? 'eng' : 'bg')}
        />
      </div>
      {authenticated && (
        <>
          {window.innerWidth > 1089 ? (
            <AuthorizationButtons privileges={'Admin'} />
          ) : (
            <div ref={menuRef} className="menu m-auto">
              <button className="profile-button dropdown-toggle" onClick={authorizationButtonsHandler}>
                {t('Select')}
              </button>
              {showAuthorizationButtons && <AuthorizationButtons privileges={'Admin'} />}
            </div>
          )}

          <div id="profile" className="m-auto me-0">
            <Link to="/profile"><button className="profile-button">{t('Profile')}</button></Link>
            <button className="authentication-button">{t('Logout')}</button>
          </div>
        </>
      )}
      {!authenticated && (
        <>
          <div className="m-auto">
            <a href="/register">
              <button className="authentication-button">{t('Register')}</button>
            </a>
          </div>
          <div className="my-auto">
            <button className="authentication-button dropdown-toggle" onClick={loginFormHandler}>
              {t('Login')}
            </button>
            {showLogin && (
              <div className="login-form">
                <div className="p-2">
                  <form>
                    <input type="text" placeholder="email" name="email" id="email" className="my-3" />
                    <input type="password" placeholder={t('password')} name="password" id="password" className="" />
                    <div className="mt-3">
                      <input type="checkbox" name="remember-me" id="remember-me" className="w-auto mx-2" style={{ transform: 'scale(1.2)' }} />
                      <span>{t('Remember me')}</span>
                      <button type="submit" className="authentication-button">
                        {t('Login')}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="mt-1 pb-3">
                  <a href="/forgot-password" className="btn btn-sm btn-secondary" style={{ fontSize: '0.7rem' }}>
                    {t('Forgot password')}?
                  </a>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

export default Header;