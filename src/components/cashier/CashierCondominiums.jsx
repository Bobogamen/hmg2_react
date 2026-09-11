import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apartments from "../../assets/images/app/apartment_building.png";
import funds from "../../assets/images/app/fund.png";
import repairs from "../../assets/images/app/repair.png";

export default function CashierCondominiums({ items, manager = false }) {
  const { t } = useTranslation(["dashboard"]);

  if (!items.length)
    return <p className="text-muted my-3">{t("cashierPage.noCondominiums")}</p>;

  return (
    <ul
      className={`cashier-condominiums ${manager ? "cashier-condominiums-compact" : ""}`}
    >
      {items.map((condo) => (
        <li
          key={condo.id}
          className="cashier-condominium"
          style={{ backgroundColor: condo.backgroundColor || "#e5e5e5" }}
        >
          {manager ? (
            <Link
              to={`/management/condominiums/${condo.id}`}
              className="cashier-condominium-link"
            >
              <img src={apartments} className="icon" alt="" />
              <span className="cashier-condominium-name">{condo.name}</span>
            </Link>
          ) : (
            <>
              <img src={apartments} className="big-icon" alt="" />
              <h4 className="cashier-condominium-name fs-6">{condo.name}</h4>
            </>
          )}
          {(condo.city || condo.address) && (
            <p className="cashier-address">
              {[condo.city, condo.address].filter(Boolean).join(", ")}
            </p>
          )}
          {!manager && (
            <nav
              className="cashier-condominium-actions"
              aria-label={condo.name}
            >
              <Link
                to={`/fund/condominiums/${condo.id}`}
                className="img-button text-decoration-none"
              >
                <img src={funds} className="small-icon me-1" alt="" />
                {t("dashboard:funds")}
              </Link>
              <Link
                to={`/repair/condominiums/${condo.id}`}
                className="img-button text-decoration-none"
              >
                <img src={repairs} className="small-icon me-1" alt="" />
                {t("dashboard:repairs")}
              </Link>
            </nav>
          )}
        </li>
      ))}
    </ul>
  );
}
