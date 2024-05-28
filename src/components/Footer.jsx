import React from "react";
import "../Footer.css"
import { useTranslation } from "react-i18next";

const Footer = () => {
      const { t } = useTranslation();
      const currentYear = new Date().getFullYear();
      
      return (
            <footer className="footer my-5">
                  <p className="text-muted mb-0 py-2">&#169;{currentYear} {`${t('Home manager')}. ${t('All rights reserved.')}`}</p>
            </footer>
      )
};

export default Footer;