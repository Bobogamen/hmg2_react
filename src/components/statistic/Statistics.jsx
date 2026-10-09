import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import {
  ChartColumn,
  RefreshCw,
  House,
  Receipt,
  FileText,
  ArrowUpRight,
  CalendarDays,
  Wrench,
  Wallet,
} from "lucide-react";
import { useUser } from "../../user/UserContext";
import { getStatistics } from "../../api/services/statisticsService";
import AnnualBreakdown from "./AnnualBreakdown";
import "./Statistics.css";

const sectionIcons = {
  homes: House,
  fees: Receipt,
  bills: FileText,
  expenses: ArrowUpRight,
  months: CalendarDays,
  repairs: Wrench,
  funds: Wallet,
};

export default function Statistics() {
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const label = (key) => t(`dashboard:statisticsPage.${key}`);
  const [params, setParams] = useSearchParams();
  const buildings = user?.condominiums || [];
  const selected = params.get("condominium") || String(buildings[0]?.id || "");
  const year = params.get("year") || "";
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [section, setSection] = useState("months");
  const requestKey = JSON.stringify([user?.id, selected, year, revision]);

  useEffect(() => {
    let active = true;
    setResult(null);
    setError(false);
    if (selected) {
      getStatistics(selected, year)
        .then((data) => {
          if (active) setResult({ key: requestKey, data });
        })
        .catch(() => {
          if (active) setError(true);
        });
    }
    return () => {
      active = false;
    };
  }, [selected, year, requestKey]);

  const data = result?.key === requestKey ? result.data : null;
  const money = (value) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "EUR",
    }).format(value ?? 0);
  const monthName = (number, short = false) =>
    new Intl.DateTimeFormat(i18n.language, {
      month: short ? "short" : "long",
    }).format(new Date(data.year, number - 1, 1));
  const maxValue = Math.max(
    1,
    ...(data?.months || []).flatMap((m) => [
      Number(m.income),
      Number(m.expenses),
    ]),
  );
  const years = data
    ? [...new Set([data.year, ...data.years])].sort((a, b) => b - a)
    : [];

  return (
    <main className="statistics-page">
      <header className="statistics-heading text-center text-bg-light w-100 rounded border border-2 border-dark p-3">
        <h2 className="fw-bold mb-2">
          <ChartColumn size={25} aria-hidden="true" />
          {label("title")}
        </h2>
        <p className="statistics-intro mb-0 fw-semibold text-light-emphasis">
          {label("intro")}
        </p>
      </header>
      <div className="statistics-header">
        {data && (
          <div className="statistics-building-heading">
            <h3>{data.name}</h3>
            <p className="statistics-muted mb-0">{data.address}</p>
          </div>
        )}
        {data && (
          <p className="statistics-date statistics-muted mb-0">
            {label("asOf")}:{" "}
            {new Intl.DateTimeFormat(i18n.language).format(
              new Date(`${data.asOf}T12:00:00`),
            )}
          </p>
        )}
        <div className="statistics-controls">
          <label>
            {label("building")}
            <select
              className="form-select"
              value={selected}
              onChange={(e) => setParams({ condominium: e.target.value })}
            >
              {!buildings.length && (
                <option value="">{label("noBuildings")}</option>
              )}
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {label("year")}
            <select
              className="form-select"
              value={data?.year ?? year}
              disabled={!data}
              onChange={(e) =>
                setParams({ condominium: selected, year: e.target.value })
              }
            >
              {!data && <option value={year}>{year || "—"}</option>}
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-outline-secondary"
            aria-label={label("refresh")}
            title={label("refresh")}
            disabled={!selected || (!data && !error)}
            onClick={() => setRevision((r) => r + 1)}
          >
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      {!selected ? (
        <p className="statistics-panel">{label("noBuildings")}</p>
      ) : error ? (
        <div role="alert" className="alert alert-danger">
          {label("error")}{" "}
          <button
            type="button"
            className="btn btn-link"
            onClick={() => setRevision((r) => r + 1)}
          >
            {label("retry")}
          </button>
        </div>
      ) : !data ? (
        <p role="status">
          <Spinner
            as="span"
            animation="border"
            size="sm"
            className="me-2"
            aria-hidden="true"
          />
          {label("loading")}
        </p>
      ) : (
        <>
          <nav className="statistics-sections" aria-label={label("sections")}>
            {Object.entries(sectionIcons).map(([key, Icon]) => (
              <button
                type="button"
                key={key}
                className="statistics-section-button"
                aria-pressed={section === key}
                onClick={() => setSection(key)}
              >
                <span className="statistics-section-icon">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <span>{label(`by${key[0].toUpperCase()}${key.slice(1)}`)}</span>
              </button>
            ))}
          </nav>
          {section !== "months" && (
            <AnnualBreakdown
              key={`${selected}-${data.year}-${section}`}
              section={section}
              annual={data.annual}
              year={data.year}
              label={label}
              money={money}
              locale={i18n.language}
            />
          )}
          {section === "months" &&
            (!data.months.length ? (
              <p className="statistics-panel">{label("noMonths")}</p>
            ) : (
              <>
                <div className="statistics-cards">
                  {["income", "expenses", "forFunds", "difference"].map(
                    (key) => (
                      <article
                        className={`statistics-card statistics-card-${key}`}
                        key={key}
                      >
                        <h3>{label(key)}</h3>
                        <strong
                          className={
                            Number(data.summary[key]) < 0
                              ? "statistics-negative"
                              : ""
                          }
                        >
                          {money(data.summary[key])}
                        </strong>
                        <p>{label(`${key}Hint`)}</p>
                      </article>
                    ),
                  )}
                </div>
                <div className="statistics-period statistics-panel">
                  <span>
                    {label("opening")}:{" "}
                    <strong>{money(data.summary.opening)}</strong>
                  </span>
                  <span>
                    {label("closing")}:{" "}
                    <strong>{money(data.summary.closing)}</strong>
                  </span>
                  <span>
                    {label("completedMonths")}:{" "}
                    <strong>
                      {data.summary.completedMonths} / {data.summary.monthCount}
                    </strong>
                  </span>
                </div>
                <section className="statistics-panel">
                  <h3>{label("chart")}</h3>
                  <p className="statistics-muted">{label("scope")}</p>
                  <div className="statistics-legend" aria-hidden="true">
                    <span>
                      <i className="statistics-income" />
                      {label("income")}
                    </span>
                    <span>
                      <i className="statistics-expenses" />
                      {label("expenses")}
                    </span>
                  </div>
                  <div className="statistics-chart" aria-hidden="true">
                    {data.months.map((m) => (
                      <div className="statistics-chart-month" key={m.id}>
                        <div className="statistics-bars">
                          <div
                            className="statistics-income"
                            style={{
                              height: `${(Math.max(0, Number(m.income)) / maxValue) * 100}%`,
                            }}
                            title={`${monthName(m.number)} · ${label("income")}: ${money(m.income)}`}
                          />
                          <div
                            className="statistics-expenses"
                            style={{
                              height: `${(Math.max(0, Number(m.expenses)) / maxValue) * 100}%`,
                            }}
                            title={`${monthName(m.number)} · ${label("expenses")}: ${money(m.expenses)}`}
                          />
                        </div>
                        <span>{monthName(m.number, true)}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="statistics-panel">
                  <h3>{label("monthlyDetails")}</h3>
                  <div
                    className="statistics-table-scroll"
                    tabIndex={0}
                    role="region"
                    aria-label={label("monthlyDetails")}
                  >
                    <table className="table statistics-table">
                      <caption className="visually-hidden">
                        {label("monthlyDetails")} · {data.year}
                      </caption>
                      <thead>
                        <tr>
                          {[
                            "month",
                            "status",
                            "income",
                            "expenses",
                            "forFunds",
                            "difference",
                            "balance",
                          ].map((key) => (
                            <th scope="col" key={key}>
                              {label(key)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.months.map((m) => (
                          <tr key={m.id}>
                            <th scope="row">{monthName(m.number)}</th>
                            <td>
                              <span
                                className={`badge ${m.completed ? "text-bg-success" : "text-bg-light border"}`}
                              >
                                {label(m.completed ? "closed" : "open")}
                              </span>
                            </td>
                            {[
                              "income",
                              "expenses",
                              "forFunds",
                              "difference",
                              "balance",
                            ].map((key) => (
                              <td
                                key={key}
                                className={
                                  Number(m[key]) < 0
                                    ? "statistics-negative"
                                    : ""
                                }
                              >
                                {money(m[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th scope="row" colSpan={2}>
                            {label("total")}
                          </th>
                          {["income", "expenses", "forFunds", "difference"].map(
                            (key) => (
                              <td key={key}>{money(data.summary[key])}</td>
                            ),
                          )}
                          <td>{money(data.summary.closing)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>
              </>
            ))}
        </>
      )}
    </main>
  );
}
