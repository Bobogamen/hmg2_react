import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  getCashierMonths,
  getCashierMonth,
  payCashierHomeFees,
} from "../../api/services/cashierService";
import { useLoading } from "../../loader/LoadingContext";
import { useUser } from "../../user/UserContext";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import Breadcrumbs from "../breadcrumb/Breadcrumbs";
import AccountingPeriodNotice from "../management/AccountingPeriodNotice";
import apartments from "../../assets/images/app/apartment_building.png";
import cashierIcon from "../../assets/images/app/cashier..png";
import "./CashierAccounting.css";

const keyOfMonth = (month) =>
  `${month.year}-${String(month.number).padStart(2, "0")}`;

export default function CashierAccounting() {
  const { condominiumId } = useParams();
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const { setIsLoading } = useLoading();
  const { user } = useUser();
  const { setBreadcrumbs } = useBreadcrumb();
  const [overview, setOverview] = useState(null);
  const [monthId, setMonthId] = useState("");
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null);
  const [payError, setPayError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("allHomes");
  const submitting = useRef(false);
  const requests = useRef(0);
  const overviewRequests = useRef(0);
  const invalidateAll = useCallback(() => {
    ++overviewRequests.current;
    ++requests.current;
  }, []);
  const manager = user?.roles?.some((role) =>
    ["MANAGER", "ADMIN"].includes(role),
  );
  const money = (value) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);
  const date = (value) =>
    value
      ? new Intl.DateTimeFormat(i18n.language).format(
          new Date(`${value}T12:00:00`),
        )
      : "—";
  const monthName = (month) =>
    new Intl.DateTimeFormat(i18n.language, {
      month: "long",
      year: "numeric",
    }).format(new Date(month.year, month.number - 1, 1));
  const label = (key) => t(`cashierAccounting.${key}`);

  const loadOverview = useCallback(async () => {
    const requestId = ++overviewRequests.current;
    setIsLoading(true);
    setError(false);
    try {
      const data = await getCashierMonths(condominiumId);
      if (requestId !== overviewRequests.current) return;
      setOverview(data);
      const current = data.months.find(
        (month) => keyOfMonth(month) === data.currentMonth,
      );
      setMonthId((previous) =>
        data.months.some((month) => String(month.id) === previous)
          ? previous
          : String((current || data.months[data.months.length - 1])?.id || ""),
      );
    } catch {
      if (requestId === overviewRequests.current) setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [condominiumId, setIsLoading]);

  useEffect(() => {
    setOverview(null);
    setDetails(null);
    setMonthId("");
    setModal(null);
    loadOverview();
    return invalidateAll;
  }, [loadOverview, invalidateAll]);

  const loadMonth = useCallback(async () => {
    if (!monthId || Number(overview?.condominiumId) !== Number(condominiumId))
      return;
    const requestId = ++requests.current;
    setIsLoading(true);
    setError(false);
    setDetails(null);
    try {
      const data = await getCashierMonth(condominiumId, monthId);
      if (requestId === requests.current) setDetails(data);
    } catch {
      if (requestId === requests.current) setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [condominiumId, monthId, overview?.condominiumId, setIsLoading]);

  useEffect(() => {
    setModal(null);
    loadMonth();
  }, [loadMonth]);
  useEffect(() => {
    setBreadcrumbs([
      { label: t("cashier"), path: "/cashier" },
      { label: overview?.name || t("cashier"), color: overview?.backgroundColor },
    ]);
    return () => setBreadcrumbs([]);
  }, [overview?.name, overview?.backgroundColor, setBreadcrumbs, t]);

  const activeHome = details?.homes.find((home) => home.id === modal?.homeId);
  const open = (home, mode) => {
    setPayError("");
    setModal({ homeId: home.id, mode });
  };
  const pay = async () => {
    if (submitting.current || !activeHome || details.month.completed) return;
    submitting.current = true;
    setSaving(true);
    setIsLoading(true);
    setPayError("");
    const requestId = ++requests.current;
    try {
      const data = await payCashierHomeFees(
        condominiumId,
        details.month.id,
        activeHome.id,
        Number(activeHome.due).toFixed(2),
      );
      if (requestId === requests.current) {
        setDetails(data);
        setModal(null);
      }
    } catch (failure) {
      const reason = failure.response?.data?.message;
      const known = [
        "homeFeesChanged",
        "homeFeesAlreadyPaid",
        "accountingMonthCompleted",
        "feeNotAssignedToFund",
      ];
      setPayError(known.includes(reason) ? reason : "paymentError");
    } finally {
      submitting.current = false;
      setSaving(false);
      setIsLoading(false);
    }
  };

  const total = (field) =>
    details?.homes.reduce((sum, home) => sum + Number(home[field]), 0) || 0;
  const allHomes = details?.homes || [];
  const paidCount = allHomes.filter(
    (home) => Number(home.due) === 0 && Number(home.paid) > 0,
  ).length;
  const dueCount = allHomes.filter((home) => Number(home.due) > 0).length;
  const visibleHomes = allHomes.filter((home) => {
    const matchesStatus =
      filter === "allHomes" ||
      (filter === "unpaidHomes"
        ? Number(home.due) > 0
        : Number(home.due) === 0 && Number(home.paid) > 0);
    return (
      matchesStatus &&
      `${home.floor} ${home.name} ${home.owner || ""}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase())
    );
  });
  const monthIndex =
    overview?.months.findIndex((month) => String(month.id) === monthId) ?? -1;
  const currentMonth = overview?.months.find(
    (month) => keyOfMonth(month) === overview.currentMonth,
  );
  const progress =
    total("total") > 0
      ? Math.min(100, Math.round((total("paid") / total("total")) * 100))
      : 0;
  return (
    <div className="container-fluid py-2">
      <Breadcrumbs />
      <header className="cashier-accounting-header">
        <div className="hg-title cashier-accounting-heading">
          <img src={apartments} width="48" height="48" alt="" />
          <div>
            <h2>{overview?.name || label("title")}</h2>
            <p>{label("title")}</p>
          </div>
        </div>
        <Link
          to="/cashier"
          className="hg-title cashier-accounting-back"
          aria-label={label("backToCashier")}
          title={label("backToCashier")}
        >
          <img src={cashierIcon} width="42" height="42" alt="" />
          <span>{label("backToCashier")}</span>
        </Link>
      </header>
      {details && (
        <div className="cashier-summary-cards">
          <div className="cashier-summary-card">
            <span>{label("total")}</span>
            <strong>{money(total("total"))}</strong>
            <small>
              {allHomes.length} {label("homes")}
            </small>
          </div>
          <div className="cashier-summary-card cashier-summary-card--paid">
            <span>{label("paid")}</span>
            <strong>{money(total("paid"))}</strong>
            <small>
              {paidCount} {label("paidHomes")}
            </small>
          </div>
          <div className="cashier-summary-card cashier-summary-card--due">
            <span>{label("due")}</span>
            <strong>{money(total("due"))}</strong>
            <small>
              {dueCount} {label("unpaidHomes")}
            </small>
          </div>
        </div>
      )}
      {manager && overview && (
        <AccountingPeriodNotice
          condominiumId={condominiumId}
          onGenerated={loadOverview}
        />
      )}
      {error && (
        <div role="alert" className="alert alert-danger">
          {label("loadError")}{" "}
          <button
            className="btn btn-outline-dark"
            onClick={overview && monthId ? loadMonth : loadOverview}
          >
            {label("retry")}
          </button>
        </div>
      )}
      {overview && overview.months.length === 0 && (
        <p role="status" className="alert alert-info">
          {label("noMonths")}
        </p>
      )}
      {overview?.months.length > 0 && (
        <div className="cashier-accounting-layout">
          <section className="cashier-homes-panel" aria-label={label("homes")}>
            <div className="cashier-panel-heading">
              <div>
                <h3>{label("homes")}</h3>
                <p>{details ? monthName(details.month) : label("loading")}</p>
              </div>
              <span className="cashier-count">
                {visibleHomes.length} / {allHomes.length}
              </span>
            </div>
            <div className="cashier-table-tools">
              <input
                type="search"
                className="form-control"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={label("searchHomes")}
                aria-label={label("searchHomes")}
              />
              <div
                className="cashier-status-filters"
                role="group"
                aria-label={label("filterHomes")}
              >
                {["allHomes", "unpaidHomes", "paidHomes"].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {label(value)}
                  </button>
                ))}
              </div>
            </div>
            {details && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle cashier-homes-table">
                  <thead>
                    <tr>
                      {["floor", "home", "owner", "total", "paidDate"].map(
                        (key) => (
                          <th key={key} scope="col">
                            {label(key)}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleHomes.map((home) => (
                      <tr
                        key={home.id}
                        className={
                          Number(home.due) === 0 && home.paidDate
                            ? "cashier-row-paid"
                            : ""
                        }
                      >
                        <td>{home.floor}</td>
                        <td className="fw-bold">{home.name}</td>
                        <td>{home.owner || "—"}</td>
                        <td className="text-nowrap text-end fw-semibold">
                          {money(home.total)}
                          {Number(home.paid) > 0 && Number(home.due) > 0 && (
                            <small className="cashier-remaining">
                              {label("due")}: {money(home.due)}
                            </small>
                          )}
                        </td>
                        <td>
                          {home.paidDate && (
                            <button
                              className="cashier-receipt-button"
                              title={label("viewReceipt")}
                              aria-haspopup="dialog"
                              onClick={() => open(home, "receipt")}
                            >
                              {date(home.paidDate)}
                            </button>
                          )}
                          {Number(home.due) > 0 && (
                            <button
                              className="btn btn-primary btn-sm cashier-pay-button"
                              aria-haspopup="dialog"
                              disabled={details.month.completed}
                              onClick={() => open(home, "pay")}
                            >
                              {label("pay")}
                            </button>
                          )}
                          {!home.paidDate && Number(home.due) === 0 && (
                            <span className="text-muted">
                              {label("noFees")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={3}>{label("periodTotal")}</th>
                      <th>{money(total("total"))}</th>
                      <td />
                    </tr>
                  </tfoot>
                </table>
                {!visibleHomes.length && (
                  <div className="cashier-empty-result">
                    <p>{label(allHomes.length ? "noResults" : "noHomes")}</p>
                    {allHomes.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setSearch("");
                          setFilter("allHomes");
                        }}
                      >
                        {label("clearFilters")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
          <aside className="cashier-month-panel">
            <div className="cashier-panel-heading">
              <h3>{label("month")}</h3>
              <span
                className={`cashier-month-state ${details?.month.completed ? "is-closed" : ""}`}
              >
                {label(
                  details?.month.completed ? "closedStatus" : "openStatus",
                )}
              </span>
            </div>
            <label htmlFor="cashier-month" className="fw-bold mb-2">
              {label("month")}
            </label>
            <select
              id="cashier-month"
              className="form-select mb-3"
              value={monthId}
              disabled={saving}
              onChange={(event) => setMonthId(event.target.value)}
            >
              {overview.months.map((month) => (
                <option key={month.id} value={month.id}>
                  {monthName(month)}
                </option>
              ))}
            </select>
            <div className="cashier-month-navigation">
              <button
                type="button"
                className="btn btn-light border"
                disabled={saving || monthIndex <= 0}
                onClick={() =>
                  setMonthId(String(overview.months[monthIndex - 1].id))
                }
                aria-label={label("previousMonth")}
                title={label("previousMonth")}
              >
                ‹
              </button>
              <button
                type="button"
                className="btn btn-light border"
                disabled={
                  saving || !currentMonth || String(currentMonth.id) === monthId
                }
                onClick={() => setMonthId(String(currentMonth.id))}
              >
                {label("currentMonth")}
              </button>
              <button
                type="button"
                className="btn btn-light border"
                disabled={
                  saving ||
                  monthIndex < 0 ||
                  monthIndex >= overview.months.length - 1
                }
                onClick={() =>
                  setMonthId(String(overview.months[monthIndex + 1].id))
                }
                aria-label={label("nextMonth")}
                title={label("nextMonth")}
              >
                ›
              </button>
            </div>
            {!overview.months.some(
              (month) => keyOfMonth(month) === overview.currentMonth,
            ) && (
              <p className="alert alert-warning">
                {label("currentMonthMissing")}
              </p>
            )}
            {details?.month.completed && (
              <p className="alert alert-info">{label("closed")}</p>
            )}
            <div className="cashier-collection">
              <div>
                <span>{label("collection")}</span>
                <strong>{progress}%</strong>
              </div>
              <div
                className="progress"
                role="progressbar"
                aria-label={label("collection")}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p>{label("paymentHint")}</p>
            </div>
          </aside>
        </div>
      )}
      <Modal
        show={!!activeHome}
        onHide={() => {
          if (!submitting.current) setModal(null);
        }}
        centered
        size="lg"
        backdrop={saving ? "static" : true}
        keyboard={!saving}
        className="cashier-payment-modal"
        aria-labelledby="cashier-payment-title"
      >
        <Modal.Header closeButton={!saving}>
          <Modal.Title className="fs-5" id="cashier-payment-title">
            {modal?.mode === "pay" ? label("payTitle") : label("receiptTitle")}{" "}
            — {activeHome?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeHome && (
            <>
              <p className="fw-semibold">
                {activeHome.owner} · {monthName(details.month)}
              </p>
              {payError && (
                <div role="alert" className="alert alert-danger">
                  {label(payError)}{" "}
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => {
                      setModal(null);
                      loadMonth();
                    }}
                  >
                    {label("refresh")}
                  </button>
                </div>
              )}
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead>
                    <tr>
                      {[
                        "fee",
                        "value",
                        "times",
                        "total",
                        ...(modal.mode === "receipt" ? ["paidDate"] : []),
                      ].map((key) => (
                        <th key={key}>{label(key)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(modal.mode === "pay"
                      ? activeHome.charges
                      : activeHome.receipts
                    ).map((item) => (
                      <tr key={item.homeFeeId || item.id}>
                        <td>{item.name}</td>
                        <td>{money(item.value)}</td>
                        <td>{item.times}</td>
                        <td>{money(item.amount)}</td>
                        {modal.mode === "receipt" && (
                          <td>{date(item.paidDate)}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={3}>{label("total")}</th>
                      <th>
                        {money(
                          modal.mode === "pay"
                            ? activeHome.due
                            : activeHome.paid,
                        )}
                      </th>
                      {modal.mode === "receipt" && <td />}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => setModal(null)}
          >
            {t("common:close")}
          </Button>
          {modal?.mode === "pay" && (
            <Button disabled={saving || !!payError} onClick={pay}>
              {label("payAll")} {money(activeHome?.due)}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
