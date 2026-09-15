import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Printer } from "lucide-react";
import { useUser } from "../../user/UserContext";
import { getCashierMonths, getCashierMonth } from "../../api/services/cashierService";
import { getCondominium } from "../../api/services/managementService";
import { createPrintDocument } from "./printDocument";
import "./Print.css";

export default function Print() {
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const label = key => t(`dashboard:printPage.${key}`);
  const [params, setParams] = useSearchParams();
  const condominiumId = params.get("condominium") || String(user?.condominiums?.[0]?.id || "");
  const [overview, setOverview] = useState(null);
  const [details, setDetails] = useState(null);
  const [monthId, setMonthId] = useState("");
  const [mode, setMode] = useState("landscape");
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const frame = useRef(null);
  const requestedMonth = params.get("month");
  useEffect(() => {
    let active = true;
    setOverview(null); setDetails(null); setMonthId(""); setError(false); setReady(false);
    if (condominiumId) Promise.all([getCashierMonths(condominiumId), getCondominium(condominiumId)])
      .then(([months, condominium]) => {
        if (!active) return;
        const requested = months.months.find(m => String(m.id) === requestedMonth);
        const current = months.months.find(m => `${m.year}-${String(m.number).padStart(2, "0")}` === months.currentMonth);
        setOverview({ ...months, condominium, selected: condominiumId });
        setMonthId(String((requested || current || months.months[months.months.length - 1])?.id || ""));
      }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [condominiumId, requestedMonth, revision]);
  useEffect(() => {
    let active = true;
    setDetails(null); setReady(false);
    if (monthId && overview?.selected === condominiumId) {
      setError(false);
      getCashierMonth(condominiumId, monthId).then(data => { if (active) setDetails({ ...data, selected: condominiumId }); })
        .catch(() => { if (active) setError(true); });
    }
    return () => { active = false; };
  }, [condominiumId, monthId, overview]);
  const valid = details?.selected === condominiumId && String(details?.month.id) === monthId;
  const document = useMemo(() => {
    if (!valid || !overview) return "";
    const labels = Object.fromEntries(["documentTitle", "floor", "home", "owner", "total", "signature", "note", "feeSummary", "fee", "value", "homeCount", "receipt", "part", "times", "paid", "due"].map(key => [key, t(`dashboard:printPage.${key}`)]));
    return createPrintDocument({ condominium: overview.condominium, details, mode, locale: i18n.language, labels });
  }, [valid, overview, details, mode, t, i18n.language]);
  const print = () => {
    if (!ready || !document) return;
    try { frame.current.contentWindow.focus(); frame.current.contentWindow.print(); }
    catch { setError(true); }
  };
  return <main className="print-page">
    <header><h2><Printer size={25} aria-hidden="true" />{label("title")}</h2><p>{label("intro")}</p></header>
    <div className="print-controls">
      <label>{label("building")}<select className="form-select" value={condominiumId} onChange={e => setParams({ condominium: e.target.value })}>
        {!user?.condominiums?.length && <option value="">{label("noBuildings")}</option>}
        {user?.condominiums?.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
      </select></label>
      <label>{label("month")}<select className="form-select" disabled={!overview?.months.length} value={monthId} onChange={e => setMonthId(e.target.value)}>
        {overview?.months.map(m => <option value={m.id} key={m.id}>{new Intl.DateTimeFormat(i18n.language, { month: "long" }).format(new Date(m.year, m.number - 1, 1))} {m.year}</option>)}
      </select></label>
      <label>{label("format")}<select className="form-select" value={mode} onChange={e => { setReady(false); setMode(e.target.value); }}>
        <option value="landscape">{label("landscape")}</option><option value="portrait">{label("portrait")}</option>
      </select></label>
      <button type="button" className="btn btn-primary" disabled={!ready || !valid || !details?.homes.length} onClick={print}>{label("print")}</button>
    </div>
    <p className="print-hint">{label("pdfHint")}</p>
    {condominiumId && <Link to={`/cashier/condominium/${condominiumId}`}>{label("back")}</Link>}
    {error ? <div className="alert alert-danger mt-3" role="alert">{label("error")} <button className="btn btn-link" onClick={() => setRevision(r => r + 1)}>{label("retry")}</button></div> :
      !condominiumId ? <p>{label("noBuildings")}</p> :
      overview && !overview.months.length ? <p>{label("noMonths")}</p> :
      !valid ? <p role="status">{label("loading")}</p> :
      !details.homes.length ? <p>{label("noHomes")}</p> :
      <iframe key={document} ref={frame} title={label("preview")} className="print-preview" srcDoc={document}
        sandbox="allow-same-origin allow-modals" onLoad={() => setReady(true)} />}
  </main>;
}
