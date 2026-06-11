import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import homeIcon from '../../../assets/images/app/home.png';
import ModalHome from "./ModalHome";
import Resident from "../Resident";

const Home = () => {
      const { condominiumId, homeId } = useParams()
      const [home, setHome] = useState()
      const [editHome, setEditHome] = useState(false)

      const { t } = useTranslation()

      const handleOpen = () => setEditHome(true);
      const handleClose = () => setEditHome(false);

      useEffect(() => {
            //fetch home
            setHome();
      }, [])

      console.log(condominiumId, homeId, home, t);

      return (
            <div>
                  <ModalHome
                        show={editHome}
                        handleClose={handleClose}
                        condominium={{ id: condominiumId }}
                        inputData={home}
                  />
                  <button className="hg-title my-2" onClick={handleOpen}>
                        <div className="d-flex justify-content-center align-items-center">
                              <span>Home</span>
                              <img src={homeIcon} className="medium-icon ms-3" alt="home" />
                        </div>
                  </button>
                  <div className="layout">
                        <section className="homes-section">
                              <Resident />
                        </section>
                        <section className="utility-section">
                              Fees
                        </section>
                  </div>
            </div>
      )
}

export default Home;
