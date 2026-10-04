import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, MapPin } from "lucide-react";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import { formatDate } from "../../utils/formatDate";
import { getCondominium } from "../../api/services/managementService";
import profile_edit from "../../assets/images/app/profile_edit.png";
import "./Profile.css";

const metrics = ["homes", "fees", "bills", "funds", "repairs"];

function CondominiumOverview({ condominium }) {
  const { t, i18n } = useTranslation(["profile", "common", "condo"]);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setResult(null);
    setFailed(false);
    getCondominium(condominium.id)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [condominium.id, attempt]);

  const building = result || condominium;
  return (
    <article
      className="profile-building card h-100"
      style={{ borderTopColor: building.backgroundColor || "#367187" }}
    >
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 mb-3">
          <Building2
            size={28}
            className="text-secondary flex-shrink-0"
            aria-hidden="true"
          />
          <h3 className="h5 mb-0 text-break">{building.name}</h3>
        </div>
        <p className="profile-building-detail">
          <MapPin size={17} aria-hidden="true" />
          <span>
            {[building.city, building.address].filter(Boolean).join(", ") ||
              t("profile:noAddress")}
          </span>
        </p>
        <p className="profile-building-detail">
          <CalendarDays size={17} aria-hidden="true" />
          <span>
            {t("condo:startDate")}:{" "}
            {building.startDate
              ? formatDate(building.startDate + "T12:00:00", i18n.language)
              : "—"}
          </span>
        </p>
        {failed ? (
          <div className="alert alert-warning" role="alert">
            <p className="mb-2">{t("profile:loadError")}</p>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => setAttempt((value) => value + 1)}
            >
              {t("profile:retry")}
            </button>
          </div>
        ) : !result ? (
          <p role="status" className="text-muted">
            <Spinner as="span" animation="border" size="sm" className="me-2" aria-hidden="true" />
            {t("profile:loading")}
          </p>
        ) : (
          <dl className="profile-building-metrics">
            {metrics.map((key) => (
              <div key={key}>
                <dt>{t("profile:counts." + key)}</dt>
                <dd>{Array.isArray(result[key]) ? result[key].length : "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}

export default function Profile() {
  const { user } = useUser();
  const { t, i18n } = useTranslation(["common", "profile", "condo"]);
  if (!user)
    return (
      <p className="container py-4" role="status">
        <Spinner as="span" animation="border" size="sm" className="me-2" aria-hidden="true" />
        {t("profile:loading")}
      </p>
    );
  const condominiums = user.condominiums || [];
  const manager = user.roles?.some((role) =>
    ["ADMIN", "MANAGER"].includes(role),
  );
  return (
    <main className="container py-4 profile-page">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <section className="card my-4 shadow border-0 rounded-4" aria-labelledby="profile-info-title">
            <h1 id="profile-info-title" className="card-header bg-secondary bg-opacity-75 text-white text-center fw-bold rounded-top-4 fs-6">
              {t("profile:title")}
            </h1>
            <div className="card-body text-center">
              <p className="mb-2"><strong>{t("name")}:</strong> {user.name}</p>
              <p className="mb-2 text-break"><strong>{t("email")}:</strong> {user.email}</p>
              <p className="mb-2"><strong>{t("profile:registeredOn")}</strong> {formatDate(user.registeredOn, i18n.language)}</p>
              <p className="mb-2">
                <strong>{t("roles")}:</strong>{" "}
                {(user.roles || []).map(role => {
                  const roleKey = role.toLowerCase();
                  const style = {
                    admin: "text-bg-primary bg-opacity-75",
                    manager: "text-bg-danger bg-opacity-50",
                    cashier: "text-bg-dark bg-opacity-50",
                  }[roleKey] || "text-bg-secondary";
                  return <span key={role} className={"badge " + style + " mx-1"}>{t("profile:" + roleKey)}</span>;
                })}
              </p>
              <div className="mt-3 d-flex justify-content-center">
                <Link className="img-button pointer text-decoration-none text-reset" to="/profile/edit">
                  <img src={profile_edit} className="icon" alt="" />
                  <span className="ms-2">{t("edit")}</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <section aria-labelledby="profile-buildings-title">
        <div className="bg-success bg-opacity-75 text-white rounded-top-4 p-3 mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 id="profile-buildings-title" className="fs-6 mb-0 fw-bold text-center flex-grow-1">
            {t("condo:title")}
          </h2>
          <span className="badge bg-light text-success fs-6 px-3 py-2 shadow-sm">
            {user.condominiumLimit <= 0
              ? t("profile:unlimited")
              : user.condominiumLimit != null
                ? `${condominiums.length} / ${user.condominiumLimit}`
                : condominiums.length}
          </span>
        </div>
        {condominiums.length ? (
          <div className="row g-3">
            {condominiums.map((condominium) => (
              <div className="col-12 col-xl-6" key={condominium.id}>
                <CondominiumOverview
                  condominium={condominium}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="card card-body text-center py-5">
            <p>{t("condo:noneAddedCondo")}</p>
            {manager && (
              <Link
                className="btn btn-primary align-self-center"
                to="/management"
              >
                {t("profile:openManagement")}
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
