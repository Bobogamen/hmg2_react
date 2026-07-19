import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import '../management/Management.css';
import add from '../../assets/images/app/add.png';
import apartments from '../../assets/images/app/apartment_building.png';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import ModalCondominium from "./ModalCondominium";
import { useUser } from "../../user/UserContext";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";

const Management = () => {

  const { setBreadcrumbs } = useBreadcrumb();

  const { user } = useUser();
  const condominiums = user?.condominiums || [];

  const [openModal, setOpenModal] = useState(false);
  const { t } = useTranslation(["common", "dashboard", "condominium", "server"]);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  useEffect(() => {
    setBreadcrumbs([
      {
        label: t("dashboard:management")
      }
    ]);
  }, [setBreadcrumbs, t]);

  return (
    <div>
      <div className="management">

        {/* INTRO SECTION */}
        <div className="text-center text-bg-light w-100 rounded border border-2 border-dark">

          <h2 className="fw-bold mb-0 mt-1">
            {t("dashboard:managementTitle")}
          </h2>

          <p className="text-decoration-underline mb-1 fw-semibold text-light-emphasis">
            {t("dashboard:managementDescription")}
          </p>

        </div>

        {/* CONDOMINIUM LIST */}
        {condominiums.length > 0 ? (

          <ul>
            {condominiums.map((condominium) => (

              <Link
                key={condominium.id}
                to={`/management/condominiums/${condominium.id}`}
                className="text-decoration-none text-dark"
              >

                <li style={{ backgroundColor: condominium.backgroundColor }}>

                  <img
                    src={apartments}
                    className="big-icon"
                    alt="apartments"
                  />

                  <span>
                    {condominium.name}
                  </span>

                </li>

              </Link>

            ))}
          </ul>

        ) : (

          <div className="text-center mt-4">
            <h5 className="text-muted">
              {t("condo:noneAddedCondo")}
            </h5>
          </div>
        )}

        {/* ADD BUTTON */}
        {user?.condominiumLimit > condominiums.length && (

          <div
            className="img-button pointer"
            onClick={handleOpen}
          >

            <img
              src={add}
              className="icon"
              alt="add"
            />

            <span className="ms-2">
              {t("common:create")}
            </span>

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