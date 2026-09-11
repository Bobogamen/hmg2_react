import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { registerCashier } from "../../api/services/cashierService";
import renderFieldErrors from "../../utils/renderFieldErrors";
import apartments from "../../assets/images/app/apartment_building.png";

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

export default function ModalCashier({ show, handleClose, overview, onSaved }) {
  const { t, i18n } = useTranslation([
    "dashboard",
    "common",
    "auth",
    "profile",
    "validation",
  ]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const limitReached = overview.cashiers.length >= overview.cashierLimit;

  useEffect(() => {
    if (show) {
      setForm(initialForm);
      setErrors({});
    }
  }, [show]);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || limitReached) return;
    submitting.current = true;
    setSaving(true);
    setErrors({});
    try {
      const result = await registerCashier({
        ...form,
        language: i18n.language,
      });
      onSaved(result);
      handleClose();
      toast.success(t("cashierPage.created"), { transition: Bounce });
    } catch (failure) {
      setErrors(
        failure.validationErrors || failure.response?.data?.errors || {},
      );
    } finally {
      submitting.current = false;
      setSaving(false);
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
          className="fs-5 fw-bold d-flex align-items-center gap-2"
        >
          {t("cashierPage.register")}
          <span className="bg-dark bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 rounded">
            {t("cashier")}
          </span>
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={submit} className="cashier-modal-form" aria-busy={saving}>
        <Modal.Body>
          <fieldset
            disabled={saving || limitReached}
            className="cashier-registration-fields"
          >
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
                      name === "name" ? 3 : type === "password" ? 6 : undefined
                    }
                    maxLength={
                      name === "name" || type === "password" ? 20 : undefined
                    }
                    autoComplete={type === "password" ? "new-password" : "off"}
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
            <fieldset className="cashier-assignment mt-3">
              <legend className="fs-6 fw-bold">
                {t("cashierPage.assign")}
                <span className="badge text-bg-secondary ms-2">
                  {form.condominiumIds.length} / {overview.condominiums.length}
                </span>
              </legend>
              <p className="small text-muted">
                {t("cashierPage.assignmentHint")}
              </p>
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
          <Button
            variant="primary"
            type="submit"
            disabled={saving || limitReached}
          >
            {saving && (
              <Spinner animation="border" size="sm" className="me-2" />
            )}
            {t(saving ? "cashierPage.saving" : "auth:register")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
