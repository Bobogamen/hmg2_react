import React from "react";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";
import bg from '../../assets/images/lang/bg.png';
import eng from '../../assets/images/lang/eng.png';

const Profile = () => {
      const { user } = useUser();

      const { i18n } = useTranslation();
      const languageImage = i18n.language === 'bg' ? eng : bg;

      const changeLanguage = (lng) => {
            i18n.changeLanguage(lng);
            localStorage.setItem('selectedLanguage', lng);
      };

      return (
            <>
                  <h2>Profile</h2>
                  <h4>{user ? user.name : 'Please, login first'}</h4>
                  <img src={languageImage} alt={i18n.language} className="i18-img"
                        onClick={() => changeLanguage(i18n.language === 'bg' ? 'eng' : 'bg')} />
            </>
      )
}

export default Profile;