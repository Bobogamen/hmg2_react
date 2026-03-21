import React, { useEffect, useState, useRef } from "react";
import bg from '../../assets/images/lang/bg.png';
import eng from '../../assets/images/lang/eng.png';
import logo from "../../assets/images/app/logo.png";
import Profile from "../../assets/images/app/profile.png";
import { useTranslation } from "react-i18next";
import AuthorizationButtons from "./AuthorizationButtons";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/services/authService";
import { useUser } from "../../user/UserContext";
import { useLoading } from "../../loader/LoadingContext";
import { Dropdown, DropdownButton, DropdownDivider } from "react-bootstrap";
import { FaBars } from "react-icons/fa";
import { Bounce, toast } from "react-toastify";

const Header = () => {
  const { t, i18n } = useTranslation(["auth", "common", "profile"]);
  const { user, saveUser, logout } = useUser();
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const languageImage = i18n.language === "bg" ? eng : bg;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("selectedLanguage", lng);
  };

  const handleClickOutside = (e) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target)
    ) {
      setShowAuthButtons(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const authButtonsHandler = () => {
    setShowAuthButtons((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setShowDropdown(false);
    setShowAuthButtons(false);

    try {
      const data = await login(email, password);

      saveUser(data.user, data.token, rememberMe);
      toast.success(t("auth:successfulLogin"), { transition: Bounce });
      navigate("/management");

    } catch (error) {

    } finally {
      setIsLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav>
      <div>
        <Link to="/">
          <img src={logo} alt="logo" className="logo" />
        </Link>
        {user && (
          <button
            className="menu-icon-button"
            onClick={authButtonsHandler}
            ref={buttonRef}
          >
            <FaBars />
          </button>
        )}
      </div>

      {user && (
        <>
          <div ref={menuRef}>
            <AuthorizationButtons
              roles={user.roles}
              show={showAuthButtons}
              close={() => setShowAuthButtons(false)}
            />
          </div>

          <DropdownButton
            className="profile-dropdown-button"
            variant="info"
            title={<img src={Profile} className="small-icon" alt="profile" />}
          >
            <Dropdown.Item as={Link} to="/profile">
              {t("profile:title")}
            </Dropdown.Item>

            <DropdownDivider />

            <Dropdown.Item
              active={i18n.language === "en"}
              onClick={() => changeLanguage("en")}
            >
              🇬🇧 English
            </Dropdown.Item>

            <Dropdown.Item
              active={i18n.language === "bg"}
              onClick={() => changeLanguage("bg")}
            >
              🇧🇬 Български
            </Dropdown.Item>

            <DropdownDivider />

            <Dropdown.Item onClick={handleLogout} className="text-danger">
              {t("auth:logout")}
            </Dropdown.Item>
          </DropdownButton>
        </>
      )}

      {!user && (
        <>
          <div className="m-auto">
            <Link to="/register" className="text-decoration-none">
              <button className="authentication-button">
                {t("auth:register")}
              </button>
            </Link>
          </div>

          <DropdownButton
            className="profile-dropdown-button"
            variant="info"
            title={t("auth:login")}
            show={showDropdown}
            onToggle={() => setShowDropdown(!showDropdown)}
          >
            <div className="login-form">
              <div className="p-2">
                <form onSubmit={handleLogin}>
                  <input
                    type="text"
                    placeholder="Email"
                    className="my-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder={t("profile:password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="mt-3 d-flex justify-content-center align-items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      className="w-auto mx-2"
                      style={{ transform: "scale(1.2)" }}
                      onChange={() => setRememberMe(!rememberMe)}
                    />

                    <span className="fw-bold">
                      {t("auth:rememberMe")}
                    </span>

                    <button
                      type="submit"
                      className="authentication-button ms-4"
                      style={{ transform: "scale(1.15)" }}
                    >
                      {t("auth:login")}
                    </button>
                  </div>
                </form>
              </div>
              <div className="d-flex justify-content-evenly mt-4">
                <Link
                  to="/forgot-password"
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: "0.7rem" }}
                >
                  {t("auth:forgotPassword")}?
                </Link>
                <img
                  src={languageImage}
                  alt={i18n.language}
                  className="i18-img"
                  onClick={() => changeLanguage(i18n.language === "bg" ? "en" : "bg")}
                />
              </div>
            </div>
          </DropdownButton>
        </>
      )}
    </nav>
  );
};

export default Header;