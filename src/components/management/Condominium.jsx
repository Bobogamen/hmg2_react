import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apartments from '../../assets/images/app/apartment_building.png';
import ModalCondominium from "./ModalCondominium";
import HomesTable from "./home/HomesTable";
import FeesTable from "./FeesTable";
import BillsTable from "./BillsTable";
import RepairsTable from "./RepairsTable";
import { getCondominium } from "../../api/services/managementService";
import { useLoading } from "../../loader/LoadingContext";
import errorHandler from "../errorHandling/errosHandler";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";

const Condominium = () => {
      const { condominiumId } = useParams();
      const { setIsLoading } = useLoading();
      const { logout } = useUser();
      const navigate = useNavigate();
      const { t } = useTranslation();

      const initCondominium = {
            condominiumId: null,
            name: "",
            homes: [],
            fees: [],
            bills: [],
            repairs: []
      };

      const [condominium, setCondominium] = useState(initCondominium);
      const [editCondominium, setEditCondominium] = useState(false);

      const fetchCondominium = useCallback(async () => {
            setIsLoading(true);
            try {
                  const data = await getCondominium(condominiumId);
                  setCondominium(data);
            } catch (error) {
                  errorHandler(error, undefined, navigate, t, logout);
            } finally {
                  setIsLoading(false);
            }
      }, [condominiumId, setIsLoading, navigate, t, logout]);

      useEffect(() => {
            fetchCondominium();
      }, [fetchCondominium]);


      const handleOpen = () => setEditCondominium(true);
      const handleClose = () => setEditCondominium(false);

      return (
            <>
                  <ModalCondominium show={editCondominium} handleClose={handleClose} condominium={condominium} />
                  <button className="hg-title my-2" onClick={handleOpen}>
                        <div className="d-flex justify-content-center align-items-center gap-3">
                              <div className="text-center">
                                    <div className="fw-bold fs-4">
                                          {condominium.name}
                                    </div>

                                    <div className="text-muted small">
                                          {condominium.city}, {condominium.address}
                                    </div>
                              </div>
                              <img src={apartments} className="medium-icon" alt="apartments" />
                        </div>
                  </button>
                  <div className="layout">
                        <section className="homes-section">
                              <HomesTable condominium={condominium || []} onSaved={fetchCondominium} />
                        </section>
                        <section className="utility-section">
                              <FeesTable fees={condominium.fees || []} />
                              <BillsTable bills={condominium.bills || []} />
                              <RepairsTable repairs={condominium.repairs || []} />
                        </section>
                  </div>
            </>
      )
}

export default Condominium;
