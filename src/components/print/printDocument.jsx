import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FeeLabel from "../../utils/FeeLabel";

const cents = (value) => Math.round(Number(value || 0) * 100);
const feeOrder = (f) => (f.fund ? 3 : f.primary ? 0 : f.monthly ? 1 : 2);
const compareFees = (a, b) =>
  feeOrder(a) - feeOrder(b) || a.name.localeCompare(b.name);

export function buildPrintModel(details) {
  const grouped = new Map();
  const homes = details.homes.map((home) => {
    const fees = [...(home.charges || []), ...(home.receipts || [])].sort(
      compareFees,
    );
    fees.forEach((fee) => {
      const key = JSON.stringify([
        fee.name,
        cents(fee.value),
        !!fee.fund,
        fee.fundName || "",
        !!fee.primary,
        !!fee.monthly,
      ]);
      const row = grouped.get(key) || {
        key,
        name: fee.name,
        fundName: fee.fundName,
        fund: !!fee.fund,
        primary: !!fee.primary,
        monthly: !!fee.monthly,
        value: fee.value,
        homes: new Set(),
        amountCents: 0,
      };
      row.homes.add(home.id);
      row.amountCents += cents(fee.amount);
      grouped.set(key, row);
    });
    return { ...home, fees };
  });
  return {
    homes,
    total: homes.reduce((sum, home) => sum + cents(home.total), 0) / 100,
    fees: [...grouped.values()].sort(compareFees).map((f) => ({
      ...f,
      homeCount: f.homes.size,
      amount: f.amountCents / 100,
    })),
  };
}

