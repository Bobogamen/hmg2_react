import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import bgCommon from "../locales/bg/common.json";
import bgAuth from "../locales/bg/auth.json";
import bgValidation from "../locales/bg/validation.json";
import bgHomepage from "../locales/bg/homepage.json"

import enCommon from "../locales/en/common.json";
import enAuth from "../locales/en/auth.json";
import enValidation from "../locales/en/validation.json";
import enHomepage from "../locales/en/homepage.json"

i18n
  .use(initReactI18next)
  .init({
    resources: {
      bg: {
        common: bgCommon,
        auth: bgAuth,
        validation: bgValidation,
        homepage: bgHomepage
      },
      en: {
        common: enCommon,
        auth: enAuth,
        validation: enValidation,
        homepage: enHomepage
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