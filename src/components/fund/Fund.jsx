import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import { useUser } from "../../user/UserContext";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import { getCondominium } from "../../api/services/managementService";
import { getFundDetails } from "../../api/services/fundService";
import apartments from "../../assets/images/app/apartment_building.png";
import fundIcon from "../../assets/images/app/fund.png";
import { repairAmount } from "../repair/repairFormatting";
import FundDetails from "./FundDetails";
import "../repair/Repair.css";

const Fund = () => {
  const { condominiumId, fundId } = useParams();
  const { user } = useUser();
  const { t } = useTranslation();
  const { setBreadcrumbs } = useBreadcrumb();
  const [condominium, setCondominium] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const condoPath = `/fund/condominiums/${condominiumId}`;
  useEffect(() => {
    let current = true;
    setCondominium(null);
    setDetails(null);
    setError(null);
    if (!condominiumId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      getCondominium(condominiumId),
      fundId
        ? getFundDetails({ condominiumId, fundId })
        : Promise.resolve(null),
    ])
      .then(([condo, result]) => {
        if (current) {
          setCondominium(condo);
          setDetails(result);
        }
      })
      .catch((failure) => {
        if (current)
          setError(
            failure.response?.status === 404
              ? "finance:fundNotFound"
              : "server:error",
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [condominiumId, fundId, revision]);
  useEffect(() => {
    const crumbs = [{ label: t("finance:funds"), path: "/fund" }];
    if (condominium)
      crumbs.push({
        label: condominium.name,
        path: condoPath,
        color: condominium.backgroundColor,
      });
    if (details) crumbs.push({ label: details.fund.name });
    setBreadcrumbs(crumbs);
    return () => setBreadcrumbs([]);
  }, [condominium, details, condoPath, setBreadcrumbs, t]);

  if (!condominiumId)
    return (
      <div className="management">
        <div className="text-center text-bg-light w-100 rounded border border-2 border-dark">
          <h2 className="fw-bold mb-0 mt-1">{t("finance:funds")}</h2>
          <p className="mb-1 fw-semibold text-decoration-underline">
            {t("finance:repairDetails.chooseCondominium")}
          </p>
        </div>
        {user?.condominiums?.length ? (
          <ul>
            {user.condominiums.map((condo) => (
              <li
                key={condo.id}
                style={{ backgroundColor: condo.backgroundColor }}
              >
                <Link
                  className="text-decoration-none text-dark text-center"
                  to={`/fund/condominiums/${condo.id}`}
                >
                  <img src={apartments} className="big-icon" alt="" />
                  <span>{condo.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t("condo:noneAddedCondo")}</p>
        )}
      </div>
    );
  if (loading)
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">
            {t("finance:repairDetails.loading")}
          </span>
        </Spinner>
      </div>
    );
  if (error)
    return (
      <div className="alert alert-danger" role="alert">
        {t(error)}{" "}
        <button className="btn btn-outline-danger btn-sm" onClick={refresh}>
          {t("finance:repairDetails.retry")}
        </button>
      </div>
    );
  if (!condominium) return null;
  if (fundId && details)
    return (
      <FundDetails
        key={`${condominiumId}-${fundId}`}
        condominium={condominium}
        details={details}
        onSaved={refresh}
      />
    );
  return (
    <div className="text-center">
      <h3 className="fw-bold text-bg-light rounded border border-2 border-dark p-2">
        {t("finance:fundDetails.chooseFund")}
      </h3>
      <div className="row g-3 justify-content-center mt-2">
        {condominium.funds?.length ? (
          condominium.funds.map((fund) => (
            <div className="col-12 col-md-6 col-xl-4" key={fund.id}>
              <Link
                to={`${condoPath}/funds/${fund.id}`}
                className="repair-selection-card repair-selection-card--completed card h-100 text-decoration-none text-dark"
              >
                <div className="card-body p-4">
                  <img src={fundIcon} className="medium-icon mb-2" alt="" />
                  <h3 className="h5 fw-bold text-break">{fund.name}</h3>
                  <div className="small">{t("finance:availableFunds")}</div>
                  <strong className="fs-3">
                    {repairAmount(fund.availableFunds)}
                  </strong>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-muted">{t("finance:noneAddedFunds")}</p>
        )}
      </div>
    </div>
  );
};
export default Fund;
