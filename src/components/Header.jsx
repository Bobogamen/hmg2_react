import React, { useEffect, useState } from 'react';
import '../Navbar.css'
import { Link } from 'react-router-dom';
import logo from '../assets/images/app/logo.png';

function Header() {
  const [authenticated, setAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setAuthenticated(true);
  }, []);

  const loginFormHandler = () => {
    setShowLogin(!showLogin)
  }

  const profileHandler = () => {
    setShowProfile(!showProfile)
  }


  return (
    <nav className="nav-bar">
      <div>
        <a href="/">
          <img src={logo} alt="logo" className="logo" />
        </a>
      </div>
      {authenticated ? (
        <>
          <div className="menu">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="justify-content-between m-auto">
            <Link to="/admin"><button className="authorization-button">Admin</button></Link>
            <Link to="/manager"><button className="authorization-button">Manager</button></Link>
            <Link to="/finance"><button className="authorization-button">Finance</button></Link>
            <Link to="/repair"><button className="authorization-button">Repair</button></Link>
            <Link to="/statistic"><button className="authorization-button">Statistic</button></Link>
            <Link to="/cashier"><button className="authorization-button">Cashier</button></Link>
          </div>
          <div className="m-auto me-0">
            <button className="profile-button dropdown-toggle" onClick={profileHandler}>Profile</button>
            {showProfile && (
              <div className="profile-menu">
                  <div className="fs-6 my-1 p-1">Change name</div>
                  <div className="fs-6 mb-1 p-1">Change password</div>
                  <div className="fs-6 mb-1 p-1">Info</div>
              </div>
            )}
            <button className="authentication-button">Logout</button>
          </div>
        </>
      ) : (
        <>
          <div className="m-auto">
            <a href="/register">
              <button className="authentication-button">Register</button>
            </a>
          </div>
          <div className="my-auto">
            <button className="authentication-button dropdown-toggle" onClick={loginFormHandler}>Login</button>
            {showLogin && (
              <div className="login-form">
                <div className="p-2">
                  <form>
                    <input type="text" placeholder="email" name="username" id="username" className="my-3" />
                    <input type="password" placeholder="password" name="password" id="password" className="" />
                    <div className="mt-3">
                      <input type="checkbox" name="remember-me" id="remember-me" className="w-auto mx-2" style={{ transform: 'scale(1.2)' }} />
                      <span>Remember me</span>
                      <button type="submit" className="authentication-button">Login</button>
                    </div>
                  </form>
                </div>
                <div className="mt-1 pb-3">
                  <a href="/forgot-password" className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.7rem' }}>Forgot password?</a>
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