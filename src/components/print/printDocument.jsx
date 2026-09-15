import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const cents = value => Math.round(Number(value || 0) * 100);
const feeOrder = f => f.fund ? 3 : f.primary ? 0 : f.monthly ? 1 : 2;

export function buildPrintModel(details) {
  const grouped = new Map();
  const homes = details.homes.map(home => {
    const fees = [...(home.charges || []), ...(home.receipts || [])]
      .sort((a, b) => feeOrder(a) - feeOrder(b) || a.name.localeCompare(b.name));
    fees.forEach(fee => {
      const key = JSON.stringify([fee.name, cents(fee.value), !!fee.fund, fee.fundName || "", !!fee.primary, !!fee.monthly]);
      const row = grouped.get(key) || { key, name: fee.name, fundName: fee.fundName, value: fee.value, homes: new Set(), amountCents: 0 };
      row.homes.add(home.id);
      row.amountCents += cents(fee.amount);
      grouped.set(key, row);
    });
    return { ...home, fees };
  });
  return { homes, total: homes.reduce((sum, home) => sum + cents(home.total), 0) / 100,
    fees: [...grouped.values()].map(f => ({ ...f, homeCount: f.homes.size, amount: f.amountCents / 100 })) };
}

export function createPrintDocument({ condominium, details, mode, locale, labels }) {
  const model = buildPrintModel(details);
  const text = key => labels[key];
  const money = value => "€ " + new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
  const address = [condominium.address, condominium.city].filter(Boolean).join(", ");
  const period = new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(details.month.year, details.month.number - 1, 1)) + " " + details.month.year;
  const title = text("documentTitle") + " " + (address || condominium.name);
  const parts = model.homes.flatMap(home => {
    const count = Math.max(1, Math.ceil(home.fees.length / 12));
    return Array.from({ length: count }, (_, index) => ({ home, fees: home.fees.slice(index * 12, index * 12 + 12), index, count }));
  });
  const rows = Array.from({ length: Math.ceil(parts.length / 3) }, (_, index) => parts.slice(index * 3, index * 3 + 3));
  const css = `
    @page { size: A4 ${mode === "landscape" ? "landscape" : "portrait"}; margin: 5mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; background: white; font-family: Arial, sans-serif; font-size: 8pt; }
    h1 { font-size: 13pt; margin: 0 0 2mm; text-align: center; }
    h2 { font-size: 10pt; margin: 3mm 0 1mm; }
    .period { margin: 0 0 3mm; text-align: center; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: .2mm solid #555; padding: .7mm 1mm; overflow-wrap: anywhere; vertical-align: middle; line-height: 1.12; }
    th { background: #eee; font-weight: bold; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    .number { text-align: right; white-space: nowrap; }
    .center { text-align: center; }
    .total { font-weight: bold; }
    small { display: block; font-size: 7pt; font-weight: normal; }
    .receipt-row { display: flex; gap: 2mm; align-items: stretch; break-inside: avoid; page-break-inside: avoid; margin-bottom: 2mm; }
    .receipt { flex: 0 0 calc((100% - 4mm) / 3); min-width: 0; border: .2mm dashed #777; padding: 2mm; }
    .receipt h2 { text-align: center; margin: 0 0 1mm; font-size: 9pt; }
    .receipt p { margin: 1mm 0; overflow-wrap: anywhere; }
    .receipt .period { font-weight: bold; }
    .receipt th, .receipt td { padding: .7mm; font-size: 7.5pt; }
    .receipt .number { white-space: normal; }
    .receipt .owner { min-height: 6mm; }
    .receipt-total { display: flex; justify-content: space-between; gap: 2mm; font-weight: bold; margin-top: 2mm!important; }
    @media screen { body { width: ${mode === "landscape" ? "287mm" : "200mm"}; margin: 5mm auto; } }
  `;
  const content = mode === "landscape" ? <>
    <h1>{title}</h1><p className="period">{period}</p>
    <table>
      <colgroup>{["5%", "8%", "33%", "12%", "18%", "24%"].map((width, i) => <col key={i} style={{ width }} />)}</colgroup>
      <thead><tr>{["floor", "home", "owner", "total", "signature", "note"].map(k => <th key={k}>{text(k)}</th>)}</tr></thead>
      <tbody>{model.homes.map(home => <tr key={home.id}>
        <td className="center">{home.floor}</td><td className="center">{home.name}</td><td>{home.owner || "—"}</td>
        <td className="number">{money(home.total)}</td><td></td><td></td>
      </tr>)}
      <tr className="total"><td colSpan={3}>{text("total")}</td><td className="number">{money(model.total)}</td><td colSpan={2}></td></tr></tbody>
    </table>
    <h2>{text("feeSummary")}</h2>
    <table><colgroup><col style={{ width: "55%" }} /><col style={{ width: "15%" }} /><col style={{ width: "15%" }} /><col style={{ width: "15%" }} /></colgroup>
      <thead><tr>{["fee", "value", "homeCount", "total"].map(k => <th key={k}>{text(k)}</th>)}</tr></thead>
      <tbody>{model.fees.map(f => <tr key={f.key}><td>{f.name}{f.fundName && <small>{f.fundName}</small>}</td><td className="number">{money(f.value)}</td><td className="center">{f.homeCount}</td><td className="number">{money(f.amount)}</td></tr>)}
        <tr className="total"><td colSpan={3}>{text("total")}</td><td className="number">{money(model.total)}</td></tr>
      </tbody>
    </table>
  </> : <>{rows.map((row, rowIndex) => <div className="receipt-row" key={rowIndex}>{row.map(({ home, fees, index, count }) => <section className="receipt" key={home.id + "-" + index}>
    <h2>{text("receipt")}</h2><p className="center">{address || condominium.name}</p><p className="period">{period}</p>
    <p>{text("floor")}: <b>{home.floor}</b> · {text("home")}: <b>{home.name}</b></p><p className="owner">{home.owner || "—"}</p>
    {count > 1 && <p>{text("part")} {index + 1}/{count}</p>}
    <table><colgroup><col style={{ width: "65%" }} /><col style={{ width: "35%" }} /></colgroup>
      <thead><tr>{["fee", "total"].map(k => <th key={k}>{text(k)}</th>)}</tr></thead>
      <tbody>{fees.map((fee, i) => <tr key={i}><td>{fee.name}{fee.fundName && <small>{fee.fundName}</small>}<small>{money(fee.value)} × {fee.times}</small></td><td className="number">{money(fee.amount)}</td></tr>)}</tbody>
    </table>
    {index === count - 1 && <><p className="receipt-total"><span>{text("total")}</span><span>{money(home.total)}</span></p>
      {Number(home.paid) > 0 && <><p>{text("paid")}: {money(home.paid)}</p><p>{text("due")}: {money(home.due)}</p></>}</>}
  </section>)}</div>)}</>;
  return "<!doctype html>" + renderToStaticMarkup(<html lang={locale}><head><meta charSet="utf-8" /><title>{title + " · " + period}</title><style>{css}</style></head><body>{content}</body></html>);
}
