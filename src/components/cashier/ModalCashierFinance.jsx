import React, { useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { saveCashierFinanceEntry } from "../../api/services/cashierService";
import renderFieldErrors from "../../utils/renderFieldErrors";
import ReceiptOption from "../common/ReceiptOption";
import "./CashierManagement.css";

const requestId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export default function ModalCashierFinance({
  mode,
  billId,
  bills,
  condominiumId,
  condominiumName,
  month,
  onClose,
  onSaved,
  onRefresh,
}) {
  const { t, i18n } = useTranslation();
  const label = (key) => t(`dashboard:cashierFinance.${key}`);
  const [data, setData] = useState({
    billId: billId ? String(billId) : "",
    name: "",
    value: "",
    documentNumber: "",
    documentDate: format(new Date(), "yyyy-MM-dd"),
    createReceipt: false,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const pending = useRef(false);
  const submission = useRef(null);
  const [id] = useState(requestId);
  const title = label(
    mode === "bill" ? "pay" : mode === "income" ? "addIncome" : "addExpense",
  );
  const formColor =
    mode === "bill"
      ? "bg-warning"
      : mode === "income"
        ? "bg-success"
        : "bg-danger";
  const period = new Intl.DateTimeFormat(i18n.language, {
    month: "long",
    year: "numeric",
  }).format(new Date(month.year, month.number - 1, 1));
  const change = (event) => {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (pending.current || blocked || month.completed) return;
    pending.current = true;
    setSaving(true);
    setErrors({});
    setError("");
    const payload = submission.current || {
      condominiumId,
      monthId: month.id,
      mode,
      requestId: id,
      ...(mode === "bill"
        ? { billId: Number(data.billId) }
        : { name: data.name.trim() }),
      value: data.value,
      documentNumber: data.documentNumber.trim(),
      documentDate: data.documentDate,
      createReceipt: mode !== "bill" && data.createReceipt,
    };
    try {
      const result = await saveCashierFinanceEntry(payload);
      onSaved(result);
    } catch (failure) {
      const fields = failure.validationErrors || failure.response?.data?.errors;
      const code = failure.response?.data?.message;
      if (fields && Object.keys(fields).length) setErrors(fields);
      else if (
        [
          "accountingMonthCompleted",
          "cashierBillAlreadyPaid",
          "cashierRequestChanged",
          "cashierAmountLimit",
        ].includes(code)
      ) {
        setError(code);
        setBlocked(true);
      } else if (failure.response?.status === 400) {
        setError("invalidEntry");
      } else if ([403, 404].includes(failure.response?.status)) {
        setError("entryUnavailable");
        setBlocked(true);
      } else {
        // Keep the identical request on retry: the server may already have saved it.
        submission.current = payload;
        setUncertain(true);
        setError("saveUnconfirmed");
      }
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  const close = () => {
    if (!pending.current) onClose();
  };
  return (
    <Modal
      show
      onHide={close}
      centered
      backdrop={saving ? "static" : true}
      keyboard={!saving}
      aria-labelledby="cashier-finance-modal-title"
    >
      <Modal.Header closeButton={!saving}>
        <Modal.Title id="cashier-finance-modal-title" className="fs-5 fw-bold">
          {mode === "bill" ? label("pay") : t("common:add")}{" "}
          <span
            className={`${formColor} bg-opacity-50 border border-3 border-primary px-1 rounded`}
          >
            {label(
              mode === "bill"
                ? "bill"
                : mode === "income"
                  ? "income"
                  : "expense",
            )}
          </span>
          {condominiumName && (
            <div className="mt-2">
              {t("common:in")}
              <span className="fst-italic text-primary border border-3 border-primary rounded px-1 ms-1">
                {condominiumName}
              </span>
            </div>
          )}
          <small className="d-block text-muted fs-6 mt-1 text-capitalize">
            {period}
          </small>
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={submit}>
        <Modal.Body>
          <fieldset
            className={`registrationForm mb-3 ${formColor} bg-opacity-50`}
            disabled={saving || uncertain || blocked || month.completed}
          >
            {mode === "bill" ? (
              <div className="mb-2">
                <label htmlFor="cashier-finance-billId">{label("bill")}</label>
                <select
                  className="form-select"
                  id="cashier-finance-billId"
                  name="billId"
                  required
                  value={data.billId}
                  onChange={change}
                >
                  <option value="">{label("selectBill")}</option>
                  {bills.map((bill) => (
                    <option key={bill.id} value={bill.id}>
                      {bill.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-2">
                <label htmlFor="cashier-finance-name">{label("name")}</label>
                <input
                  id="cashier-finance-name"
                  name="name"
                  maxLength={100}
                  value={data.name}
                  onChange={change}
                  autoFocus
                />
                {renderFieldErrors(errors, "name", t)}
              </div>
            )}
            <div className="mb-2">
              <label htmlFor="cashier-finance-value">
                {label("amount")} (€)
              </label>
              <input
                id="cashier-finance-value"
                name="value"
                type="number"
                inputMode="decimal"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                value={data.value}
                onChange={change}
              />
              {renderFieldErrors(errors, "value", t)}
            </div>
            <div className="cashier-document-fields">
              <div className="mb-2">
                <label htmlFor="cashier-finance-documentNumber">
                  {label("documentNumber")}
                </label>
                <input
                  id="cashier-finance-documentNumber"
                  name="documentNumber"
                  maxLength={30}
                  value={data.documentNumber}
                  onChange={change}
                  disabled={data.createReceipt}
                />
                {renderFieldErrors(errors, "documentNumber", t)}
              </div>
              <div className="mb-2">
                <label htmlFor="cashier-finance-documentDate">
                  {label("documentDate")}
                </label>
                <input
                  id="cashier-finance-documentDate"
                  name="documentDate"
                  type="date"
                  max={format(new Date(), "yyyy-MM-dd")}
                  value={data.documentDate}
                  onChange={change}
                />
                {renderFieldErrors(errors, "documentDate", t)}
              </div>
            </div>
            {mode !== "bill" && (
              <>
                <ReceiptOption
                  id="cashier-finance-create-receipt"
                  checked={data.createReceipt}
                  onChange={(createReceipt) =>
                    setData((current) => ({
                      ...current,
                      createReceipt,
                      documentNumber: createReceipt ? "" : current.documentNumber,
                    }))
                  }
                  translationKey="dashboard:cashierFinance"
                />
              </>
            )}
          </fieldset>
          {error && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              {label(error)}
              {blocked && (
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm d-block mt-2"
                  onClick={() => {
                    onClose();
                    onRefresh();
                  }}
                >
                  {label("refresh")}
                </button>
              )}
            </div>
          )}
        </Modal.Body>
        <div className="d-flex justify-content-center mb-3">
          <button
            type="submit"
            className="authentication-button"
            disabled={saving || blocked || month.completed}
          >
            {saving
              ? label("saving")
              : uncertain
                ? label("retrySameEntry")
                : mode === "bill"
                  ? title
                  : t("common:add")}
          </button>
        </div>
        <Modal.Footer>
          <Button variant="secondary" disabled={saving} onClick={close}>
            {t("common:close")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
