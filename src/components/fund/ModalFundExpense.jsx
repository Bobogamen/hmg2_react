import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { addFundExpense } from "../../api/services/fundService";
import renderFieldErrors from "../../utils/renderFieldErrors";

const ModalFundExpense = ({
  show,
  handleClose,
  condominiumId,
  fund,
  onSaved,
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState({
    name: "",
    value: "",
    documentNumber: "",
    documentDate: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef(false);
  const today = format(new Date(), "yyyy-MM-dd");
  useEffect(() => {
    if (show) {
      setData({ name: "", value: "", documentNumber: "", documentDate: today });
      setErrors({});
      setError(false);
    }
  }, [show, fund.id, today]);
  const submit = async (event) => {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError(false);
    setErrors({});
    try {
      await addFundExpense({
        condominiumId,
        fundId: fund.id,
        ...data,
        name: data.name.trim(),
        documentNumber: data.documentNumber.trim(),
      });
    } catch (failure) {
      const fields =
        failure.validationErrors ||
        failure.errors ||
        failure.response?.data?.errors;
      if (fields && Object.keys(fields).length) setErrors(fields);
      else setError(true);
      pending.current = false;
      setSaving(false);
      return;
    }
    pending.current = false;
    setSaving(false);
    handleClose();
    toast.success(t("finance:repairDetails.expenseAdded"));
    await onSaved?.();
  };
  const fields = [
    ["name", t("name"), "text"],
    ["value", t("value") + " (€)", "number"],
    ["documentNumber", t("finance:repairDetails.documentNumber"), "text"],
    ["documentDate", t("finance:repairDetails.documentDate"), "date"],
  ];
  return (
    <Modal
      show={show}
      onHide={() => !saving && handleClose()}
      centered
      backdrop={saving ? "static" : true}
      keyboard={!saving}
    >
      <Modal.Header closeButton={!saving}>
        {/* <Modal.Title className="fw-bold fs-5">
          {t("finance:repairDetails.addExpense")} — {fund.name}
        </Modal.Title> */}
        <div className="fw-bold fs-5">
          <span>
            {t("finance:repairDetails.addExpense")} {t("for")}{" "}
          </span>
          <span className="bg-secondary bg-opacity-50 border border-3 border-primary px-1 rounded">
            {t("finance:fund")}
          </span>
          <div className="mt-2">
            <span className="fst-italic text-primary border border-3 border-primary rounded px-1 text-break">
              {fund?.name || ""}
            </span>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={submit} className="repair-modal__form">
          <div className="registrationForm mb-3 bg-warning bg-opacity-25">
            {fields.map(([name, label, type]) => (
              <div key={name}>
                <label htmlFor={`fund-expense-${name}`}>{label}</label>
                <input
                  id={`fund-expense-${name}`}
                  name={name}
                  type={type}
                  value={data[name]}
                  disabled={saving}
                  autoFocus={name === "name"}
                  min={type === "number" ? "0.01" : undefined}
                  step={type === "number" ? "0.01" : undefined}
                  max={type === "date" ? today : undefined}
                  maxLength={
                    name === "name"
                      ? 20
                      : name === "documentNumber"
                        ? 30
                        : undefined
                  }
                  onChange={(event) => {
                    setData((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }));
                    setErrors((current) => ({ ...current, [name]: null }));
                  }}
                />
                {renderFieldErrors(errors, name, t)}
              </div>
            ))}
          </div>
          {error && (
            <p className="alert alert-danger" role="alert">
              {t("server:error")}
            </p>
          )}
          <button
            className="authentication-button m-auto"
            type="submit"
            disabled={saving}
          >
            {t(saving ? "saving" : "add")}
          </button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" disabled={saving} onClick={handleClose}>
          {t("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default ModalFundExpense;
