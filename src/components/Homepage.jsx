import React from "react";
import '../Homepage.css'
import { useTranslation } from "react-i18next";

function Homepage() {
      const { t } = useTranslation();

      return (
            <>
                  <title className="title">{t('Home manager')}<span></span></title>
                  <div className="flex-container">
                        <aside className="left">LEFT</aside>
                        <main>MAIN</main>
                        <aside className="right">RIGHT</aside>
                  </div>
            </>
      );
}

export default Homepage