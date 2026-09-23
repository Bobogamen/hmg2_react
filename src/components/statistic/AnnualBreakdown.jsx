import React, { useState } from "react";

const sum = (rows, key) => rows.reduce((total, row) => total + Math.round(Number(row[key] || 0) * 100), 0) / 100;

export default function AnnualBreakdown({ section, annual, year, label, money, locale }) {
  const [search, setSearch] = useState("");
  const rows = annual?.[section] || [];
  const date = (value) => value ? new Intl.DateTimeFormat(locale).format(new Date(`${value}T12:00:00`)) : "—";
  const period = (value) => new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
  const title = label(`by${section[0].toUpperCase()}${section.slice(1)}`);
  const name = (row) => <>{row.name}{row.archived && <small className="statistics-archived">{label("archived")}</small>}
    {row.detail && <small className="statistics-account-detail">{row.detail}</small>}</>;
  let columns;
  if (section === "homes") {
    columns = [
      { key: "name", label: "home", render: name }, { key: "floor", label: "floor" },
      { key: "fees", label: "paidFees", money: true }, { key: "repairs", label: "paidRepairs", money: true },
      { key: "total", label: "total", money: true },
    ];
  } else if (section === "expenses") {
    columns = [
      { key: "name", label: "description" },
      { key: "source", label: "source", render: row => <>{label(row.source)}{row.account && <small className="statistics-account-detail">{row.account}</small>}</> },
      { key: "period", label: "period", render: row => period(row.period) },
      { key: "date", label: "operationDate", render: row => date(row.date) },
      { key: "documentNumber", label: "document" },
      { key: "documentDate", label: "documentDate", render: row => date(row.documentDate) },
      { key: "amount", label: "amount", money: true },
    ];
  } else {
    columns = [{ key: "name", label: section === "fees" ? "fee" : section === "bills" ? "bill" : "account", render: name },
      { key: "count", label: "operations" }];
    if (section !== "bills") columns.push({ key: "income", label: "received", money: true });
    if (section !== "fees") columns.push({ key: "expenses", label: "paidOut", money: true });
    if (section === "repairs" || section === "funds") columns.push({ key: "difference", label: "difference", money: true });
  }
  const query = search.trim().toLocaleLowerCase(locale);
  const filtered = section === "expenses" && query ? rows.filter(row =>
    [row.name, row.account, row.documentNumber, row.documentDate, row.date, label(row.source)]
      .filter(Boolean).join(" ").toLocaleLowerCase(locale).includes(query)) : rows;

  return <section className="statistics-panel">
    <h3>{title} · {year}</h3>
    <p className="statistics-muted">{label(`${section}Scope`)}</p>
    {section === "expenses" && <div className="statistics-search">
      <label htmlFor="statistics-expense-search">{label("searchExpenses")}</label>
      <input id="statistics-expense-search" type="search" className="form-control" value={search}
        placeholder={label("searchPlaceholder")} onChange={e => setSearch(e.target.value)} />
      <p className="statistics-muted" role="status">{label("shown")}: {filtered.length} / {rows.length} · {label("shownTotal")}: {money(sum(filtered, "amount"))}</p>
    </div>}
    {!filtered.length ? <p>{label(rows.length ? "noMatches" : "noEntries")}</p> : (
      <div className="statistics-table-scroll" tabIndex={0} role="region" aria-label={title}>
        <table className="table statistics-table statistics-breakdown">
          <caption className="visually-hidden">{title} · {year}</caption>
          <thead><tr>{columns.map(col => <th scope="col" key={col.key}>{label(col.label)}</th>)}</tr></thead>
          <tbody>{filtered.map(row => <tr key={JSON.stringify([row.source, row.id, row.name])}>
            {columns.map((col, index) => {
              const content = col.render ? col.render(row) : col.money ? money(row[col.key]) : row[col.key] ?? "—";
              return index === 0 ? <th scope="row" key={col.key}>{content}</th> :
                <td key={col.key} className={col.money && Number(row[col.key]) < 0 ? "statistics-negative" : ""}>{content}</td>;
            })}
          </tr>)}</tbody>
          <tfoot><tr>{columns.map((col, index) => index === 0 ? <th scope="row" key={col.key}>{label(query ? "shownTotal" : "total")}</th> :
            <td key={col.key}>{col.money ? money(sum(filtered, col.key)) : col.key === "count" ? filtered.reduce((total, row) => total + row.count, 0) : ""}</td>)}</tr></tfoot>
        </table>
      </div>
    )}
  </section>;
}
