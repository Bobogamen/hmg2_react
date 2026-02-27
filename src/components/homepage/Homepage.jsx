import React from "react";
import './Homepage.css';
import logo from '../../assets/images/app/logo.png';
import bills from '../../assets/images/app/home_page/bills.png';
import expenses from '../../assets/images/app/home_page/expenses.png';
import multiPlaces from '../../assets/images/app/home_page/multi-places.png';
import resident from '../../assets/images/app/home_page/resident.png';
import secure from '../../assets/images/app/home_page/secure.png';
import surveillance from '../../assets/images/app/home_page/stats.png';
import { useTranslation } from "react-i18next";
import HomepageCard from "./HomepageCard";

const Homepage = () => {
  // Use the 'homepage' namespace
  const { t } = useTranslation('homepage');

  return (
    <>
      <h1 className="title my-2">{t('homeManager')}<span></span></h1>

      <div className="main">
        <aside className="aside">
          <HomepageCard 
            image={expenses} 
            name={t('expenses')} 
            text={t('trackMonthlyExpenses')} 
          />
          <HomepageCard 
            image={resident} 
            name={t('residents')} 
            text={t('organizeResidentDetails')} 
          />
          <HomepageCard 
            image={multiPlaces} 
            name={t('multiPlaces')} 
            text={t('overseeDifferentPlaces')} 
          />
        </aside>

        <section className="middle">
          <img src={logo} className="img-fluid" alt="logo" />
        </section>

        <aside className="aside">
          <HomepageCard 
            image={bills} 
            name={t('bills')} 
            text={t('manageAllBills')} 
          />
          <HomepageCard 
            image={secure} 
            name={t('secure')} 
            text={t('keepDataSafe')} 
          />
          <HomepageCard 
            image={surveillance} 
            name={t('statistic')} 
            text={t('observeStatistic')} 
          />
        </aside>
      </div>
    </>
  );
};

export default Homepage;