import React, { useEffect, useState, useRef } from 'react';
import logo from '../assets/images/app/logo.png';
import Profile from '../assets/images/app/profile.png';
import { useTranslation } from 'react-i18next';
import AuthorizationButtons from './AuthorizationButtons';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/services/authService';
import { Bounce, toast } from 'react-toastify';
import { useUser } from '../UserContext';
import { useLoading } from '../LoadingContext';

const Header = () => {
  const { user, setUser } = useUser();
  const { setIsLoading } = useLoading();
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthorizationButtons, setShowAuthorizationButtons] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
  const menuRef = useRef(null);
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(email, password);
      setShowLogin(false);
      setUser(data)
      navigate('/management');
      toast.success(t('Successful Login'), { transition: Bounce });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error(t('Wrong email/password'), { transition: Bounce });
        }
      } else {
        toast.error(t('Server not responding'), { transition: Bounce });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const profileHnadler = () => {
    
  }

  return (
    <nav>
      <div className="d-flex">
        <a href="/">
          <img src={logo} alt="logo" className="logo" />
        </a>
      </div>
      {user && (
        <>
          {window.innerWidth > 1089 ? (
            <AuthorizationButtons />
          ) : (
            <div ref={menuRef} className="menu m-auto">
              <button className="profile-button dropdown-toggle" onClick={authorizationButtonsHandler}>
                {t('Select')}
              </button>
              {showAuthorizationButtons && <AuthorizationButtons roles={user.roles} />}
            </div>
          )}

          <div id="profile" className="m-auto me-0">
            <button className="profile-button dropdown-toggle" onClick={profileHnadler}>
              <img src={Profile} className="icon authorization-button-icon" alt="admin"></img>
              {t('Profile')}
              <button className="authentication-button">{t('Logout')}</button>
            </button>
          </div>
        </>
      )}
      {!user && (
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
                  <form onSubmit={handleLogin}>
                    <input id="email" type="text" placeholder="Email" name="email" className="my-3" value={email}
                      onChange={(e) => setEmail(e.target.value)} />
                    <input id="password" type="password" placeholder={t('Password')} name="password" value={password}
                      onChange={(e) => setPassword(e.target.value)} />
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
