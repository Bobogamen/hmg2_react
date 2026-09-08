import React, { useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { format, isMatch } from "date-fns";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { payRepairInstallment } from "../../api/services/repairService";
import { repairAmount } from "./repairFormatting";
import renderFieldErrors from "../../utils/renderFieldErrors";
import { RepairModalSaving } from "./RepairModalHeader";

const ModalRepairPayment = ({
    condominiumId,
    repair,
    homeName,
    installments,
    handleClose,
    onSaved,
}) => {
    const { t } = useTranslation();
    const unpaid = installments
        .filter((payment) => payment.paidDate == null)
        .sort(
            (a, b) =>
                (a.installmentNumber || 0) - (b.installmentNumber || 0) || a.id - b.id,
        );
    const [paymentId, setPaymentId] = useState(String(unpaid[0]?.id || ""));
    const [paidDate, setPaidDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState(null);
    const [saving, setSaving] = useState(false);
    const submitting = useRef(false);
    const payment = unpaid.find((item) => String(item.id) === paymentId);
    const today = format(new Date(), "yyyy-MM-dd");

    const submit = async (event) => {
        event.preventDefault();
        if (submitting.current || !payment) return;
        if (!paidDate || !isMatch(paidDate, "yyyy-MM-dd") || paidDate > today) {
            setErrors({ paidDate: [{ code: "repairInvalidPaidDate" }] });
            return;
        }
        submitting.current = true;
        setSaving(true);
        setErrors({});
        setRequestError(null);
        try {
            await payRepairInstallment({
                condominiumId,
                repairId: repair.id,
                paymentId: payment.id,
                paidDate,
            });
        } catch (error) {
            const fieldErrors =
                error.validationErrors || error.response?.data?.errors;
            if (fieldErrors && Object.keys(fieldErrors).length)
                setErrors(fieldErrors);
            else {
                const code = error.response?.data?.message;
                setRequestError(
                    [
                        "repairPaymentAlreadyPaid",
                        "repairPaymentNotFound",
                        "repairNotFound",
                        "repairInvalidPaidDate",
                    ].includes(code)
                        ? `finance:${code}`
                        : "server:error",
                );
            }
            submitting.current = false;
            setSaving(false);
            return;
        }
        toast.success(t("finance:repairPayments.saved"));
        handleClose();
        onSaved();
    };

    return (
        <Modal
            show
            onHide={() => !saving && handleClose()}
            centered
            backdrop={saving ? "static" : true}
            keyboard={!saving}
        >
            <Modal.Header closeButton closeLabel={t("close")}>
                <Modal.Title className="fs-5 fw-bold">
                    {t("finance:repairPayments.title")} {t("for")}
                    <div className="text-muted fs-5 fst-italic">
                        {homeName}
                    </div>
                </Modal.Title>
            </Modal.Header>
            <form onSubmit={submit} noValidate>
                <div className="d-grid justify-content-center flex-wrap gap-1 mt-3">
                    <div className="m-auto bg-success bg-opacity-50 border border-3 border-primary px-1 rounded width-fit-content fs-5 fw-bold">
                        {t("finance:repair")}
                    </div>
                    <div className="fst-italic text-primary border border-3 border-primary rounded px-1 text-break width-fit-content fs-5 fw-bold">
                        {repair.name}
                    </div>
                </div>
                <Modal.Body className="position-relative">
                    <RepairModalSaving saving={saving} />
                    {requestError && (
                        <div role="alert" className="alert alert-danger">
                            {t(requestError)}
                            {[
                                "finance:repairPaymentAlreadyPaid",
                                "finance:repairPaymentNotFound",
                            ].includes(requestError) && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm d-block mt-2"
                                        onClick={() => {
                                            handleClose();
                                            onSaved();
                                        }}
                                    >
                                        {t("finance:repairPayments.refresh")}
                                    </button>
                                )}
                        </div>
                    )}
                    <fieldset
                        disabled={saving}
                        className="registrationForm repair-modal__form bg-success bg-opacity-25"
                    >
                        <div className="mb-3">
                            <label
                                htmlFor="repair-payment-installment"
                                className="form-label"
                            >
                                {t("finance:repairDetails.installmentNumber")}
                            </label>
                            <select
                                id="repair-payment-installment"
                                className="form-select"
                                value={paymentId}
                                onChange={(event) => {
                                    setPaymentId(event.target.value);
                                    setRequestError(null);
                                }}
                            >
                                {unpaid.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {t("finance:repairPayments.installmentOption", {
                                            number: item.installmentNumber,
                                            amount: repairAmount(item.value),
                                        })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {payment && (
                            <div className="bg-warning bg-opacity-10 rounded border border-1 border-dark text-center p-3 mb-3">
                                <div className="small text-muted">
                                    {t("finance:repairPayments.paymentAmount")}
                                </div>
                                <strong className="fs-3">{repairAmount(payment.value)}</strong>
                            </div>
                        )}
                        <label htmlFor="repair-payment-date" className="form-label">
                            {t("finance:repairDetails.paidDate")}
                        </label>
                        <input
                            id="repair-payment-date"
                            type="date"
                            className={`form-control ${errors.paidDate?.length ? "is-invalid" : ""}`}
                            value={paidDate}
                            max={today}
                            required
                            aria-invalid={Boolean(errors.paidDate?.length)}
                            onChange={(event) => {
                                setPaidDate(event.target.value);
                                setErrors({});
                            }}
                        />
                        {renderFieldErrors(errors, "paidDate", t)}
                    </fieldset>
                </Modal.Body>
                <div className="d-flex justify-content-center mb-3">
                    <button
                        type="submit"
                        className="authentication-button"
                        disabled={saving || !payment}
                    >
                        {t(saving ? "saving" : "finance:repairPayments.pay")}
                    </button>
                </div>
                <Modal.Footer>
                    <Button variant="secondary" disabled={saving} onClick={handleClose}>
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};
export default ModalRepairPayment;
