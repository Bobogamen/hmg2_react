import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Printer, CalendarDays } from "lucide-react";
import { useUser } from "../../user/UserContext";
import {
  getCashierMonths,
  getCashierMonth,
} from "../../api/services/cashierService";
import { getCondominium } from "../../api/services/managementService";
import { createPrintDocument } from "./printDocument";
import "./Print.css";

export default function Print() {
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const label = (key) => t(`dashboard:printPage.${key}`);
  const [params, setParams] = useSearchParams();
  const condominiumId =
    params.get("condominium") || String(user?.condominiums?.[0]?.id || "");
  const [overview, setOverview] = useState(null);
  const [details, setDetails] = useState(null);
  const [monthId, setMonthId] = useState("");
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const printFrames = useRef({});
  const [printReady, setPrintReady] = useState({});
  const requestedMonth = params.get("month");
  useEffect(() => {
    let active = true;
    setOverview(null);
    setDetails(null);
    setMonthId("");
    setError(false);
    setReady(false);
    if (condominiumId)
      Promise.all([
        getCashierMonths(condominiumId),
        getCondominium(condominiumId),
      ])
        .then(([months, condominium]) => {
          if (!active) return;
          const requested = months.months.find(
            (m) => String(m.id) === requestedMonth,
          );
          const current = months.months.find(
            (m) =>
              `${m.year}-${String(m.number).padStart(2, "0")}` ===
              months.currentMonth,
          );
          setOverview({ ...months, condominium, selected: condominiumId });
          setMonthId(
            String(
              (requested || current || months.months[months.months.length - 1])
                ?.id || "",
            ),
          );
        })
        .catch(() => {
          if (active) setError(true);
        });
    return () => {
      active = false;
    };
  }, [condominiumId, requestedMonth, revision]);
  useEffect(() => {
    let active = true;
    setDetails(null);
    setReady(false);
    if (monthId && overview?.selected === condominiumId) {
      setError(false);
      getCashierMonth(condominiumId, monthId)
        .then((data) => {
          if (active) setDetails({ ...data, selected: condominiumId });
        })
        .catch(() => {
          if (active) setError(true);
        });
    }
    return () => {
      active = false;
    };
  }, [condominiumId, monthId, overview]);
  const valid =
    details?.selected === condominiumId &&
    String(details?.month.id) === monthId;
  const documents = useMemo(() => {
    if (!valid || !overview) return {};
    const labels = Object.fromEntries(
      [
        "documentTitle",
        "floor",
        "home",
        "owner",
        "receiptFloor",
        "receiptHome",
        "total",
        "date",
        "signature",
        "note",
        "feesSummary",
        "fundsSummary",
        "fee",
        "value",
        "homeCount",
        "receipt",
        "part",
        "times",
        "paid",
        "due",
      ].map((key) => [key, t(`dashboard:printPage.${key}`)]),
    );
    labels["home:residents"] = t("home:residents");
    labels.fund = t("finance:fund");
    return Object.fromEntries(
      ["all", "properties", "receipts"].map((section) => [
        section,
        createPrintDocument({
          condominium: overview.condominium,
          details,
          locale: i18n.language,
          labels,
          section,
        }),
      ]),
    );
  }, [valid, overview, details, t, i18n.language]);
  const document = documents.all || "";
  const print = (section) => {
    if (
      !documents[section] ||
      printReady[section] !== documents[section] ||
      error ||
      !valid
    )
      return;
    try {
      printFrames.current[section].contentWindow.focus();
      printFrames.current[section].contentWindow.print();
    } catch {
      setError(true);
    }
  };
  return (
    <main className="print-page">
      <header className="print-header text-center text-bg-light w-100 rounded border border-2 border-dark p-3">
        <h2 className="fw-bold mb-2">
          <Printer size={25} aria-hidden="true" />
          {label("title")}
        </h2>
        <p className="print-intro mb-0 fw-semibold text-light-emphasis">
          {label("intro")}
        </p>
      </header>
      <div className="print-controls">
        <label>
          {label("building")}
          <select
            className="form-select"
            value={condominiumId}
            onChange={(e) => setParams({ condominium: e.target.value })}
          >
            {!user?.condominiums?.length && (
              <option value="">{label("noBuildings")}</option>
            )}
            {user?.condominiums?.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {label("month")}
          <select
            className="form-select"
            disabled={!overview?.months.length}
            value={monthId}
            onChange={(e) => setMonthId(e.target.value)}
          >
            {overview?.months.map((m) => (
              <option value={m.id} key={m.id}>
                {new Intl.DateTimeFormat(i18n.language, {
                  month: "long",
                }).format(new Date(m.year, m.number - 1, 1))}{" "}
                {m.year}
              </option>
            ))}
          </select>
        </label>
        {condominiumId && (
          <Link
            className="btn btn-outline-primary print-current-month"
            to={`/cashier/condominium/${condominiumId}`}
          >
            <CalendarDays size={18} aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="print-document-guide" aria-label={label("included")}>
        <div>
          <span className="print-step">1</span>
          <div>
            <strong>{label("properties")}</strong>
            <small>{label("propertiesHint")}</small>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              error ||
              !valid ||
              !details?.homes.length ||
              ready !== document ||
              printReady.properties !== documents.properties
            }
            onClick={() => print("properties")}
          >
            <Printer size={18} aria-hidden="true" />
          </button>
        </div>
        <div>
          <span className="print-step">2</span>
          <div>
            <strong>{label("receipts")}</strong>
            <small>{label("receiptsHint")}</small>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              error ||
              !valid ||
              !details?.homes.length ||
              ready !== document ||
              printReady.receipts !== documents.receipts
            }
            onClick={() => print("receipts")}
          >
            <Printer size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      {error ? (
        <div className="alert alert-danger mt-3" role="alert">
          {label("error")}{" "}
          <button
            className="btn btn-link"
            onClick={() => setRevision((r) => r + 1)}
          >
            {label("retry")}
          </button>
        </div>
      ) : !condominiumId ? (
        <p>{label("noBuildings")}</p>
      ) : overview && !overview.months.length ? (
        <p>{label("noMonths")}</p>
      ) : !valid ? (
        <p role="status">{label("loading")}</p>
      ) : !details.homes.length ? (
        <p>{label("noHomes")}</p>
      ) : (
        <iframe
          key={document}
          title={label("preview")}
          className="print-preview"
          srcDoc={document}
          sandbox="allow-same-origin allow-modals"
          onLoad={() => setReady(document)}
        />
      )}
      {valid &&
        !error &&
        details?.homes.length > 0 &&
        ["properties", "receipts"].map((section) => (
          <iframe
            key={section + documents[section]}
            ref={(node) => {
              printFrames.current[section] = node;
            }}
            title={label(
              section === "properties" ? "printProperties" : "printReceipts",
            )}
            className="print-output-frame"
            aria-hidden="true"
            tabIndex={-1}
            srcDoc={documents[section]}
            sandbox="allow-same-origin allow-modals"
            onLoad={() =>
              setPrintReady((previous) => ({
                ...previous,
                [section]: documents[section],
              }))
            }
          />
        ))}
    </main>
  );
}
