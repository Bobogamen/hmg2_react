import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  Landmark,
  Wrench,
  RefreshCw,
  Building2,
  CalendarDays,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";
import { useUser } from "../../user/UserContext";
import { getFinanceOverview } from "../../api/services/financeService";
import "./Finance.css";

export default function Finance() {
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const label = (key) => t(`dashboard:financeOverview.${key}`);
  const [params, setParams] = useSearchParams();
  const condos = user?.condominiums || [];
  const selected = params.get("condominium") || String(condos[0]?.id || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [direction, setDirection] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const [allMonths, setAllMonths] = useState(false);
  const [movementLimit, setMovementLimit] = useState(50);
  useEffect(() => {
    setDirection("all");
    setSource("all");
    setSearch("");
    setAllMonths(false);
  }, [selected, user?.id]);
  useEffect(() => {
    let active = true;
    setResult(null);
    setError(false);
    if (selected)
      getFinanceOverview(selected, movementLimit)
        .then((data) => {
          if (active) setResult({ id: selected, data });
        })
        .catch(() => {
          if (active) setError(true);
        });
    return () => {
      active = false;
    };
  }, [selected, revision, user?.id, movementLimit]);
  const data = result?.id === selected ? result.data : null;
  const money = (value) =>
    "€ " +
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  const date = (value) =>
    value
      ? new Intl.DateTimeFormat(i18n.language).format(
          new Date(value + "T12:00:00"),
        )
      : "—";
  const monthName = (m) =>
    new Intl.DateTimeFormat(i18n.language, {
      month: "long",
      year: "numeric",
    }).format(new Date(m.year, m.number - 1, 1));
  const incomeTypes = ["fee", "income", "repairIncome"];
  const movements =
    data?.movements.filter(
      (m) =>
        (source === "all" || source === m.type) &&
        (direction === "all" ||
          (direction === "income") === incomeTypes.includes(m.type)) &&
        `${m.name} ${m.documentNumber || ""} ${label(m.type)} ${m.homeName || ""} ${m.accountName || ""} ${m.year || ""} ${m.ownerName || ""}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase()),
    ) || [];
  const sortedMonths = [...(data?.months || [])].sort(
    (a, b) => b.year - a.year || b.number - a.number,
  );
  const accounts = (kind) => (
    <section className="finance-panel">
      <h3>{label(kind)}</h3>
      {!data[kind].length ? (
        <p className="finance-muted">{label("noAccounts")}</p>
      ) : (
        data[kind].map((a) => (
          <article key={a.id} className="finance-account">
            <div className="finance-account-title">
              {a.archived ? (
                <strong>
                  {a.name} <small>{label("archived")}</small>
                </strong>
              ) : (
                <Link
                  to={`/${kind === "funds" ? "fund" : "repair"}/condominiums/${selected}/${kind}/${a.id}`}
                >
                  {a.name}
                </Link>
              )}
              <strong
                className={Number(a.balance) < 0 ? "finance-negative" : ""}
              >
                {money(a.balance)}
              </strong>
            </div>
            <div className="finance-account-meta">
              <span>
                {label("received")}: {money(a.income)}
              </span>
              <span>
                {label("spent")}: {money(a.expenses)}
              </span>
            </div>
          </article>
        ))
      )}
    </section>
  );
  return (
    <main className="finance-overview">
      <header className="finance-page-heading text-center text-bg-light w-100 rounded border border-2 border-dark p-3">
        <h2 className="fw-bold mb-2">
          <Wallet size={25} aria-hidden="true" />
          {label("title")}
        </h2>
        <p className="finance-intro mb-0 fw-semibold text-light-emphasis">
          {label("intro")}
        </p>
      </header>
      <div className="finance-header">
        {data && (
          <div className="finance-building-heading">
            <h3>{data.name}</h3>
            <p className="finance-muted mb-0">{data.address}</p>
          </div>
        )}
        <div className="finance-controls">
          {selected && (
            <Link
              className="btn btn-outline-primary finance-current-month"
              to={`/cashier/condominium/${selected}`}
            >
              <CalendarDays size={18} aria-hidden="true" />{" "}
            </Link>
          )}
          <label>
            {label("building")}
            <select
              className="form-select"
              value={selected}
              onChange={(e) => setParams({ condominium: e.target.value })}
            >
              {!condos.length && (
                <option value="">{label("noBuildings")}</option>
              )}
              {condos.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn btn-outline-secondary"
            disabled={!selected || (!data && !error)}
            onClick={() => setRevision((r) => r + 1)}
            aria-label={label("refresh")}
            title={label("refresh")}
          >
            <RefreshCw size={18} className="mb-1" />
          </button>
        </div>
      </div>
      {!selected ? (
        <p className="finance-panel">{label("noBuildings")}</p>
      ) : error ? (
        <div role="alert" className="alert alert-danger">
          {label("loadError")}{" "}
          <button
            className="btn btn-link"
            onClick={() => setRevision((r) => r + 1)}
          >
            {label("refresh")}
          </button>
        </div>
      ) : !data ? (
        <p role="status" className="finance-panel">
          {label("loading")}
        </p>
      ) : (
        <>
          <div className="finance-cards">
            {[
              ["total", Building2],
              ["cash", Wallet],
              ["fundBalance", Landmark],
              ["repairBalance", Wrench],
            ].map(([key, Icon]) => (
              <section
                key={key}
                className={`finance-card finance-card--${key}`}
              >
                <span>
                  <Icon size={19} aria-hidden="true" />
                  {label(key)}
                </span>
                <strong
                  className={Number(data[key]) < 0 ? "finance-negative" : ""}
                >
                  {money(data[key])}
                </strong>
                <small>{label(key + "Hint")}</small>
              </section>
            ))}
          </div>
          <div className="finance-context">
            <p>
              {label("scope")}{" "}
              {data.startDate && (
                <>
                  {label("since")} {date(data.startDate)}.
                </>
              )}
            </p>
          </div>
          <div className="finance-account-columns">
            {accounts("funds")}
            {accounts("repairs")}
          </div>
          <section className="finance-panel finance-ledger-panel">
            <div className="finance-section-toolbar">
              <h3>
                <CalendarDays size={21} aria-hidden="true" />
                {label("monthly")}
              </h3>
              <span className="finance-count">
                {label("monthCount")}: {data.months.length}
              </span>
            </div>
            <p className="finance-muted">{label("monthlyHint")}</p>
            {!data.months.length ? (
              <p>{label("noMonths")}</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover finance-months">
                    <caption className="visually-hidden">
                      {label("monthly")}
                    </caption>
                    <thead>
                      <tr>
                        {[
                          "month",
                          "received",
                          "allocated",
                          "spent",
                          "difference",
                          "carried",
                          "balance",
                          "status",
                        ].map((k) => (
                          <th key={k} scope="col">
                            {label(k)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMonths
                        .slice(0, allMonths ? undefined : 12)
                        .map((m) => (
                          <tr key={m.id}>
                            <th scope="row" className="text-capitalize">
                              {monthName(m)}
                            </th>
                            {[
                              m.income,
                              m.forFunds,
                              m.expenses,
                              m.difference,
                              m.carried,
                              m.balance,
                            ].map((v, i) => (
                              <td
                                key={i}
                                className={
                                  Number(v) < 0 ? "finance-negative" : ""
                                }
                              >
                                {money(v)}
                              </td>
                            ))}
                            <td>
                              <span
                                className={`finance-status ${m.completed ? "is-closed" : "is-open"}`}
                              >
                                {label(m.completed ? "closed" : "open")}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {data.months.length > 12 && (
                  <button
                    className="btn btn-outline-secondary finance-month-toggle"
                    aria-expanded={allMonths}
                    onClick={() => setAllMonths((v) => !v)}
                  >
                    {label(allMonths ? "fewerMonths" : "allMonths")}
                  </button>
                )}
              </>
            )}
          </section>
          <section className="finance-panel finance-ledger-panel">
            <div className="finance-section-toolbar">
              <h3>
                <ReceiptText size={21} aria-hidden="true" />
                {label("recent")}
              </h3>
              <span className="finance-count">
                {label("shown")}: {movements.length}
              </span>
            </div>
            <p className="finance-muted">{t("dashboard:financeOverview.recentHint", { limit: movementLimit })}</p>
            <div className="finance-filters">
              <label>{label("movementLimit")}
                <select className="form-select" value={movementLimit} onChange={(e) => setMovementLimit(Number(e.target.value))}>
                  {[50, 100, 200].map((limit) => <option key={limit} value={limit}>{t("dashboard:financeOverview.lastOperations", { limit })}</option>)}
                </select>
              </label>
              <label>
                {label("source")}
                <select
                  aria-label={label("source")}
                  className="form-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  {[
                    "all",
                    "fee",
                    "income",
                    "bill",
                    "expense",
                    "fundExpense",
                    "repairIncome",
                    "repairExpense",
                  ].map((key) => (
                    <option key={key} value={key}>
                      {label(key === "all" ? "allSources" : key)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {label("filter")}
                <select
                  aria-label={label("filter")}
                  className="form-select"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                >
                  {["all", "income", "expense"].map((k) => (
                    <option key={k} value={k}>
                      {label(k)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="finance-search">
                {label("searchLabel")}
                <input
                  type="search"
                  className="form-control"
                  aria-label={label("search")}
                  placeholder={label("search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <div
              className="finance-section-toolbar finance-muted"
              role="status"
            >
              <span>
                {label("shown")}: {movements.length} / {data.movements.length}
              </span>
              {(direction !== "all" || source !== "all" || search) && (
                <button
                  className="btn btn-link btn-sm"
                  onClick={() => {
                    setDirection("all");
                    setSource("all");
                    setSearch("");
                  }}
                >
                  {label("clearFilters")}
                </button>
              )}
            </div>
            {!movements.length ? (
              <p className="finance-empty">
                {label(data.movements.length ? "noMatches" : "noMovements")}
              </p>
            ) : (
              <ul className="finance-movements">
                {movements.map((m) => {
                  const incoming = incomeTypes.includes(m.type);
                  return (
                    <li
                      key={`${m.type}-${m.id}`}
                      className={incoming ? "is-income" : "is-expense"}
                    >
                      <span
                        className="finance-direction-icon"
                        aria-hidden="true"
                      >
                        {incoming ? (
                          <ArrowDownLeft size={21} />
                        ) : (
                          <ArrowUpRight size={21} />
                        )}
                      </span>
                      <div className="finance-movement-main">
                        <div className="finance-movement-tags">
                          <span className="finance-status finance-direction-label">
                            {label(incoming ? "income" : "expense")}
                          </span>
                          <span
                            className={`finance-source-label source-${m.type}`}
                          >
                            {label(m.type)}
                          </span>
                        </div>
                        <strong className="finance-operation-name">
                          {m.name || label(m.type)}
                        </strong>
                        {(m.homeName != null ||
                          m.accountName ||
                          (m.year && m.number)) && (
                          <div className="finance-operation-context">
                            {m.homeName != null && (
                              <span>
                                <Building2 size={16} aria-hidden="true" />
                                {m.floor != null && (
                                  <>
                                    {" "}
                                    · {label("floor")}: <b>{m.floor}</b>
                                  </>
                                )}
                                {label("apt")}: <b>{m.homeName}</b>
                              </span>
                            )}
                            {m.year && m.number && (
                              <span>
                                <CalendarDays size={16} aria-hidden="true" />
                                {label("accountingMonth")}:{" "}
                                <b>{monthName(m)}</b>
                              </span>
                            )}
                            {m.accountName && (
                              <span>
                                {label(
                                  m.type === "fundExpense"
                                    ? "fundAccount"
                                    : "repairAccount",
                                )}
                                : <b>{m.accountName}</b>
                              </span>
                            )}
                          </div>
                        )}
                        <dl className="finance-movement-details">
                          <div>
                            <dt>{label("recordedDate")}</dt>
                            <dd>{date(m.date)}</dd>
                          </div>
                          {m.type === "fee" ? (
                            <div>
                              <dt>{t("home:owner")}</dt>
                              <dd>{m.ownerName || label("notProvided")}</dd>
                            </div>
                          ) : (
                            <div>
                              <dt>{label("document")}</dt>
                              <dd>{m.documentNumber || label("notProvided")}</dd>
                            </div>
                          )}
                          {m.type !== "fee" && m.documentDate && (
                            <div>
                              <dt>{label("documentDate")}</dt>
                              <dd>{date(m.documentDate)}</dd>
                            </div>
                          )}
                          {m.installmentNumber != null && (
                            <div>
                              <dt>{label("installment")}</dt>
                              <dd>№ {m.installmentNumber}</dd>
                            </div>
                          )}
                          {m.unitValue != null && m.quantity != null && (
                            <div>
                              <dt>{label("calculation")}</dt>
                              <dd>
                                {money(m.unitValue)} × {m.quantity}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                      <strong
                        className={`finance-operation-amount ${incoming ? "finance-positive" : "finance-negative"}`}
                      >
                        {incoming ? "+" : "−"}
                        {money(m.value)}
                      </strong>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
