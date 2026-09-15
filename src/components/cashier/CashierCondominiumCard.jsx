import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apartments from "../../assets/images/app/apartment_building.png";
import "../repair/Repair.css";

export default function CashierCondominiumCard({ condominium, heading = false }) {
  const { t, i18n } = useTranslation(["dashboard", "condo"]);
  const Body = heading ? "div" : Link;
  const Title = heading ? "h2" : "h3";
  const city = condominium.city
    ? `${i18n.language?.startsWith("bg") ? `${t("condo:cityShort")} ` : ""}${condominium.city}`
    : "";

  return (
    <article className="repair-selection-card repair-selection-card--completed card h-100 text-dark">
      <Body
        {...(!heading && { to: `/cashier/condominium/${condominium.id}` })}
        className="card-body d-flex flex-column gap-3 p-4 text-decoration-none text-dark"
      >
        <div className="d-flex align-items-center gap-3">
          <span className="repair-selection-card__icon">
            <img src={apartments} className="icon" alt="" />
          </span>
          <Title className="breadcrumb-item px-2 py-2 rounded h5 fw-bold text-break mb-0"
            style={{ backgroundColor: condominium.backgroundColor || undefined }}>
            <span className={condominium.backgroundColor ? "breadcrumb-item-text" : undefined}>
              {condominium.name}
            </span>
          </Title>
        </div>
        <p className="small text-muted mb-0">
          {[city, condominium.address].filter(Boolean).join(", ") || t("cashierPage.assignedBuilding")}
        </p>
        {!heading && (
          <div className="repair-selection-card__footer mt-auto pt-3 d-flex align-items-center justify-content-between gap-2">
            <span className="repair-selection-card__action small fw-bold">{t("cashierPage.openAccounting")}</span>
            <span className="repair-selection-card__action" aria-hidden="true">→</span>
          </div>
        )}
      </Body>
    </article>
  );
}
