import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wallet, Landmark, Wrench, RefreshCw, Building2 } from "lucide-react";
import { useUser } from "../../user/UserContext";
import { getFinanceOverview } from "../../api/services/financeService";
import "./Finance.css";
import { downloadCsv } from "./financeExport";

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
  useEffect(() => {
    let active = true;
    setResult(null);
    setError(false);
    setDirection("all");
    setSource("all");
    setSearch("");
    setAllMonths(false);
    if (selected)
      getFinanceOverview(selected)
        .then((data) => {
          if (active) setResult({ id: selected, data });
        })
        .catch(() => {
          if (active) setError(true);
        });
    return () => {
      active = false;
    };
  }, [selected, revision, user?.id]);
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
        `${m.name} ${m.documentNumber || ""} ${label(m.type)}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase()),
    ) || [];
  const exportMonths = () => downloadCsv(`finance-${selected}-months.csv`, [
    ["building", "month", "income_EUR", "funds_EUR", "expenses_EUR", "difference_EUR", "carried_EUR", "balance_EUR", "status"],
    ...data.months.map(m => [data.name, `${m.year}-${String(m.number).padStart(2, "0")}`,
      ...[m.income, m.forFunds, m.expenses, m.difference, m.carried, m.balance].map(Number),
      label(m.completed ? "closed" : "open")]),
  ]);
  const exportMovements = () => downloadCsv(`finance-${selected}-recent-filtered.csv`, [
    ["building", "type", "name", "amount_EUR", "recorded_date", "document_number", "document_date"],
    ...movements.map(m => [data.name, label(m.type), m.name,
      Number(m.value) * (incomeTypes.includes(m.type) ? 1 : -1), m.date, m.documentNumber, m.documentDate]),
  ]);
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
      <header className="finance-header">
        <div>
          <p className="finance-muted">{label("title")}</p>
          <h2>{data?.name || label("intro")}</h2>
          <p className="finance-muted">{data?.address}</p>
        </div>
        <div className="finance-controls">
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
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>
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
            <Link
              className="btn btn-sm btn-outline-primary"
              to={`/cashier/condominium/${selected}`}
            >
              {label("openCashier")}
            </Link>
          </div>
          <div className="finance-account-columns">
            {accounts("funds")}
            {accounts("repairs")}
          </div>
          <section className="finance-panel">
            <div className="finance-section-toolbar">
              <h3>{label("monthly")}</h3>
              <button className="btn btn-sm btn-outline-secondary" disabled={!data.months.length} onClick={exportMonths}>{label("exportMonths")}</button>
            </div>
            <p className="finance-muted">{label("monthlyHint")}</p>
            {!data.months.length ? (
              <p>{label("noMonths")}</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table finance-months">
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
                      {[...data.months]
                        .reverse()
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
                            <td>{label(m.completed ? "closed" : "open")}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {data.months.length > 12 && (
                  <button
                    className="btn btn-link btn-sm"
                    onClick={() => setAllMonths((v) => !v)}
                  >
                    {label(allMonths ? "fewerMonths" : "allMonths")}
                  </button>
                )}
              </>
            )}
          </section>
          <section className="finance-panel">
            <div className="finance-section-toolbar">
              <h3>{label("recent")}</h3>
              <button className="btn btn-sm btn-outline-secondary" disabled={!movements.length} onClick={exportMovements}>{label("exportMovements")}</button>
            </div>
            <p className="finance-muted">{label("recentHint")}</p>
            <div className="finance-filters">
              <select aria-label={label("source")} className="form-select" value={source} onChange={e => setSource(e.target.value)}>
                {["all", "fee", "income", "bill", "expense", "fundExpense", "repairIncome", "repairExpense"].map(key =>
                  <option key={key} value={key}>{label(key === "all" ? "allSources" : key)}</option>)}
              </select>
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
              <input
                type="search"
                className="form-control"
                aria-label={label("search")}
                placeholder={label("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="finance-section-toolbar finance-muted" role="status">
              <span>{label("shown")}: {movements.length} / {data.movements.length}</span>
              {(direction !== "all" || source !== "all" || search) && (
                <button className="btn btn-link btn-sm" onClick={() => { setDirection("all"); setSource("all"); setSearch(""); }}>{label("clearFilters")}</button>
              )}
            </div>
            {!movements.length ? (
              <p className="finance-muted">
                {label(data.movements.length ? "noMatches" : "noMovements")}
              </p>
            ) : (
              <ul className="finance-movements">
                {movements.map((m) => {
                  const incoming = incomeTypes.includes(m.type);
                  return (
                    <li key={`${m.type}-${m.id}`}>
                      <div className="finance-movement-main">
                        <strong>{m.name || label(m.type)}</strong>
                        <span>
                          {label(m.type)} · {date(m.date)}
                        </span>
                        {m.documentNumber && (
                          <small>
                            {label("document")}: {m.documentNumber} ·{" "}
                            {date(m.documentDate)}
                          </small>
                        )}
                      </div>
                      <strong
                        className={
                          incoming ? "finance-positive" : "finance-negative"
                        }
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
