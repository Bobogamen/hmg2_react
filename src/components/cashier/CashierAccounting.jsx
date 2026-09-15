import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  getCashierMonths,
  getCashierMonth,
  payCashierHomeFees,
  getCashierFinance,
} from "../../api/services/cashierService";
import { useLoading } from "../../loader/LoadingContext";
import { useUser } from "../../user/UserContext";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import Breadcrumbs from "../breadcrumb/Breadcrumbs";
import AccountingPeriodNotice from "../management/AccountingPeriodNotice";
import CashierCondominiumCard from "./CashierCondominiumCard";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Wallet,
  ReceiptText,
  Printer,
  CalendarDays,
  LockKeyhole,
  LockKeyholeOpen,
} from "lucide-react";
import "./CashierAccounting.css";
import "./CashierManagement.css";
import CashierFinancePanel from "./CashierFinancePanel";

const keyOfMonth = (month) =>
  `${month.year}-${String(month.number).padStart(2, "0")}`;

const feeOrder = (fee) =>
  fee.fund ? 3 : fee.primary ? 0 : fee.monthly ? 1 : 2;
const feePresentation = (fee) =>
  fee.fund
    ? { emoji: "💰", label: "fund" }
    : fee.primary
      ? { emoji: "⭐", label: "primary" }
      : fee.monthly
        ? { emoji: "📅", label: "monthlyFee" }
        : { emoji: "💶", label: "oneTimeFee" };

