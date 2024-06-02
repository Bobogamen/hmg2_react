import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import '../management/Management.css';
import add from '../../assets/images/app/add.png';
import apartments from '../../assets/images/app/apartment_building.png';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import ModalHomesGroup from "./ModalHomesGroup";

const Management = () => {
  const [homesGroups, setHomesGroups] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setHomesGroups(testHomesGroups);
  }, []);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  return (
    <div>
      <div className="management">
        {homesGroups.length > 0 ? (
          <ul className="mt-5">
            {homesGroups.map(hg => (
              <Link to={`/management/homesGroup/${hg.id}`} className="text-decoration-none text-dark" key={hg.id}>
                <li id={hg.id} style={{ backgroundColor: hg.backgroundColor }}>
                  <img src={apartments} className="big-icon" alt="apartments" />
                  <span>{hg.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <h3 className="mt-5">{t('No groups added')}</h3>
        )}
        <ModalHomesGroup show={openModal} handleClose={handleClose} />
        <div className="img-button pointer mt-3" onClick={handleOpen}>
          <img src={add} className="icon" alt="add" />
          <span className="ms-1">{`${t('Create')} ${t('group')}`}</span>
        </div>
      </div>
    </div>
  );
};

export default Management;


const testHomesGroups = [
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