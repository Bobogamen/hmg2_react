import React, { useEffect, useState, useRef } from 'react';
import logo from '../../assets/images/app/logo.png';
import Profile from '../../assets/images/app/profile.png';
import { useTranslation } from 'react-i18next';
import AuthorizationButtons from './AuthorizationButtons';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/services/authService';
import { Bounce, toast } from 'react-toastify';
import { useUser } from '../../user/UserContext';
import { useLoading } from '../../loader/LoadingContext';
import { Dropdown, DropdownButton, DropdownDivider } from 'react-bootstrap';
import bg from '../../assets/images/lang/bg.png';
import eng from '../../assets/images/lang/eng.png';
import { FaBars } from 'react-icons/fa';

const Header = () => {
  const { user, setUser } = useUser();
  const { setIsLoading } = useLoading();
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
  const loginFormRef = useRef(null);
  const navigate = useNavigate();

  const { i18n } = useTranslation();
  const languageImage = i18n.language === 'bg' ? eng : bg;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('selectedLanguage', lng);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleClickOutside = (event) => {
    if (loginFormRef.current && !loginFormRef.current.contains(event.target)) {
      setShowLogin(false);
    }
  };

  const authButtonsHandler = () => {
    setShowAuthButtons(!showAuthButtons)
  }

  const loginFormHandler = () => {
    setShowLogin(!showLogin);
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
      console.log(data)
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

  return (
    <nav>
      <div>
        <a href="/">
          <img src={logo} alt="logo" className="logo" />
        </a>
        <button className="menu-icon-button" onClick={authButtonsHandler}>
          <FaBars />
        </button>
      </div>
      {user && (
        <>
          <div className={showAuthButtons ? '' : ''}>
            <AuthorizationButtons roles={user.roles} />
          </div>
          <div className="m-auto me-1">
            <DropdownButton className="profile-dropdown-button" variant="info"
              title={<img src={Profile} className="small-icon" alt="admin"></img>}>
              <Dropdown.Item href="/settings">{t('Settings')}</Dropdown.Item>
              <Dropdown.Item href="/profile">{t('Profile')}</Dropdown.Item>
              <DropdownDivider />
              <Dropdown.Item href="#">{t('Logout')}</Dropdown.Item>
            </DropdownButton>
          </div>
        </>
      )}
      {!user && (
        <>
          <div className="m-auto">
            <Link to="/register" className="text-decoration-none">
              <button className="authentication-button">{t('Register')}</button>
            </Link>
          </div>
          <div className="my-auto">
            <button className="authentication-button dropdown-toggle" onClick={loginFormHandler}>
              {t('Login')}
            </button>
            {showLogin && (
              <div className="login-form" ref={loginFormRef}>
                <div className="p-2">
                  <form onSubmit={handleLogin}>
                    <input id="email" type="text" placeholder="Email" name="email" className="my-3" value={email}
                      onChange={(e) => setEmail(e.target.value)} />
                    <input id="password" type="password" placeholder={t('Password')} name="password" value={password}
                      onChange={(e) => setPassword(e.target.value)} />
                    <div className="mt-3 d-flex justify-content-center align-items-center">
                      <input type="checkbox" name="remember-me" id="remember-me" className="w-auto mx-2" style={{ transform: 'scale(1.2)' }} />
                      <span className="fw-bold">{t('Remember me')}</span>
                      <button type="submit" className="authentication-button ms-4" style={{ transform: ' scale(1.15)' }}>
                        {t('Login')}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="mt-3 pb-3">
                  <a href="/forgot-password" className="btn btn-sm btn-secondary me-5" style={{ fontSize: '0.7rem' }}>
                    {t('Forgot password')}?
                  </a>
                  <img src={languageImage} alt={i18n.language} className="i18-img m-auto ms-1"
                    onClick={() => changeLanguage(i18n.language === 'bg' ? 'eng' : 'bg')} />
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