export default function CashierAccounting() {
  const { condominiumId } = useParams();
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const { setIsLoading } = useLoading();
  const { user } = useUser();
  const { setBreadcrumbs } = useBreadcrumb();
  const [overview, setOverview] = useState(null);
  const [monthId, setMonthId] = useState("");
  const [details, setDetails] = useState(null);
  const [finance, setFinance] = useState(null);
  const [closeActionContainer, setCloseActionContainer] = useState(null);
  const [financeError, setFinanceError] = useState(false);
  const selection = useRef("");
  selection.current = `${condominiumId}:${monthId}`;
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
    "€ " +
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
    setFinance(null);
    setFinanceError(false);
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
    setFinance(null);
    setFinanceError(false);
    try {
      const data = await getCashierMonth(condominiumId, monthId);
      if (requestId === requests.current) setDetails(data);
      try {
        const financialData = await getCashierFinance(condominiumId, monthId);
        if (requestId === requests.current) setFinance(financialData);
      } catch {
        if (requestId === requests.current) setFinanceError(true);
      }
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
      {
        label: overview?.name || t("cashier"),
        color: overview?.backgroundColor,
      },
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
        try {
          const financialData = await getCashierFinance(
            condominiumId,
            data.month.id,
          );
          if (requestId === requests.current) {
            setFinance(financialData);
            setFinanceError(false);
          }
        } catch {
          if (requestId === requests.current) setFinanceError(true);
        }
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
  const currentMonth = overview?.months.find(
    (month) => keyOfMonth(month) === overview.currentMonth,
  );
  const progress =
    total("total") > 0
      ? Math.min(100, Math.round((total("paid") / total("total")) * 100))
      : 0;
  const monthIndex =
    overview?.months.findIndex((month) => String(month.id) === monthId) ?? -1;
  return (
    <div className="container-fluid py-2 cashier-accounting cashier-management">
      <Breadcrumbs />
      <header className="cashier-accounting-header">
        <CashierCondominiumCard
          heading
          condominium={{
            ...user?.condominiums?.find((item) => String(item.id) === String(condominiumId)),
            ...overview,
            name: overview?.name || label("title"),
          }}
        />
        {overview?.months.length > 0 && (
          <section
            className="cashier-month-panel cashier-collection-panel"
            aria-label={label("collection")}
          >
            <div className="cashier-panel-heading">
              <div>
                <h3>
                  <Wallet size={21} aria-hidden="true" /> {label("collection")}
                </h3>
                <p>{details ? monthName(details.month) : label("loading")}</p>
              </div>
            </div>
            {details && (
              <>
                <div className="cashier-collected-total">
                  <span>{label("collectedIncome")}</span>
                  <strong>{money(total("paid"))}</strong>
                  <small>
                    {paidCount} / {allHomes.length} {label("paidHomes")}
                  </small>
                </div>
                <dl className="cashier-summary-ledger">
                  <div>
                    <dt>{label("chargedFees")}</dt>
                    <dd>{money(total("total"))}</dd>
                  </div>
                  <div className="cashier-summary-ledger__due">
                    <dt>{label("due")}</dt>
                    <dd>{money(total("due"))}</dd>
                  </div>
                </dl>
              </>
            )}
            {details && (
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
              </div>
            )}
          </section>
        )}
      </header>
      {overview?.months.length > 0 && (
        <div className="cashier-period-toolbar">
          <div className="cashier-period-picker">
            <button
              type="button"
              disabled={saving || monthIndex <= 0}
              onClick={() =>
                setMonthId(String(overview.months[monthIndex - 1].id))
              }
              aria-label={label("previousMonth")}
              title={label("previousMonth")}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <select
              id="cashier-month"
              className="cashier-period-select"
              value={monthId}
              disabled={saving}
              onChange={(event) => setMonthId(event.target.value)}
              aria-label={label("month")}
            >
              {overview.months.map((month) => (
                <option key={month.id} value={month.id}>
                  {monthName(month)}
                </option>
              ))}
            </select>
            <button
              type="button"
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
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            className="cashier-current-month"
            title={label("currentMonth")}
            aria-label={label("currentMonth")}
            disabled={
              saving || !currentMonth || String(currentMonth.id) === monthId
            }
            onClick={() => setMonthId(String(currentMonth.id))}
          >
            <CalendarDays size={19} aria-hidden="true" />
          </button>
          {details && (
            <span
              className={`cashier-month-state ${details.month.completed ? "is-closed" : ""}`}
              title={label(
                details.month.completed ? "closedStatus" : "openStatus",
              )}
              aria-label={label(
                details.month.completed ? "closedStatus" : "openStatus",
              )}
            >
              {details.month.completed ? (
                <LockKeyhole size={19} aria-hidden="true" />
              ) : (
                <LockKeyholeOpen size={19} aria-hidden="true" />
              )}
            </span>
          )}
          <span
            ref={setCloseActionContainer}
            className="cashier-close-action"
          />
          {details && (
            <Link
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center cashier-print-link"
              to={`/print?condominium=${condominiumId}&month=${monthId}`}
              title={t("dashboard:printPage.print")}
              aria-label={t("dashboard:printPage.print")}
            >
              <Printer size={20} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
      {overview?.months.length > 0 && !currentMonth && (
        <p className="alert alert-warning">{label("currentMonthMissing")}</p>
      )}
      {details?.month.completed && (
        <p className="alert alert-info">{label("closed")}</p>
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
          <section
            className="cashier-homes-panel"
            aria-label={label("homes")}
            aria-busy={!details && !error}
          >
            <div className="cashier-panel-heading">
              <div>
                <h3 id="cashier-homes-heading" tabIndex={-1}>
                  <ReceiptText size={21} aria-hidden="true" />{" "}
                  {label("payments")}
                </h3>
                <p>{details ? monthName(details.month) : label("loading")}</p>
              </div>
              <span className="cashier-count">
                {visibleHomes.length} / {allHomes.length}
              </span>
            </div>
            <div className="cashier-table-tools">
              <div className="cashier-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  className="form-control"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={label("searchHomes")}
                  aria-label={label("searchHomes")}
                />
              </div>
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
                    <span className="cashier-filter-count" aria-hidden="true">
                      {value === "allHomes"
                        ? allHomes.length
                        : value === "unpaidHomes"
                          ? dueCount
                          : paidCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {!details && !error && (
              <p role="status" className="cashier-loading">
                {label("loading")}
              </p>
            )}
            {details && (
              <div className="table-responsive">
                <table className="table table-sm table-bordered table-striped table-hover align-middle cashier-homes-table">
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
                        <td data-label={label("floor")}>{home.floor}</td>
                        <td data-label={label("home")} className="fw-bold">
                          {home.name}
                        </td>
                        <td data-label={label("owner")}>{home.owner || "—"}</td>
                        <td
                          data-label={label("total")}
                          className="text-nowrap fw-semibold"
                        >
                          {money(home.total)}
                          {Number(home.paid) > 0 && Number(home.due) > 0 && (
                            <small className="cashier-remaining">
                              {label("due")}: {money(home.due)}
                            </small>
                          )}
                        </td>
                        <td data-label={label("paidDate")}>
                          {home.paidDate && Number(home.due) === 0 && (
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
                      <th colSpan={3}>{label("total")}</th>
                      <th>
                        {money(
                          visibleHomes.reduce(
                            (sum, home) => sum + Number(home.total),
                            0,
                          ),
                        )}
                      </th>
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
          {/* RIGHT SIDE PANEL */}
          <aside className="cashier-right-column" aria-label={label("summary")}>
            <CashierFinancePanel
              key={`${condominiumId}:${monthId}`}
              finance={finance}
              condominiumName={overview?.name}
              closeActionContainer={closeActionContainer}
              homesPaid={!!details && dueCount === 0}
              error={financeError}
              condominiumId={condominiumId}
              onRefresh={loadMonth}
              onMonthSelect={setMonthId}
              onSaved={(result) => {
                if (
                  `${result.summary.condominiumId}:${result.summary.id}` ===
                  selection.current
                )
                  setFinance(result);
              }}
            />
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
            {details?.month && <>— {monthName(details.month)}</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeHome && (
            <>
              <p className="fw-semibold text-break mb-1">
                {activeHome.owner || "—"}
              </p>
              <div className="d-flex flex-wrap gap-3 text-muted small mb-3">
                <span>
                  {t("home:floor")}:{" "}
                  <strong className="text-dark">
                    {activeHome.floor ?? "—"}
                  </strong>
                </span>
                <span>
                  {label("home")}:{" "}
                  <strong className="text-dark">
                    {activeHome.name || "—"}
                  </strong>
                </span>
              </div>
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
                      {["fee", "value", "times", "total"].map((key) => (
                        <th key={key}>{label(key)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(modal.mode === "pay"
                      ? activeHome.charges
                      : activeHome.receipts
                    )
                      .slice()
                      .sort((a, b) => feeOrder(a) - feeOrder(b))
                      .map((item) => (
                        <tr key={item.homeFeeId || item.id}>
                          <td>
                            <div className="d-flex align-items-start gap-2">
                              <span
                                title={t(
                                  `finance:${feePresentation(item).label}`,
                                )}
                                aria-label={t(
                                  `finance:${feePresentation(item).label}`,
                                )}
                                role="img"
                              >
                                {feePresentation(item).emoji}
                              </span>
                              <div className="text-start">
                                <div>{item.name}</div>
                                {item.fund && item.fundName && (
                                  <div className="small fst-italic text-muted">
                                    {t("finance:fund")} &quot;{item.fundName}
                                    &quot;
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{money(item.value)}</td>
                          <td>{item.times}</td>
                          <td>{money(item.amount)}</td>
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
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => setModal(null)}
          >
            {t("common:close")}
          </Button>
          {modal?.mode === "pay" && (
            <Button disabled={saving || !!payError} onClick={pay}>
              {label("pay")}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
