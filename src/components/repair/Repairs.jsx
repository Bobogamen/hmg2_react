import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import { ArrowRight } from "lucide-react";
import repairIcon from "../../assets/images/app/repair.png";
import { useUser } from "../../user/UserContext";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import { getCondominium } from "../../api/services/managementService";
import { getRepairDetails } from "../../api/services/repairService";
import apartments from "../../assets/images/app/apartment_building.png";
import RepairDetails from "./RepairDetails";
import { repairAmount } from "./repairFormatting";
// import "../management/Management.css";
import "./Repair.css";

const Repairs = () => {
  const { condominiumId, repairId } = useParams();
  const { user } = useUser();
  const { t } = useTranslation();
  const { setBreadcrumbs } = useBreadcrumb();
  const [condominium, setCondominium] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const condoPath = `/repair/condominiums/${condominiumId}`;

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
      repairId
        ? getRepairDetails({ condominiumId, repairId })
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
              ? "finance:repairNotFound"
              : "server:error",
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [condominiumId, repairId, revision]);

  useEffect(() => {
    const crumbs = [{ label: t("finance:repairs"), path: "/repair" }];
    if (condominium)
      crumbs.push({
        label: condominium.name,
        path: condoPath,
        color: condominium.backgroundColor,
      });
    if (details) crumbs.push({ label: details.repair.name });
    setBreadcrumbs(crumbs);
    return () => setBreadcrumbs([]);
  }, [condominium, details, condoPath, setBreadcrumbs, t]);

  if (!condominiumId)
    return (
      <div className="management">
        <div className="text-center text-bg-light w-100 rounded border border-2 border-dark">
          <h2 className="fw-bold mb-0 mt-1">{t("finance:repairs")}</h2>
          <p className="text-decoration-underline mb-1 fw-semibold text-light-emphasis">
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
                  to={`/repair/condominiums/${condo.id}`}
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
      <div role="alert" className="alert alert-danger">
        {t(error)}{" "}
        <button className="btn btn-outline-danger btn-sm" onClick={refresh}>
          {t("finance:repairDetails.retry")}
        </button>
      </div>
    );
  if (!condominium) return null;
  if (repairId && details)
    return (
      <RepairDetails
        key={`${condominiumId}-${repairId}`}
        condominium={condominium}
        details={details}
        onSaved={refresh}
      />
    );

  return (
    <div className="text-center">
      <div className="text-center text-bg-light w-100 rounded border border-2 border-dark">
        <h3 className="fw-bold mb-0 mt-1 pb-1">
          {t("finance:repairDetails.chooseRepair")}
        </h3>
      </div>
      <div className="row g-3 justify-content-center mt-2">
        {condominium.repairs?.length ? (
          condominium.repairs.map((repair) => {
            const budget = Math.max(0, Number(repair.budget) || 0);
            const collected = Math.max(0, Number(repair.totalPaid) || 0);
            const progress =
              budget > 0
                ? Math.min(100, Math.floor((collected / budget) * 100))
                : 0;
            const remaining = Math.max(0, budget - collected);
            const status = repair.completed ? "completed" : "pending";
            return (
              <div className="col-12 col-md-6 col-xl-4" key={repair.id}>
                <Link
                  to={`${condoPath}/repairs/${repair.id}`}
                  className={`repair-selection-card repair-selection-card--${status} card h-100 text-decoration-none text-dark`}
                >
                  <div className="card-body d-flex flex-column gap-3 p-4">
                    <div className="d-flex align-items-center gap-3">
                      <span
                        className="repair-selection-card__icon"
                        aria-hidden="true"
                      >
                        <img src={repairIcon} width={32} height={32} alt="" />
                      </span>
                      <h3 className="h5 fw-bold text-break mb-0 pt-1">
                        {repair.name}
                      </h3>
                    </div>
                    <span className="visually-hidden">
                      {t(
                        repair.completed
                          ? "finance:homeRepairs.completed"
                          : "finance:homeRepairs.notCompleted",
                      )}
                    </span>
                    <div>
                      <div className="small text-muted">
                        {t("finance:budget")}
                      </div>
                      <div className="fs-3 fw-bold">{repairAmount(budget)}</div>
                    </div>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-end flex-wrap gap-1 mb-2">
                        <div className="small">
                          <span className="text-muted">
                            {t("finance:repairDetails.collected")}:{" "}
                          </span>
                          <strong>{repairAmount(collected)}</strong>
                        </div>
                        <strong className="repair-selection-card__percentage">
                          {progress}%
                        </strong>
                      </div>
                      <div className="progress repair-selection-card__progress">
                        <div
                          className={`progress-bar ${repair.completed ? "bg-success" : "bg-danger"}`}
                          style={{ width: `${progress}%` }}
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={progress}
                          aria-label={t(
                            "finance:repairDetails.collectionProgress",
                            { name: repair.name },
                          )}
                          aria-valuetext={t(
                            "finance:repairDetails.percentCollected",
                            { percent: progress },
                          )}
                        />
                      </div>
                      <div className="small text-muted mt-2">
                        {t(
                          remaining > 0
                            ? "finance:repairDetails.leftToCollect"
                            : budget > 0
                              ? "finance:repairDetails.budgetCollected"
                              : "finance:repairDetails.noBudget",
                          { amount: repairAmount(remaining) },
                        )}
                      </div>
                    </div>
                    <div className="repair-selection-card__footer d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3">
                      <div className="small">
                        <div className="text-muted">
                          {t("finance:availableFunds")}
                        </div>
                        <strong>{repairAmount(repair.balance)}</strong>
                      </div>
                      <span className="repair-selection-card__action d-inline-flex align-items-center gap-2 small fw-bold">
                        {t("finance:repairDetails.viewRepair")}
                        <ArrowRight size={18} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        ) : (
          <p className="text-muted">{t("finance:noneAddedRepairs")}</p>
        )}
      </div>
    </div>
  );
};
export default Repairs;
