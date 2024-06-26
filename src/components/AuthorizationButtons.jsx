import React from "react";
import '../Navbar.css'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AuthorizationButtons = (priveleges) => {
      const { t } = useTranslation();

      return (
            <div id="main-buttons" className="justify-content-between m-auto">
                  <Link to="/admin"><button className="authorization-button">{t('Admin')}</button></Link>
                  <Link to="/management"><button className="authorization-button">{t('Management')}</button></Link>
                  <Link to="/finance"><button className="authorization-button">{t('Finance')}</button></Link>
                  <Link to="/repair"><button className="authorization-button">{t('Repairs')}</button></Link>
                  <Link to="/statistic"><button className="authorization-button">{t('Statistic')}</button></Link>
                  <Link to="/cashier"><button className="authorization-button">{t('Cashier')}</button></Link>
            </div>
      )
}

export default AuthorizationButtons