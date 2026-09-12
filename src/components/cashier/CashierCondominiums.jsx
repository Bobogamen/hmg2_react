import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apartments from "../../assets/images/app/apartment_building.png";
import "../repair/Repair.css";

export default function CashierCondominiums({ items, manager = false }) {
  const { t } = useTranslation(["dashboard"]);
  if (!items.length)
    return <p className="text-muted my-3">{t("cashierPage.noCondominiums")}</p>;
  if (manager)
    return (
      <ul className="cashier-assigned-links">
        {items.map((condo) => (
          <li key={condo.id}>
            <Link
              to={`/cashier/condominium/${condo.id}`}
              className="text-decoration-none"
            >
              <img src={apartments} alt="apartments" className="medium-icon" />
              <span
                className="breadcrumb-item px-2 py-1 rounded fw-bold"
                style={{ backgroundColor: condo.backgroundColor || undefined }}
              >
                <span
                  className={
                    condo.backgroundColor ? "breadcrumb-item-text" : undefined
                  }
                >
                  {condo.name}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  return (
    <div className="row g-3 justify-content-center">
      {items.map((condo) => (
        <div className="col-12 col-md-6 col-xl-4" key={condo.id}>
          <article className="repair-selection-card repair-selection-card--completed card h-100 text-dark">
            <Link
              to={`/cashier/condominium/${condo.id}`}
              className="card-body d-flex flex-column gap-3 p-4 text-decoration-none text-dark"
            >
              <div className="d-flex align-items-center gap-3">
                <span className="repair-selection-card__icon">
                  <img src={apartments} className="icon" alt="apartments" />
                </span>
                <h3
                  className="breadcrumb-item px-2 py-2 rounded h5 fw-bold text-break mb-0"
                  style={{
                    backgroundColor: condo.backgroundColor || undefined,
                  }}
                >
                  <span
                    className={
                      condo.backgroundColor ? "breadcrumb-item-text" : undefined
                    }
                  >
                    {condo.name}
                  </span>
                </h3>
              </div>
              <p className="small text-muted mb-0">
                {[condo.city, condo.address].filter(Boolean).join(", ") ||
                  t("cashierPage.assignedBuilding")}
              </p>
              <div className="repair-selection-card__footer mt-auto pt-3 d-flex align-items-center justify-content-between gap-2">
                <span className="repair-selection-card__action small fw-bold">
                  {t("cashierPage.openAccounting")}
                </span>
                <span
                  className="repair-selection-card__action"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </Link>
          </article>
        </div>
      ))}
    </div>
  );
}
