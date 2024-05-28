import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import '../management/Management.css'
import add from '../../assets/images/app/add.png'
import apartments from '../../assets/images/app/apartment_building.png'
import HomesGroup from "./HomesGroup";
import { Link } from "react-router-dom";

const Management = () => {
      const [addHomesGroup, setAddHomesGroup] = useState()
      const { t } = useTranslation();
      const handlerHomesGroup = () => {
            setAddHomesGroup(true)
      }

      return (
            <div>
                  {addHomesGroup ? (
                        <HomesGroup id={0} />
                  ) : (
                        <div className="management">
                              <div className="img-button pointer mt-3" onClick={handlerHomesGroup}>
                                    <img src={add} className="icon" alt="add" />
                                    <span className="ms-1">{`${t('Create')} ${t('group')}`}</span>
                              </div>
                              {homesGroup.length > 0 ?
                                    <ul>
                                          {
                                                homesGroup.map(hg => (
                                                      <Link to={`/management/homesGroup/${hg.id}`} className="text-decoration-none text-dark" key={hg.id}>
                                                            <li id={hg.id} style={{ backgroundColor: hg.backgroundColor }}>
                                                                  <img src={apartments} className="big-icon" alt="apartments" />
                                                                  <span>{hg.name}</span>
                                                            </li>
                                                      </Link>
                                                ))}
                                    </ul>
                                    : (
                                          <h3>{t('No groups added')}</h3>
                                    )}
                        </div>
                  )}
            </div >
      )
}

export default Management;

const homesGroup = [
      {
            id: 1,
            name: 'кв. Надежда бл. 103 вх. А',
            backgroundColor: '#7d73db'
      },
      {
            id: 2,
            name: 'Люлин 5',
            backgroundColor: '#1bd711'
      },
      {
            id: 3,
            name: 'Люлин 7',
            backgroundColor: '#fb3d37'
      },
]