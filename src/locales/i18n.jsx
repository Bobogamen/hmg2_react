import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import bgCommon from "../locales/bg/common.json";
import bgAuth from "../locales/bg/auth.json";
import bgValidation from "../locales/bg/validation.json";
import bgHomepage from "../locales/bg/homepage.json"
import bgDashboard from "../locales/bg/dashboard.json"
import bgCondo from "../locales/bg/condominium.json"
import bgFinance from "../locales/bg/finance.json"
import bgHome from "../locales/bg/home.json"
import bgProfile from "../locales/bg/profile.json"
import bgResident from "../locales/bg/resident.json"
import bgForm from "../locales/bg/form.json"
import bgServer from "../locales/bg/server.json"
import bgFooter from "../locales/bg/footer.json"

import enCommon from "../locales/en/common.json";
import enAuth from "../locales/en/auth.json";
import enValidation from "../locales/en/validation.json";
import enHomepage from "../locales/en/homepage.json"
import enDashboard from "../locales/en/dashboard.json"
import enCondo from "../locales/en/condominium.json"
import enFinance from "../locales/en/finance.json"
import enHome from "../locales/en/home.json"
import enProfile from "../locales/en/profile.json"
import enResident from "../locales/en/resident.json"
import enForm from "../locales/en/form.json"
import enServer from "../locales/en/server.json"
import enFooter from "../locales/en/footer.json"

i18n
  .use(initReactI18next)
  .init({
    resources: {
      bg: {
        common: bgCommon,
        auth: bgAuth,
        validation: bgValidation,
        homepage: bgHomepage,
        dashboard: bgDashboard,
        condo: bgCondo,
        finance: bgFinance,
        home: bgHome,
        profile: bgProfile,
        resident: bgResident,
        form: bgForm,
        server: bgServer,
        footer: bgFooter,
      },
      en: {
        common: enCommon,
        auth: enAuth,
        validation: enValidation,
        homepage: enHomepage,
        dashboard: enDashboard,
        condo: enCondo,
        finance: enFinance,
        home: enHome,
        profile: enProfile,
        resident: enResident,
        form: enForm,
        server: enServer,
        footer: enFooter
      }
    },
    lng: "bg",
    fallbackLng: "en",
    ns: ["common", "auth", "validation"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;