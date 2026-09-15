import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apartments from "../../assets/images/app/apartment_building.png";
import "../repair/Repair.css";
import CashierCondominiumCard from "./CashierCondominiumCard";

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
          <CashierCondominiumCard condominium={condo} />
        </div>
      ))}
    </div>
  );
}
