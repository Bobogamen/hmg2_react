import React from "react";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";
import bg from '../../assets/images/lang/bg.png';
import eng from '../../assets/images/lang/eng.png';

const Profile = () => {
      const { user } = useUser();

      const { t, i18n } = useTranslation();
      const languageImage = i18n.language === 'bg' ? eng : bg;

      const changeLanguage = (lng) => {
            i18n.changeLanguage(lng);
            localStorage.setItem('selectedLanguage', lng);
      };

      return (
            <>
                  <h2>{t('Profile')}</h2>
                  <div>
                        <h4>{!user ? 'Please, login first' : null}</h4>
                        <img src={languageImage} alt={i18n.language} className="i18-img"
                              onClick={() => changeLanguage(i18n.language === 'bg' ? 'eng' : 'bg')} />
                  </div>
                  <div className="border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-3 mx-1 mt-3">
                        <div className="d-flex justify-content-center align-items-center flex-wrap">
                              <table className="table table-sm table-striped table-bordered table-hover">
                                    <thead>
                                          <tr>
                                                <th>{t('Name')}</th>
                                                <th>Email</th>
                                                <th>{t('Roles')}</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          <tr>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.roles.join(', ')}</td>
                                          </tr>
                                    </tbody>
                              </table>

                              <h2>{t('Condominiums')}</h2>
                              <table className="table table-sm table-striped table-bordered table-hover">
                                    <thead>
                                          <tr>
                                                <th>{t('Name')}</th>
                                                <th>{t('Homes')}</th>
                                                <th>{t('Start period')}</th>
                                                <th>{t('Background color')}</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {user.condominiums.map((home) => (
                                                <tr key={home.id}>
                                                      <td>{home.name}</td>
                                                      <td>{home.type}</td>
                                                      <td>{home.size}</td>
                                                      <td>{home.startPeriod}</td>
                                                      <td>
                                                            <input type="color" value={home.backgroundColor} disabled style={{width: '3em'}}/>
                                                      </td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                        </div>
                  </div>
            </>
      )
}

export default Profile;