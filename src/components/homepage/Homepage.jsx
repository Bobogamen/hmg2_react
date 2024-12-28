import React from "react";
import './Homepage.css'
import logo from '../../assets/images/app/logo.png'
import bills from '../../assets/images/app/home_page/bills.png'
import expenses from '../../assets/images/app/home_page/expenses.png'
import multiPlaces from '../../assets/images/app/home_page/multi-places.png'
import resident from '../../assets/images/app/home_page/resident.png'
import secure from '../../assets/images/app/home_page/secure.png'
import surveillance from '../../assets/images/app/home_page/stats.png'
import { useTranslation } from "react-i18next";
import HomepageCard from "./HomepageCard";

const Homepage = () => {
      const { t } = useTranslation();

      return (
            <>
                  <h1 className="title my-2">{t('Home manager')}<span></span></h1>
                  <div className="main">
                        <aside className="aside">
                              <HomepageCard image={expenses} name={t('Expenses')} text={t('Track your monthly expenses.')} />
                              <HomepageCard image={resident} name={t('Residents')} text={t('Organize resident details.')} />
                              <HomepageCard image={multiPlaces} name={t('Multi-places')} text={t('Oversee different places.')} />
                        </aside>
                        <section className="middle">
                              <img src={logo} className="img-fluid" alt="logo" />
                        </section>
                        <aside className="aside">
                              <HomepageCard image={bills} name={t('Bills')} text={t('Manage all your bills.')} />
                              <HomepageCard image={secure} name={t('Secure')} text={t('Keep your data safe.')} />
                              <HomepageCard image={surveillance} name={t('Statistic')} text={t('Observe your statistic.')} />
                        </aside>
                  </div>
            </>
      );
}

export default Homepage