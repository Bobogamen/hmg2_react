import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { format } from "date-fns";

import { addRepairExpense } from "../../api/services/repairService";
import { useLoading } from "../../loader/LoadingContext";
import renderFieldErrors from "../../utils/renderFieldErrors";

const initialState = {
  name: "",
  value: "",
  documentNumber: "",
  documentDate: "",
};

const ModalRepairExpense = ({
  show,
  handleClose,
  condominiumId,
  repair,
  onSaved,
}) => {
  const { t, i18n } = useTranslation();
  const { setIsLoading } = useLoading();

  const [expenseData, setExpenseData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!show) return;

    setExpenseData({
      ...initialState,
      documentDate: today,
    });

    setErrors({});
  }, [show, repair?.id, today]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setExpenseData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (repair?.completed) return;
    setIsLoading(true);

    try {
      await addRepairExpense({
        condominiumId,
        repairId: repair.id,
        name: expenseData.name.trim(),
        value: expenseData.value,
        documentNumber: expenseData.documentNumber.trim(),
        documentDate: expenseData.documentDate,
      });

      resetForm();
      handleClose();

      await onSaved?.();

      toast.success(t("finance:repairDetails.expenseAdded"));
    } catch (error) {
      if (error.response?.data?.message === "repairCompletedExpensesLocked") {
        toast.error(t("finance:repairCompletedExpensesLocked"));
        handleClose();
        await onSaved?.();
        return;
      }
      if (error.isValidationError) {
        setErrors(error.validationErrors || error.errors || {});
      } else {
        const fieldErrors =
          error.validationErrors ||
          error.errors ||
          error.response?.data?.errors;

        if (fieldErrors && Object.keys(fieldErrors).length) {
          setErrors(fieldErrors);
          return;
        }

        const serverMessage = error?.response?.data?.message;

        toast.error(
          serverMessage ? i18n.t(`server:${serverMessage}`) : t("server:error"),
          { transition: Bounce },
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setExpenseData({
      ...initialState,
      documentDate: today,
    });

    setErrors({});
  };

  const closeModal = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal show={show && !repair?.completed} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          <div className="fw-bold fs-5">
            <span>
              {t("finance:repairDetails.addExpense")} {t("for")}{" "}
            </span>
            <span className="bg-success bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 rounded">
              {t("finance:repair")}
            </span>
            <div className="mt-2">
              <span className="fst-italic text-primary border border-3 border-primary rounded px-1 text-break">
                {repair?.name || ""}
              </span>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="registrationForm mb-3 bg-warning bg-opacity-25">
              <div>
                <label htmlFor="expense-name">{t("name")}</label>
                <input
                  id="expense-name"
                  type="text"
                  name="name"
                  value={expenseData.name}
                  onChange={handleChange}
                  placeholder={t("name")}
                  autoFocus
                />
                {renderFieldErrors(errors, "name", t)}
              </div>
              <div>
                <label htmlFor="expense-value">{t("value")} (€)</label>

                <input
                  id="expense-value"
                  type="number"
                  name="value"
                  value={expenseData.value}
                  onChange={handleChange}
                  placeholder={t("value")}
                  min="0.01"
                  step="any"
                />

                {renderFieldErrors(errors, "value", t)}
              </div>

              <div>
                <label htmlFor="expense-documentNumber">
                  {t("finance:repairDetails.documentNumber")}
                </label>

                <input
                  id="expense-documentNumber"
                  type="text"
                  name="documentNumber"
                  value={expenseData.documentNumber}
                  onChange={handleChange}
                  placeholder={t("finance:repairDetails.documentNumber")}
                />

                {renderFieldErrors(errors, "documentNumber", t)}
              </div>

              <div>
                <label htmlFor="expense-documentDate">
                  {t("finance:repairDetails.documentDate")}
                </label>

                <input
                  id="expense-documentDate"
                  type="date"
                  name="documentDate"
                  value={expenseData.documentDate}
                  onChange={handleChange}
                  max={today}
                />

                {renderFieldErrors(errors, "documentDate", t)}
              </div>
            </div>

            <button type="submit" className="authentication-button mt-3 m-auto">
              {t("add")}
            </button>
          </form>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          {t("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRepairExpense;
