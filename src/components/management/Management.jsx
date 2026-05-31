import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import '../management/Management.css';
import add from '../../assets/images/app/add.png';
import apartments from '../../assets/images/app/apartment_building.png';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import ModalCondominium from "./ModalCondominium";
import { useUser } from "../../user/UserContext";

const Management = () => {
  const { user } = useUser();
  const condominiums = user?.condominiums || [];

  const [openModal, setOpenModal] = useState(false);
  const { t } = useTranslation(["common", "dashboard", "condominium", "server"]);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  return (
    <div>
      <div className="management">

        {condominiums.length > 0 ? (
          <ul>
            {condominiums.map((condo) => (
              <Link
                key={condo.id}
                to={`/management/condominiums/${condo.id}`}
                className="text-decoration-none text-dark"
              >
                <li style={{ backgroundColor: condo.backgroundColor }}>
                  <img src={apartments} className="big-icon" alt="apartments" />
                  <span>{condo.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <h5 className="text-muted">
            {t("condo:noneAddedCondo")}
          </h5>
        )}

        {user?.condominiumLimit > condominiums.length && (
          <div className="img-button pointer" onClick={handleOpen}>
            <img src={add} className="icon" alt="add" />
            <span className="ms-2">{t("common:create")}</span>
          </div>
        )}

      </div>

      <ModalCondominium
        show={openModal}
        handleClose={handleClose}
      />

    </div>
  );
};

export default Management;