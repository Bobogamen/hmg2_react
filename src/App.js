import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Homepage from "./components/homepage/Homepage";
import Register from "./components/homepage/Register";
import ForgotPassword from "./components/homepage/ForgotPassword";
import ResetPassword from "./components/homepage/ResetPassword";

import Admin from "./components/admin/Admin";
import Management from "./components/management/Management";
import HomesGroup from "./components/management/HomesGroup";
import Home from "./components/management/Home";

import Finance from "./components/finance/Finance";
import Fund from "./components/fund/Fund";
import Repair from "./components/repair/Repair";
import Statistic from "./components/statistic/Statistic";
import Cashier from "./components/cashier/Cashier";

import Profile from "./components/nav/Profile";
import ProfileEdit from "./components/nav/ProfileEdit";
import Header from "./components/nav/Header";
import Footer from "./components/footer/Footer";

import ProtectedRoute from "./components/ProtectedRoute";
import TitleChanger from "./components/TitleChanger";
import NotFoundPage from "./components/errorHandling/NotFoundPage";

import { Slide, ToastContainer } from "react-toastify";
import { useLoading } from "./loader/LoadingContext";
import { useUser } from "./user/UserContext";
import { Bars } from "react-loader-spinner";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import bgTranslation from "../src/locale/bg.json";
import enTranslation from "../src/locale/eng.json";

import "./style/App.css";
import "./style/Notification.css";
import "./loader/Loader.css";
import "react-toastify/dist/ReactToastify.css";

const LANGUAGE_KEY = "selectedLanguage";

/* =========================
   i18n Init
========================= */
i18n.use(initReactI18next).init({
  resources: {
    bg: { translation: bgTranslation },
    en: { translation: enTranslation },
  },
  lng: localStorage.getItem(LANGUAGE_KEY) || "bg",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

/* =========================
   Role Groups
========================= */
const ADMIN_ONLY = ["ADMIN"];
const ADMIN_MANAGER = ["ADMIN", "MANAGER"];
const ALL_AUTH = ["ADMIN", "MANAGER", "CASHIER"];

const App = () => {
  const { isLoading } = useLoading();
  const { user } = useUser();

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  const getHomePage = () => {
    if (!user) return <Homepage />;

    if (user.roles.length === 1 && user.roles.includes("CASHIER")) {
      return <Cashier />;
    }

    return <Management />;
  };

  return (
    <div className="App">
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader">
            <Bars color="#3498db" height={80} width={80} />
          </div>
        </div>
      )}

      <Router>
        <TitleChanger />

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="colored"
          hideProgressBar
          transition={Slide}
        />

        <Header />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={getHomePage()} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ONLY}>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Management */}
          <Route
            path="/management"
            element={
              <ProtectedRoute allowedRoles={ADMIN_MANAGER}>
                <Management />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/homesGroup/:id"
            element={
              <ProtectedRoute allowedRoles={ADMIN_MANAGER}>
                <HomesGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/homesGroup/:id/home/:id"
            element={
              <ProtectedRoute allowedRoles={ADMIN_MANAGER}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Financial / Operational */}
          {[
            { path: "/finance", component: <Finance /> },
            { path: "/fund", component: <Fund /> },
            { path: "/repair", component: <Repair /> },
            { path: "/statistic", component: <Statistic /> },
            { path: "/cashier", component: <Cashier /> },
            { path: "/profile", component: <Profile /> },
            { path: "/profile/edit", component: <ProfileEdit /> },
          ].map(({ path, component }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRoles={ALL_AUTH}>
                  {component}
                </ProtectedRoute>
              }
            />
          ))}

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>

      <Footer />
    </div>
  );
};

export default App;