import React from "react";
import { useTranslation } from "react-i18next";
import bg from '../assets/images/lang/bg.png';
import eng from '../assets/images/lang/eng.png';

const Profile = () => {
      const { i18n } = useTranslation();
      const languageImage = i18n.language === 'bg' ? eng : bg;

      const changeLanguage = (lng) => {
            i18n.changeLanguage(lng);
            localStorage.setItem('selectedLanguage', lng);
      };

      return (
            <>
                  <h2>Profile</h2>
                  <img src={languageImage} alt={i18n.language} className="i18-img m-auto ms-1"
                        onClick={() => changeLanguage(i18n.language === 'bg' ? 'eng' : 'bg')}
                  />
            </>
      )
}

export default Profile;