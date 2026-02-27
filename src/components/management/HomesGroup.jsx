import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apartments from '../../assets/images/app/apartment_building.png';
import ModalHomesGroup from "./ModalCondominium";
import HomesTable from "./HomesTable";
import FeesTable from "./FeesTable";
import BillsTable from "./BillsTable";
import RepairsTable from "./RepairsTable";
import { getHomesGroup } from "../../api/services/managementService";
import { useLoading } from "../../loader/LoadingContext";
import errorHandler from "../errorHandling/errosHandler";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";

const HomesGroup = () => {
      const { id } = useParams();
      const { setIsLoading } = useLoading();
      const { logout } = useUser();
      const navigate = useNavigate();
      const { t } = useTranslation();
      const [homesGroup, setHomesGroup] = useState({});
      const [editHomesGroup, setEditHomesGroup] = useState(false);

      useEffect(() => {
            const fetchHomesGroup = async () => {
                  setIsLoading(true);
                  try {
                        const data = await getHomesGroup(id);
                        setHomesGroup(data);
                  } catch (error) {
                        errorHandler(error, undefined, navigate, t, logout);
                  } finally {
                        setIsLoading(false);
                  }
            };

            fetchHomesGroup();
      }, [id, setIsLoading, navigate, t, logout]);


      const handleOpen = () => setEditHomesGroup(true);
      const handleClose = () => setEditHomesGroup(false);

      return (
            <>
                  <ModalHomesGroup show={editHomesGroup} handleClose={handleClose} inputData={homesGroup} />
                  <button className="hg-title my-2" onClick={handleOpen}>
                        <div className="d-flex justify-content-center align-items-center">
                              <span>{homesGroup.name}</span>
                              <img src={apartments} className="medium-icon ms-3" alt="aparatments" />
                        </div>
                  </button>
                  <div className="layout">
                        <section className="homes-section">
                              <HomesTable homesGroup={homesGroup.homes || []} />
                        </section>
                        <section className="utility-section">
                              <FeesTable fees={homesGroup.fees || []} />
                              <BillsTable bills={homesGroup.bills || []} />
                              <RepairsTable repairs={homesGroup.repairs || []} />
                        </section>
                  </div>
            </>
      )
}

export default HomesGroup;