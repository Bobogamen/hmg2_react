import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import homeIcon from '../../assets/images/app/home.png';
import ModalHome from "./ModalHome";
import Resident from "./Resident";

const Bill = () => {
      const { id } = useParams()
      const [home, setHome] = useState()
      const [editHome, setEditHome] = useState(false)

      const { t } = useTranslation()

      const handleOpen = () => setEditHome(true);
      const handleClose = () => setEditHome(false);

      useEffect(() => {
            setHome();
      }, [])

      return (
            <div>
                  <ModalHome show={editHome} handleClose={handleClose} action={'edit'} data={''}/>
                  <button className="hg-title my-2" onClick={handleOpen}>
                        <div className="d-flex justify-content-center align-items-center">
                              <span>Home</span>
                              <img src={homeIcon} className="medium-icon ms-3" alt="home" />
                        </div>
                  </button>
                  <Resident />
                  <Resident />
                  <Resident />
            </div>
      )
}

export default Bill;