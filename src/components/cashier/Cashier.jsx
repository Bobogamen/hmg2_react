import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useUser } from "../../user/UserContext";
import { getCashiers } from "../../api/services/cashierService";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import Breadcrumbs from "../breadcrumb/Breadcrumbs";
import ModalCashier from "./ModalCashier";
import CashierCondominiums from "./CashierCondominiums";
import cashierIcon from "../../assets/images/app/cashier..png";
import addIcon from "../../assets/images/app/add.png";
import "./Cashier.css";
import "../repair/Repair.css";

export default function Cashier() {
  const { user } = useUser();
  const { t } = useTranslation(["dashboard", "common"]);
  const { setBreadcrumbs } = useBreadcrumb();
  const manager = user?.roles?.some((role) =>
    ["ADMIN", "MANAGER"].includes(role),
  );
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setBreadcrumbs([{ label: t("dashboard:cashier") }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs, t]);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(false);
    setShowRegistration(false);
    setSelectedCashier(null);
    if (manager)
      getCashiers()
        .then((result) => {
          if (active) setData(result);
        })
        .catch(() => {
          if (active) setError(true);
        });
    return () => {
      active = false;
    };
  }, [manager, user?.id, revision]);

  const limitReached = data && data.cashiers.length >= data.cashierLimit;

  return (
    <div fluid className="py-1 container-fluid">
      <Breadcrumbs />
      <section className="cashier-page">
        <header className="text-center text-bg-light w-100 rounded border border-2 border-dark p-2">
          <h2 className="fw-bold mb-1 cashier-heading">
            {t("dashboard:cashier")}
          </h2>
          <p className="mb-0 fw-semibold text-muted text-decoration-underline">
            {t(manager ? "cashierPage.managerDescription" : "")}
          </p>
        </header>

        {error && (
          <div role="alert" className="alert alert-danger text-center">
            <p>{t("cashierPage.loadError")}</p>
            <button
              className="btn btn-outline-dark"
              onClick={() => setRevision((value) => value + 1)}
            >
              {t("cashierPage.retry")}
            </button>
          </div>
        )}

        {manager ? (
          data ? (
            <>
              <div className="cashier-toolbar">
                <h3 className="fs-5 fw-bold mb-0">
                  {t("cashierPage.list")}
                  <span className="badge text-bg-dark bg-opacity-50 ms-2">
                    {data.cashiers.length} / {data.cashierLimit}
                  </span>
                </h3>
                {!limitReached && (
                  <div
                    className="img-button pointer"
                    onClick={() => setShowRegistration(true)}
                  >
                    <img src={addIcon} className="icon" alt="addIcon" />
                    <span className="ms-1">
                      {t("cashierPage.register")} {t("cashier")}
                    </span>
                  </div>
                )}
              </div>
              {limitReached && (
                <p role="status" className="alert alert-info mb-0">
                  {t("cashierPage.limit")}
                </p>
              )}
              {data.cashiers.length ? (
                <div className="row g-3 justify-content-center">
                  {data.cashiers.map((cashier) => (
                    <div className="col-12 col-md-6 col-xl-4" key={cashier.id}>
                      <article
                        className={`repair-selection-card repair-selection-card--${cashier.condominiums.length ? "completed" : "pending"} card h-100 text-dark`}
                      >
                        <div className="card-body d-flex flex-column gap-3 p-4">
                          <header className="d-flex align-items-center gap-3">
                            <span className="repair-selection-card__icon">
                              <img
                                src={cashierIcon}
                                alt="cashierIcon"
                                className="icon"
                              />
                            </span>
                            <div>
                              <h4 className="fs-5 fw-bold mb-1">
                                {cashier.name}
                              </h4>
                              <p className="text-muted mb-0 cashier-email">
                                {cashier.email}
                              </p>
                            </div>
                          </header>
                          <div>
                            <div className="small text-muted">
                              {t("cashierPage.assignedCondominiums")}{" "}
                            </div>
                            <div className="fs-3 fw-bold">
                              {cashier.condominiums.length}
                            </div>
                            <CashierCondominiums
                              items={cashier.condominiums}
                              manager
                            />
                          </div>
                          <footer className="repair-selection-card__footer pt-3 mt-auto">
                            <button
                              type="button"
                              className="cashier-selection-action repair-selection-card__action"
                              onClick={() => setSelectedCashier(cashier)}
                            >
                              {t("cashierPage.editAssignments")}
                              <span aria-hidden="true">→</span>
                            </button>
                          </footer>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cashier-empty">
                  <h4 className="fs-5 text-muted">{t("cashierPage.empty")}</h4>
                  {!limitReached && (
                    <p className="mb-0 text-muted">
                      {t("cashierPage.emptyHint")}
                    </p>
                  )}
                </div>
              )}
              <ModalCashier
                show={showRegistration || !!selectedCashier}
                cashier={selectedCashier}
                handleClose={() => {
                  setShowRegistration(false);
                  setSelectedCashier(null);
                }}
                overview={data}
                onSaved={setData}
              />
            </>
          ) : (
            !error && (
              <div role="status" className="cashier-empty">
                <Spinner animation="border" size="sm" className="me-2" />
                {t("cashierPage.loading")}
              </div>
            )
          )
        ) : (
          <>
            <div className="cashier-section-heading">
              <h3 className="fs-5 fw-bold mb-0">
                {t("cashierPage.myCondominiums")}
                <span className="badge text-bg-secondary ms-2">
                  {user?.condominiums?.length || 0}
                </span>
              </h3>
              <p>{t("cashierPage.chooseBuilding")}</p>
            </div>
            <CashierCondominiums items={user?.condominiums || []} />
          </>
        )}
      </section>
    </div>
  );
}
