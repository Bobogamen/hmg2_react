import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apartments from '../../assets/images/app/apartment_building.png';
import ModalCondominium from "./ModalCondominium";
import HomesTable from "./home/HomesTable";
import FeesTable from "./fee/FeesTable";
import BillsTable from "./bill/BillsTable";
import RepairsTable from "./repair/RepairsTable";
import { getCondominium } from "../../api/services/managementService";
import { useLoading } from "../../loader/LoadingContext";
import errorHandler from "../errorHandling/errosHandler";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import FundsTable from "./fund/FundsTable";
import AccountingPeriodNotice from "./AccountingPeriodNotice";

const Condominium = () => {

      const { condominiumId } = useParams();
      const { setIsLoading } = useLoading();
      const { logout, user } = useUser();
      const navigate = useNavigate();
      const { t, i18n } = useTranslation();
      const { setBreadcrumbs } = useBreadcrumb();

      const initCondominium = {
            id: null,
            name: "",
            homes: [],
            fees: [],
            billMaxCount: 0,
            bills: [],
            repairs: [],
            repairLimit: 20
      };

      const [condominium, setCondominium] = useState(initCondominium);
      const [editCondominium, setEditCondominium] = useState(false);
      const [selection, setSelection] = useState(null);

      const selectedFee = useMemo(() => selection?.type === "fee"
            ? condominium?.fees?.find((fee) => fee.id === selection.id)
            : null, [condominium?.fees, selection]);
      const selectedFund = useMemo(() => selection?.type === "fund"
            ? condominium?.funds?.find((fund) => fund.id === selection.id)
            : null, [condominium?.funds, selection]);
      const selectedHomeIds = selectedFee?.homeIds || [];
      const highlightedFundId = selectedFund?.id ?? (selectedFee?.fund ? selectedFee.fundId : null);
      const highlightedFeeIds = useMemo(() => selectedFund
            ? (condominium?.fees || [])
                  .filter((fee) => fee.fund && fee.fundId != null && String(fee.fundId) === String(selectedFund.id))
                  .map((fee) => fee.id)
            : [], [condominium?.fees, selectedFund]);

      const toggleSelection = (type, item) => {
            setSelection((current) => item && !(current?.type === type && current.id === item.id)
                  ? { type, id: item.id }
                  : null);
      };

      useEffect(() => { setSelection(null); }, [condominiumId]);

      useEffect(() => {
            const clearOutside = (event) => {
                  if (!event.target.closest?.(".fee-homes-cell, .fund-fees-cell")) setSelection(null);
            };
            const clearOnEscape = (event) => {
                  if (event.key === "Escape") setSelection(null);
            };
            document.addEventListener("pointerdown", clearOutside);
            document.addEventListener("keydown", clearOnEscape);
            return () => {
                  document.removeEventListener("pointerdown", clearOutside);
                  document.removeEventListener("keydown", clearOnEscape);
            };
      }, []);

      const fetchCondominium = useCallback(async () => {
            setIsLoading(true);
            try {
                  const data = await getCondominium(condominiumId);
                  setCondominium(data);
            } catch (error) {
                  errorHandler(
                        error,
                        undefined,
                        navigate,
                        t,
                        logout
                  );
            } finally {
                  setIsLoading(false);
            }
      }, [
            condominiumId,
            setIsLoading,
            navigate,
            t,
            logout
      ]);

      useEffect(() => {
            fetchCondominium();
      }, [fetchCondominium]);

      useEffect(() => {
            if (!condominium.name) return;
            setBreadcrumbs([
                  {
                        label: t("dashboard:management"),
                        path: "/management"
                  },
                  {
                        label: condominium.name,
                        color: condominium.backgroundColor
                  }
            ]);
      }, [
            condominium.name,
            condominium.backgroundColor,
            t,
            setBreadcrumbs
      ]);

      const handleOpen = () => {
            setEditCondominium(true);
      };

      const handleClose = () => {
            setEditCondominium(false);
      };

      return (
            <>
                  <ModalCondominium
                        show={editCondominium}
                        handleClose={handleClose}
                        condominium={condominium}
                        onSaved={fetchCondominium}
                  />
                  <button
                        className="hg-title mb-lg-4"
                        onClick={handleOpen}
                  >
                        <div className="
                              d-flex
                              justify-content-center
                              align-items-center
                              gap-3
                        ">
                              <div className="text-center">
                                    <div className="fw-bold fs-4">
                                          {condominium.name}
                                    </div>
                                    <div className="text-muted small">
                                          {i18n.language === "bg"
                                                ? `${t("condo:cityShort")} `
                                                : ""
                                          }
                                          {condominium.city},{" "}
                                          {condominium.address}
                                    </div>
                              </div>
                              <img
                                    src={apartments}
                                    className="medium-icon"
                                    alt="apartments"
                              />
                        </div>
                  </button>
                  {condominium.id && user?.roles?.some(role => ["ADMIN", "MANAGER"].includes(role)) &&
                        <AccountingPeriodNotice key={condominiumId} condominiumId={condominiumId} />}
                  <div className="layout">
                        <section className="homes-section">
                              <HomesTable
                                    condominium={condominium}
                                    onSaved={fetchCondominium}
                                    selectedHomeIds={selectedHomeIds}
                              />
                        </section>
                        <section className="utility-section">
                              <FeesTable
                                    condominium={condominium}
                                    onSaved={fetchCondominium}
                                    selectedFeeId={selectedFee?.id}
                                    highlightedFeeIds={highlightedFeeIds}
                                    onFeeHomesSelect={(fee) => toggleSelection("fee", fee)}
                              />
                              <BillsTable
                                    condominium={condominium}
                                    onSaved={fetchCondominium}
                              />
                              <FundsTable
                                    condominium={condominium}
                                    onSaved={fetchCondominium}
                                    selectedFundId={selectedFund?.id}
                                    highlightedFundId={highlightedFundId}
                                    onFundFeesSelect={(fund) => toggleSelection("fund", fund)}
                              />
                              <RepairsTable
                                    condominium={condominium}
                                    onSaved={fetchCondominium}
                              />
                        </section>
                  </div>
            </>
      );
};
export default Condominium;
