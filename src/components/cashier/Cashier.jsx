import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
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
    <Container fluid className="py-1">
      <Breadcrumbs />
      <section className="cashier-page">
        <header className="text-center text-bg-light w-100 rounded border border-2 border-dark p-2">
          <h2 className="fw-bold mb-1 cashier-heading">
            {t("dashboard:cashier")}
          </h2>
          <p className="text-decoration-underline mb-1 fw-semibold text-light-emphasis">
            {t(
              manager
                ? "cashierPage.managerDescription"
                : "cashierPage.cashierDescription",
            )}
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
                  <button
                    type="button"
                    className="img-button cashier-add"
                    onClick={() => setShowRegistration(true)}
                  >
                    <img src={addIcon} className="icon" alt="" />
                    <span className="ms-2">{t("cashierPage.register")}</span>
                  </button>
                )}
              </div>
              {limitReached && (
                <p role="status" className="alert alert-info mb-0">
                  {t("cashierPage.limit")}
                </p>
              )}
              {data.cashiers.length ? (
                <div className="cashier-grid">
                  {data.cashiers.map((cashier) => (
                    <article className="cashier-card" key={cashier.id}>
                      <header className="cashier-card-header">
                        <img src={cashierIcon} className="big-icon" alt="" />
                        <div>
                          <h4 className="fs-5 fw-bold mb-1">{cashier.name}</h4>
                          <p className="text-muted mb-0 cashier-email">
                            {cashier.email}
                          </p>
                        </div>
                      </header>
                      <div className="cashier-card-body">
                        <h5 className="fs-6 fw-bold">
                          {t("cashierPage.assignedCondominiums")}{" "}
                          <span className="badge text-bg-secondary">
                            {cashier.condominiums.length}
                          </span>
                        </h5>
                        <CashierCondominiums
                          items={cashier.condominiums}
                          manager
                        />
                      </div>
                    </article>
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
                show={showRegistration}
                handleClose={() => setShowRegistration(false)}
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
            <h3 className="fs-5 fw-bold mb-0">
              {t("cashierPage.myCondominiums")}
            </h3>
            <CashierCondominiums items={user?.condominiums || []} />
          </>
        )}
      </section>
    </Container>
  );
}
