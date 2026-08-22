import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { addBill, deleteBill, editBill } from "../../../api/services/billService";
import { useLoading } from "../../../loader/LoadingContext";
import renderFieldErrors from "../../../utils/renderFieldErrors";

const initialState = { name: "" };

const ModalBill = ({ show, handleClose, condominium, bill, onSaved }) => {
    const { t } = useTranslation();
    const { setIsLoading } = useLoading();
    const [billData, setBillData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const isEditing = Boolean(bill?.id);

    useEffect(() => {
        if (!show) return;
        setBillData({ name: bill?.name || "" });
        setErrors({});
    }, [show, bill?.id, bill?.name]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setBillData((current) => ({ ...current, [name]: value }));
        if (errors[name]) setErrors((current) => ({ ...current, [name]: null }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setIsLoading(true);
        try {
            if (isEditing) {
                await editBill({ condominiumId: condominium.id, billId: bill.id, name: billData.name });
            } else {
                await addBill({ condominiumId: condominium.id, name: billData.name });
            }
            handleClose();
            await onSaved?.();
            toast.success(t(isEditing ? "finance:billUpdated" : "finance:billCreated"), { transition: Bounce });
        } catch (error) {
            if (error.isValidationError) {
                setErrors(error.validationErrors || error.errors || {});
            } else {
                const code = error?.response?.data?.message;
                if (code) toast.warning(t(`finance:${code}`), { transition: Bounce });
                else toast.error(t("server:error"), { transition: Bounce });
            }
        } finally {
            setSaving(false);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!bill?.id) return;
        setIsLoading(true);
        try {
            await deleteBill({ condominiumId: condominium.id, billId: bill.id });
            toast.success(t("finance:billDeleted"), { transition: Bounce });
            setShowDeleteConfirm(false);
            handleClose();
            await onSaved?.();
        } catch (error) {
            toast.error(t("server:error"), { transition: Bounce });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        <div className="fs-5">
                            <span className="pe-2">
                                {t(isEditing ? "edit" : "add")}
                            </span>
                            <span className="bg-warning bg-opacity-50 border border-3 border-primary px-1 rounded">
                                {t("finance:bill")}
                            </span>
                            <div className="mt-2">
                                {t("in")}
                                <span className="fst-italic text-primary border border-3 border-primary rounded px-1 ms-1">
                                    {condominium?.name || ""}
                                </span>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="registrationForm bg-warning bg-opacity-50">
                            <div className="mb-2">
                                <label htmlFor="bill-name">{t("name")}</label>
                                <input
                                    id="bill-name"
                                    name="name"
                                    type="text"
                                    value={billData.name}
                                    onChange={handleChange}
                                    placeholder={t("name")}
                                    autoFocus
                                    maxLength={50}
                                />
                                {renderFieldErrors(errors, "name", t)}
                            </div>
                        </div>
                    </Modal.Body>
                    <div className="d-flex justify-content-center mb-3">
                        <button
                            type="submit"
                            className="authentication-button"
                            disabled={saving}
                        >
                            {t(isEditing ? "save" : "add")}
                        </button>
                    </div>
                    <Modal.Footer className={isEditing ? "justify-content-between" : ""}>
                        {isEditing && (
                            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                                {t("delete")}
                            </Button>
                        )}
                        <Button variant="secondary" onClick={handleClose}>{t("close")}</Button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered className="bg-dark">
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger fw-bold fs-5">
                        {t("finance:billDeleteTitle")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <h4 className="fw-bold mb-3">{bill?.name}</h4>
                        <div className="border border-danger rounded p-2 bg-danger-subtle">
                            <div className="fw-bold text-danger mb-2 fs-4">⚠️ {t("warning")}</div>
                            <div className="small mt-3">
                                <Trans i18nKey="finance:confirmBillDelete" />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>{t("cancel")}</Button>
                    <Button variant="danger" onClick={handleDelete}>{t("delete")}</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalBill;