export function createPrintDocument({
  condominium,
  details,
  locale,
  labels,
  section = "all",
}) {
  const model = buildPrintModel(details);
  const residentCounts = new Map(
    (condominium.homes || []).map((home) => [
      String(home.id),
      home.residentsSize,
    ]),
  );
  const text = (key) => labels[key];
  const amount = (value) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  const city = condominium.city
    ? `${locale?.startsWith("bg") ? "гр. " : ""}${condominium.city}`
    : "";
  const address = [condominium.address, city].filter(Boolean).join(", ");
  const period =
    new Intl.DateTimeFormat(locale, { month: "long" }).format(
      new Date(details.month.year, details.month.number - 1, 1),
    ) +
    " " +
    details.month.year;
  const title = text("documentTitle") + " " + (address || condominium.name);
  const parts = model.homes.flatMap((home) => {
    const count = Math.max(1, Math.ceil(home.fees.length / 12));
    return Array.from({ length: count }, (_, index) => ({
      home,
      fees: home.fees.slice(index * 12, index * 12 + 12),
      index,
      count,
    }));
  });
  const rows = Array.from({ length: Math.ceil(parts.length / 3) }, (_, index) =>
    parts.slice(index * 3, index * 3 + 3),
  );
  const pageStyles =
    section === "all"
      ? `
  @page properties {
      size: A4 portrait;
      margin: 6mm 6mm 6mm 16mm;
  }

  @page receipts {
      size: A4 landscape;
      margin: 6mm;
  }
  `
      : `
  @page {
      size: A4 ${section === "receipts" ? "landscape" : "portrait"};
      margin: ${section === "receipts" ? "6mm" : "6mm 6mm 6mm 16mm"};
  }
  `;
  const css = `${pageStyles}

  .properties-document {
      page: ${section === "all" ? "properties" : "auto"};
  }

  @media print {
      body[data-print-section="properties"] .receipts-document,
      body[data-print-section="receipts"] .properties-document {
          display: none;
      }
      body[data-print-section="receipts"] .receipts-document {
          break-before: auto;
      }
  }

  .fee-summaries {
      display: flex;
      align-items: flex-start;
      gap: 4mm;
      margin-top: 4mm;
      break-inside: avoid;
      page-break-inside: avoid;
  }

  .fee-summary {
      flex: 1 1 0;
      min-width: 0;
      font-size: 9pt;
      break-inside: avoid;
      page-break-inside: avoid;
  }

  .fee-summary caption {
      caption-side: top;
      text-align: left;
      font-weight: bold;
      padding-bottom: 1.5mm;
  }

  .fee-summary .number {
      white-space: normal;
  }

  .receipts-document {
      page: ${section === "all" ? "receipts" : "auto"};
      break-before: ${section === "receipts" ? "auto" : "page"};
  }

  * {
      box-sizing: border-box;
  }

  body {
      margin: 0;
      color: #111;
      background: white;
      font-family: Arial, sans-serif;
      font-size: 10pt;
  }

  h1 {
      font-size: 14pt;
      margin: 0 0 2mm;
      text-align: center;
  }

  h2 {
      font-size: 12pt;
      margin: 3mm 0 1mm;
  }

  .period {
      margin: 0 0 3mm;
      text-align: center;
  }

  table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
  }

  th,
  td {
      border: .2mm solid #555;
      padding: 1.4mm .5mm;
      overflow-wrap: anywhere;
      vertical-align: middle;
      line-height: 1.12;
  }

  th {
      background: #eee;
      font-weight: bold;
  }

  .properties-table tbody tr:nth-child(even):not(.total) > td {
      background-color: #918484;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
  }

  thead {
      display: table-header-group;
  }

  tr {
      break-inside: avoid;
      page-break-inside: avoid;
  }

  .number {
      text-align: center;
      white-space: nowrap;
  }

  .properties-table .home-amount {
      color: #b0b0b0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
  }

  .center {
      text-align: center;
  }

  .total {
      font-weight: bold;
  }

  small {
      display: block;
      font-size: 7pt;
      font-weight: normal;
  }

  .receipt-row {
      display: flex;
      gap: 2mm;
      align-items: stretch;
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 2mm;
  }

  .receipt {
      flex: 0 0 calc((100% - 4mm) / 3);
      min-width: 0;
      border: .4mm solid #111;
      padding: 0;
      font-family: "Courier New", monospace;
  }

  .receipt h2 {
      text-align: center;
      margin: 0 0 1mm;
      font-size: 9pt;
  }

  .receipt p {
      margin: 1mm 0;
      overflow-wrap: anywhere;
  }

  .receipt .period {
      font-weight: bold;
      font-size: 14pt;
      text-transform: capitalize;
      margin: 1mm;
  }

  .receipt-home {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 2mm;
      padding: 2mm 1mm 0;
      font-size: 10pt;
  }

  .receipt-home b {
      border: .7mm solid #111;
      border-radius: 2mm;
      padding: 1mm 2mm;
      font-size: 14pt;
      font-weight: bold;
      line-height: 1;
      overflow-wrap: anywhere;
  }

  .receipt th,
  .receipt td {
      padding: .6mm;
      font-size: 10pt;
      text-align: center;
      border-color: #111;
  }

  .receipt th {
      background: #ddd;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
  }

  .receipt td:first-child {
      font-weight: bold;
      text-align: left;
  }

  .fund-fee {
      font-style: italic;
  }

  .receipt .number {
      white-space: normal;
  }

  .receipt .owner {
      min-height: 6mm;
  }

  .receipt-total {
      display: flex;
      justify-content: space-between;
      gap: 1mm;
      font-weight: bold;
      margin: 0 !important;
      padding: 1mm;
      font-size: 12pt;
      background-color: lightgray;
  }

  @media screen {
      body {
          background: #e9eef2;
          padding: 6mm;
      }

      .properties-document,
      .receipts-document {
          background: white;
          padding: 6mm 6mm 6mm 15mm;
          margin: auto;
          box-shadow: 0 2px 8px #0002;
      }

      .properties-document {
          width: 210mm;
      }

      .receipts-document {
          width: 297mm;
      }
  }

  `;
  const content = (
    <>
      {section !== "receipts" && (
        <section className="properties-document">
          <h1>
            {text("documentTitle")}
            <br />
            {address || condominium.name}
          </h1>
          <p className="period">{period}</p>
          <table className="properties-table">
            <colgroup>
              {["10%", "10%", "23%", "9%", "8%", "16%", "14%", "10%"].map(
                (width, i) => (
                  <col key={i} style={{ width }} />
                ),
              )}
            </colgroup>
            <thead>
              <tr>
                {[
                  "floor",
                  "home",
                  "owner",
                  "home:residents",
                  "total",
                  "date",
                  "signature",
                  "note",
                ].map((k) => (
                  <th key={k}>{k === "total" ? `${text(k)} €` : text(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {model.homes.map((home) => (
                <tr key={home.id}>
                  <td className="center">{home.floor}</td>
                  <td className="center">{home.name}</td>
                  <td>{home.owner || "—"}</td>
                  <td className="center">
                    {residentCounts.get(String(home.id)) ?? "—"}
                  </td>
                  <td className="number home-amount">{amount(home.total)}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
              <tr className="total">
                <td colSpan={4}>{text("total")}</td>
                <td className="number">€ {amount(model.total)}</td>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
          <div className="fee-summaries">
            {[false, true].map((fund) => {
              const fees = model.fees.filter((fee) => fee.fund === fund);
              const total =
                fees.reduce((sum, fee) => sum + fee.amountCents, 0) / 100;
              return (
                <table className="fee-summary" key={String(fund)}>
                  <caption>
                    {text(fund ? "fundsSummary" : "feesSummary")}
                  </caption>
                  <colgroup>
                    <col style={{ width: "56%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {["fee", "€", "homeCount", "total"].map((k) => (
                        <th key={k}>{k === "€" ? "€" : text(k)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((f) => (
                      <tr
                        key={f.key}
                        className={f.fund ? "fund-fee" : undefined}
                      >
                        <td>
                          <FeeLabel fee={f} fundLabel={text("fund")} />
                        </td>
                        <td className="number">{amount(f.value)}</td>
                        <td className="center">{f.homeCount}</td>
                        <td className="number">{amount(f.amount)}</td>
                      </tr>
                    ))}
                    <tr className="total">
                      <td colSpan={3}>{text("total")}</td>
                      <td className="number">€ {amount(total)}</td>
                    </tr>
                  </tbody>
                </table>
              );
            })}
          </div>
        </section>
      )}
      {section !== "properties" && (
        <section className="receipts-document">
          {rows.map((row, rowIndex) => (
            <div className="receipt-row" key={rowIndex}>
              {row.map(({ home, fees, index, count }) => (
                <section className="receipt" key={home.id + "-" + index}>
                  <div className="receipt-home">
                    <span>{text("receiptFloor")}</span> <b>{home.floor}</b>
                    <span>{text("receiptHome")}</span> <b>{home.name}</b>
                  </div>
                  <p className="period">{period}</p>
                  {count > 1 && (
                    <p>
                      {text("part")} {index + 1}/{count}
                    </p>
                  )}
                  <table>
                    <colgroup>
                      <col style={{ width: "62%" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "15%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>{text("fee")}</th>
                        <th>€</th>
                        <th>{text("homeCount")}</th>
                        <th>{text("total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee, i) => (
                        <tr
                          key={i}
                          className={fee.fund ? "fund-fee" : undefined}
                        >
                          <td>
                            <FeeLabel fee={fee} fundLabel={text("fund")} />
                          </td>
                          <td className="number">{amount(fee.value)}</td>
                          <td className="center">{fee.times}</td>
                          <td className="number">{amount(fee.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {index === count - 1 && (
                    <>
                      <p className="receipt-total">
                        <span>{text("total")}</span>
                        <span>€ {amount(home.total)}</span>
                      </p>
                    </>
                  )}
                </section>
              ))}
            </div>
          ))}
        </section>
      )}
    </>
  );
  return (
    "<!doctype html>" +
    renderToStaticMarkup(
      <html lang={locale}>
        <head>
          <meta charSet="utf-8" />
          <title>{title + " · " + period}</title>
          <style>{css}</style>
        </head>
        <body>{content}</body>
      </html>,
    )
  );
}
