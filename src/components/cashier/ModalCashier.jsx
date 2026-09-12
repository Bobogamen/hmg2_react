import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import {
  registerCashier,
  updateCashierCondominiums,
} from "../../api/services/cashierService";
import renderFieldErrors from "../../utils/renderFieldErrors";
import apartments from "../../assets/images/app/apartment_building.png";
import { useLoading } from "../../loader/LoadingContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  condominiumIds: [],
};
const fields = [
  ["name", "text", "common:name"],
  ["email", "email", "Email"],
  ["password", "password", "profile:password"],
  ["confirmPassword", "password", "auth:confirmPassword"],
];

export default function ModalCashier({
  show,
  handleClose,
  overview,
  onSaved,
  cashier = null,
}) {
  const editing = !!cashier;
  const { setIsLoading } = useLoading();
  const { t, i18n } = useTranslation([
    "dashboard",
    "common",
    "auth",
    "profile",
    "validation",
  ]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const limitReached =
    !editing && overview.cashiers.length >= overview.cashierLimit;

  useEffect(() => {
    if (show) {
      setForm(
        cashier
          ? {
              ...initialForm,
              condominiumIds: cashier.condominiums
                .filter((item) =>
                  overview.condominiums.some(
                    (available) => available.id === item.id,
                  ),
                )
                .map((item) => item.id),
            }
          : initialForm,
      );
      setErrors({});
      setSaveError(false);
    }
  }, [show, cashier, overview.condominiums]);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || limitReached) return;
    submitting.current = true;
    setSaving(true);
    setIsLoading(true);
    setErrors({});
    setSaveError(false);
    try {
      const result = editing
        ? await updateCashierCondominiums(cashier.id, form.condominiumIds)
        : await registerCashier({
            ...form,
            language: i18n.language,
            baseUrl: window.location.origin,
          });
      onSaved(result);
      handleClose();
      toast.success(
        t(editing ? "cashierPage.assignmentsSaved" : "cashierPage.created"),
        { transition: Bounce },
      );
    } catch (failure) {
      setSaveError(editing);
      setErrors(
        failure.validationErrors || failure.response?.data?.errors || {},
      );
    } finally {
      submitting.current = false;
      setSaving(false);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        if (!submitting.current) handleClose();
      }}
      centered
      scrollable
      backdrop={saving ? "static" : true}
      keyboard={!saving}
      className="cashier-modal"
      aria-labelledby="cashier-modal-title"
    >
      <Modal.Header closeButton={!saving} closeLabel={t("common:close")}>
        <Modal.Title
          id="cashier-modal-title"
          className="fs-5 fw-bold d-grid align-items-center gap-2"
        >
          {t(editing ? "cashierPage.editAssignments" : "cashierPage.register")}
          <div className="bg-dark bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 rounded width-fit-content">
            {t("cashier")}
          </div>
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={submit} className="cashier-modal-form" aria-busy={saving}>
        <Modal.Body>
          {editing && (
            <p className="card">
              <div className="card-body bg-warning-subtle bg-opacity-10">
                <strong>{cashier.name}</strong>
                <br />
                {cashier.email}
              </div>
            </p>
          )}
          {saveError && (
            <div role="alert" className="alert alert-danger">
              {t("cashierPage.assignmentSaveError")}
            </div>
          )}
          <fieldset
            disabled={saving || limitReached}
            className="cashier-registration-fields"
          >
            {!editing && (
              <div className="registrationForm bg-dark bg-opacity-50">
                {fields.map(([name, type, label], index) => (
                  <div key={name}>
                    <label htmlFor={`cashier-${name}`}>{t(label)}</label>
                    <input
                      id={`cashier-${name}`}
                      type={type}
                      name={name}
                      value={form[name]}
                      autoFocus={index === 0}
                      placeholder={t(label)}
                      minLength={
                        name === "name"
                          ? 3
                          : type === "password"
                            ? 6
                            : undefined
                      }
                      maxLength={
                        name === "name" || type === "password" ? 20 : undefined
                      }
                      autoComplete={
                        type === "password" ? "new-password" : "off"
                      }
                      aria-invalid={Boolean(errors[name]?.length)}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          [name]: event.target.value,
                        }))
                      }
                    />
                    {renderFieldErrors(errors, name, t)}
                  </div>
                ))}
              </div>
            )}
            <fieldset className="cashier-assignment mt-3">
              <legend className="fs-6 fw-bold">
                {t("cashierPage.assign")}
                <span className="badge text-bg-secondary ms-2">
                  {form.condominiumIds.length} / {overview.condominiums.length}
                </span>
              </legend>
              {/* <p className="small text-muted">
                {t(
                  editing
                    ? "cashierPage.editAssignmentHint"
                    : "cashierPage.assignmentHint",
                )}
              </p> */}
              {overview.condominiums.length ? (
                <div className="cashier-assignment-list">
                  {overview.condominiums.map((condo) => (
                    <label className="cashier-assignment-option" key={condo.id}>
                      <input
                        type="checkbox"
                        checked={form.condominiumIds.includes(condo.id)}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setForm((previous) => ({
                            ...previous,
                            condominiumIds: checked
                              ? [...previous.condominiumIds, condo.id]
                              : previous.condominiumIds.filter(
                                  (id) => id !== condo.id,
                                ),
                          }));
                        }}
                      />
                      <img src={apartments} className="icon" alt="" />
                      <span>{condo.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-muted small">
                  {t("cashierPage.noAvailableCondominiums")}
                </p>
              )}
              {renderFieldErrors(errors, "condominiumIds", t)}
            </fieldset>
          </fieldset>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            {t("common:cancel")}
          </Button>
          <button
            className="authentication-button"
            type="submit"
            disabled={saving || limitReached}
          >
            {t(
              saving
                ? "cashierPage.saving"
                : editing
                  ? "common:save"
                  : "auth:register",
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
