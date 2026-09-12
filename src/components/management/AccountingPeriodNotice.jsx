import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoading } from "../../loader/LoadingContext";
import { getAccountingPeriod, generateAccountingMonths } from "../../api/services/managementService";

const currentYear = () => new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Europe/Sofia" }).format(new Date());
const monthLabel = value => value ? `${value.slice(5)}.${value.slice(0, 4)}` : "";

export default function AccountingPeriodNotice({ condominiumId, onGenerated }) {
  const { t } = useTranslation("condo");
  const { setIsLoading } = useLoading();
  const [period, setPeriod] = useState(null);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const request = useRef(0);
  const submitting = useRef(false);
  const invalidateRequests = useCallback(() => { ++request.current; }, []);

  const refresh = useCallback(async () => {
    if (submitting.current) return;
    const id = ++request.current;
    try {
      const data = await getAccountingPeriod(condominiumId);
      if (id === request.current) { setPeriod(data); setError(false); }
    } catch {
      if (id === request.current) setError(true);
    }
  }, [condominiumId]);

  useEffect(() => {
    setPeriod(null);
    setCreated(null);
    refresh();
    let year = currentYear();
    const timer = setInterval(() => {
      const next = currentYear();
      if (next !== year) { year = next; refresh(); }
    }, 60000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => { invalidateRequests(); clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [refresh, invalidateRequests]);

  const generate = async () => {
    if (submitting.current) return;
    submitting.current = true;
    const id = ++request.current;
    setSaving(true);
    setIsLoading(true);
    setError(false);
    try {
      const data = await generateAccountingMonths(condominiumId);
      if (id === request.current) { setPeriod(data); setCreated(data.createdMonths); onGenerated?.(); }
    } catch {
      if (id === request.current) setError(true);
    } finally {
      submitting.current = false;
      setSaving(false);
      setIsLoading(false);
    }
  };

  const missing = period?.missingMonths || [];
  if (!error && !missing.length && created === null) return null;
  return (
    <div className={`alert ${error ? "alert-danger" : missing.length ? "alert-warning" : "alert-success"}`} role={error ? "alert" : "status"}>
      {error && <p>{t("accountingPeriod.error")}</p>}
      {missing.length > 0 && <>
        <p className="mb-2">{t("accountingPeriod.missing", { count: missing.length, from: monthLabel(missing[0]), to: monthLabel(period.endMonth) })}</p>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={generate}>
          {t("accountingPeriod.generate")}
        </button>
      </>}
      {!missing.length && !error && created !== null && <span>{t("accountingPeriod.created", { count: created, to: monthLabel(period.endMonth) })}</span>}
      {error && !missing.length && <button type="button" className="btn btn-outline-dark" disabled={saving} onClick={refresh}>{t("accountingPeriod.retry")}</button>}
    </div>
  );
}
