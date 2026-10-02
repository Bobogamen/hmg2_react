import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useLoading } from "../../loader/LoadingContext";
import {
  getAccountingPeriod,
  getAccountingChargeStatus,
  generateAccountingMonths,
  initializeAccountingCharges,
} from "../../api/services/managementService";

const currentPeriod = () =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Europe/Sofia",
  }).format(new Date());
const monthLabel = (value) =>
  value ? `${value.slice(5)}.${value.slice(0, 4)}` : "";

export default function AccountingPeriodNotice({ condominiumId, onGenerated }) {
  const { t } = useTranslation("condo");
  const { setIsLoading } = useLoading();
  const [period, setPeriod] = useState(null);
  const [chargeStatus, setChargeStatus] = useState(null);
  const [confirmCharges, setConfirmCharges] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const request = useRef(0);
  const submitting = useRef(false);
  const invalidateRequests = useCallback(() => {
    ++request.current;
  }, []);

  const refresh = useCallback(async () => {
    if (submitting.current) return;
    const id = ++request.current;
    try {
      const [data, charges] = await Promise.all([
        getAccountingPeriod(condominiumId),
        getAccountingChargeStatus(condominiumId),
      ]);
      if (id === request.current) {
        setPeriod(data);
        setChargeStatus(charges);
        setConfirmCharges(false);
        setError(false);
      }
    } catch {
      if (id === request.current) setError(true);
    }
  }, [condominiumId]);

  useEffect(() => {
    setPeriod(null);
    setChargeStatus(null);
    refresh();
    let period = currentPeriod();
    const timer = setInterval(() => {
      const next = currentPeriod();
      if (next !== period) {
        period = next;
        refresh();
      }
    }, 60000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      invalidateRequests();
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
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
      if (id === request.current) {
        setPeriod(data);
        toast.success(t("accountingPeriod.created", {
          count: data.createdMonths,
          to: monthLabel(data.endMonth),
        }));
        onGenerated?.();
      }
    } catch {
      if (id === request.current) toast.error(t("accountingPeriod.error"));
    } finally {
      submitting.current = false;
      setSaving(false);
      setIsLoading(false);
    }
  };

  const initializeCharges = async () => {
    if (submitting.current) return;
    submitting.current = true;
    const id = ++request.current;
    setSaving(true);
    setIsLoading(true);
    try {
      const data = await initializeAccountingCharges(condominiumId);
      if (id === request.current) {
        setChargeStatus(data);
        setConfirmCharges(false);
        toast.success(t("accountingPeriod.chargesCreated", {
          count: data.createdMonths,
        }));
        onGenerated?.();
      }
    } catch {
      if (id === request.current) toast.error(t("accountingPeriod.chargesError"));
    } finally {
      submitting.current = false;
      setSaving(false);
      setIsLoading(false);
    }
  };

  const missing = period?.missingMonths || [];
  const unsnapshotted = chargeStatus?.months || [];
  if (!error && !missing.length && !unsnapshotted.length) return null;
  return (
    <>
      {(error || missing.length > 0) && <div
        className={`alert ${error ? "alert-danger" : "alert-warning"}`}
        role={error ? "alert" : "status"}
      >
        {error && <p>{t("accountingPeriod.error")}</p>}
        {missing.length > 0 && (
          <>
            <p className="mb-2">
              {t("accountingPeriod.missing", {
                count: missing.length,
                from: monthLabel(missing[0]),
                to: monthLabel(period.endMonth),
              })}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={generate}
            >
              {t("accountingPeriod.generate")}
            </button>
          </>
        )}
        {error && !missing.length && (
          <button
            type="button"
            className="btn btn-outline-dark"
            disabled={saving}
            onClick={refresh}
          >
            {t("accountingPeriod.retry")}
          </button>
        )}
      </div>}
      {unsnapshotted.length > 0 && (
        <div className="alert alert-warning" role="status">
          <p className="fw-bold mb-1">{t("accountingPeriod.chargesTitle")}</p>
          <p className="mb-2">
            {t("accountingPeriod.chargesMissing", {
              count: unsnapshotted.length,
              from: monthLabel(unsnapshotted[0]),
              to: monthLabel(unsnapshotted[unsnapshotted.length - 1]),
            })}
          </p>
          {!confirmCharges ? (
            <button
              type="button"
              className="btn btn-outline-dark"
              disabled={saving}
              onClick={() => setConfirmCharges(true)}
            >
              {t("accountingPeriod.reviewCharges")}
            </button>
          ) : (
            <div className="border rounded bg-white p-3">
              <p className="mb-3">{t("accountingPeriod.chargesWarning")}</p>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={initializeCharges}
                >
                  {t("accountingPeriod.confirmCharges")}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={saving}
                  onClick={() => setConfirmCharges(false)}
                >
                  {t("accountingPeriod.cancel")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
