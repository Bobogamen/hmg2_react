import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import '../management/Management.css';
import add from '../../assets/images/app/add.png';
import apartments from '../../assets/images/app/apartment_building.png';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import ModalHomesGroup from "./ModalHomesGroup";
import { useUser } from "../../user/UserContext";

const Management = () => {
  const { user } = useUser();
  const [condominiums, setCondominiums] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setCondominiums(user.condominiums);
    }
  }, [user]);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  return (
    <div>
      <div className="management">
        <h3 className="title mt-3 text-bg-danger bg-opacity-50">{t('Management')}</h3>
        {condominiums.length > 0 ? (
          <ul>
            {condominiums.map(hg => (
              <Link to={`/management/homesGroup/${hg.id}`} className="text-decoration-none text-dark" key={hg.id}>
                <li id={hg.id} style={{ backgroundColor: hg.backgroundColor }}>
                  <img src={apartments} className="big-icon" alt="apartments" />
                  <span>{hg.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <h5 className="text-muted">{t('No condominuims added')}</h5>
        )}
        <ModalHomesGroup show={openModal} handleClose={handleClose} />
        <div className="img-button pointer" onClick={handleOpen}>
          <img src={add} className="icon" alt="add" />
          <span className="ms-2">{`${t('Create')}`}</span>
        </div>
      </div>
    </div>
  );
};

export default Management;