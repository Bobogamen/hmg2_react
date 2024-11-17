import React from "react";
import '../Navbar.css'
import Admin from '../assets/images/app/admin.png'
import Management from '../assets/images/app/management.png'
import Finanace from '../assets/images/app/finance.png'
import Funds from '../assets/images/app/fund.png'
import Repairs from '../assets/images/app/repair.png'
import Statistics from '../assets/images/app/stsatistic.png'
import Cashier from '../assets/images/app/cashier..png'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AuthorizationButtons = ({ roles }) => {
      const { t } = useTranslation();

      return (
            <div id="main-buttons" className="d-flex justify-content-between m-auto">
                  <Link to="/admin" className="text-decoration-none">
                        <button className="authorization-button d-flex align-items-center text-bg-primary bg-opacity-75">
                              <img src={Admin} className="icon authorization-button-icon" alt="admin"></img>
                              {t('Admin')}
                        </button></Link>
                  <Link to="/management" className="text-decoration-none">
                        <button className="authorization-button d-flex align-items-center text-bg-danger bg-opacity-50">
                              <img src={Management} className="icon authorization-button-icon" alt="management"></img>
                              {t('Management')}
                        </button></Link>
                  <Link to="/finance" className="text-decoration-none">
                        <button className="authorization-button d-flex align-items-center text-bg-warning bg-opacity-75">
                              <img src={Finanace} className="icon authorization-button-icon" alt="finance"></img>
                              {t('Finance')}
                        </button></Link>
                  <Link to="/fund" className="text-decoration-none">
                        <button className="authorization-button d-flex align-items-center text-bg-info bg-opacity-75">
                              <img src={Funds} className="icon authorization-button-icon" alt="fund"></img>
                              {t('Funds')}
                        </button>
                  </Link>
                  <Link to="/repair" className="text-decoration-none">
                        <button className="authorization-button d-flex align-items-center text-bg-success bg-opacity-75">
                              <img src={Repairs} className="icon authorization-button-icon" alt="repair"></img>
                              {t('Repairs')}
                        </button>
                  </Link>
                  <Link to="/statistic" className="text-decoration-none">
                        <button className="authorization-button d-flex align-items-center text-bg-secondary bg-opacity-75">
                              <img src={Statistics} className="icon authorization-button-icon" alt="statistic"></img>
                              {t('Statistic')}
                        </button>
                  </Link>
                  <Link to="/cashier" className="text-decoration-none">
                        <button className="authorization-button d-flex align-items-center text-bg-dark bg-opacity-50">
                              <img src={Cashier} className="icon authorization-button-icon" alt="cashier"></img>
                              {t('Cashier')}
                        </button>
                  </Link>
            </div>
      )
}

export default AuthorizationButtons