import React, { useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { addFund, deleteFund, editFund, validateFund } from "../../../api/services/fundService";
import renderFieldErrors from "../../../utils/renderFieldErrors";

const ModalFund = ({ show, handleClose, condominium, fund, onSaved }) => {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showHomesModal, setShowHomesModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedFeeIds, setSelectedFeeIds] = useState([]);
    const isEditing = Boolean(fund?.id);
    const fundFeeLimit = fund?.fundFeeLimit ?? condominium?.fundFeeLimit ?? 6;
    const availableFees = (condominium?.fees || []).filter((fee) =>
        fee.fund && (fee.fundId == null || Number(fee.fundId) === Number(fund?.id))
    );

    const showRequestError = (error) => {
        const code = error?.response?.data?.message;
        if (code) {
            toast.warning(t(`finance:${code}`), { transition: Bounce });
        } else {
            toast.error(t("server:error"), { transition: Bounce });
        }
    };

    useEffect(() => {
        if (!show) return;
        setName(fund?.name || "");
        setErrors({});
        setStep(1);
        setSelectedFeeIds(
            fund?.id
                ? (condominium?.fees || [])
                    .filter((fee) => Number(fee.fundId) === Number(fund.id))
                    .map((fee) => fee.id)
                : []
        );
    }, [show, fund?.id, fund?.name, condominium?.fees]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (step === 1) {
            setSaving(true);
            try {
                await validateFund({ condominiumId: condominium.id, name, fundId: fund?.id });
                setErrors({});
                setStep(2);
            } catch (error) {
                if (error.isValidationError) {
                    const validationErrors = error.validationErrors || error.errors || {};
                    if (Object.keys(validationErrors).length > 0) setErrors(validationErrors);
                    else showRequestError(error);
                } else {
                    showRequestError(error);
                }
            } finally {
                setSaving(false);
            }
            return;
        }
        setSaving(true);
        try {
            const payload = { condominiumId: condominium.id, name, feeIds: selectedFeeIds };
            if (isEditing) await editFund({ ...payload, fundId: fund.id });
            else await addFund(payload);
            handleClose();
            await onSaved?.();
            toast.success(t(isEditing ? "finance:fundUpdated" : "finance:fundCreated"), { transition: Bounce });
        } catch (error) {
            if (error.isValidationError) {
                const validationErrors = error.validationErrors || error.errors || {};
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                } else {
                    showRequestError(error);
                }
            } else {
                showRequestError(error);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!fund?.id) return;
        setSaving(true);
        try {
            await deleteFund({ condominiumId: condominium.id, fundId: fund.id });
            toast.success(t("finance:fundDeleted"), { transition: Bounce });
            setShowDeleteConfirm(false);
            handleClose();
            await onSaved?.();
        } catch (error) {
            showRequestError(error);
        } finally {
            setSaving(false);
        }
    };

    const openHomesModal = (fee) => {
        setSelectedFee(fee);
        setShowHomesModal(true);
    };

    const closeHomesModal = () => {
        setShowHomesModal(false);
    };

    const relatedHomes = selectedFee
        ? (condominium?.homes || []).filter((home) =>
            selectedFee.homeIds?.some((homeId) => Number(homeId) === Number(home.id))
        )
        : [];

    const getOwnerName = (home) => {
        const owner = home.owner;
        return owner ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim() : "";
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        <div className="fs-5">
                            <span className="pe-2">{t(isEditing ? "edit" : "add")}</span>
                            <span className="bg-secondary bg-opacity-50 border border-3 border-primary px-1 rounded">{t("finance:fund")}</span>
                            <div className="mt-2">{t("in")}
                                <span className="fst-italic text-primary border border-3 border-primary rounded px-1 ms-1">{condominium?.name || ""}</span>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit}>
                    <Modal.Body className="position-relative">
                        {saving && (
                            <div
                                className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center rounded"
                                style={{ zIndex: 10 }}
                            >
                                <div className="text-center">
                                    <div
                                        className="spinner-border text-primary"
                                        style={{ width: "3rem", height: "3rem" }}
                                    />
                                    <div className="mt-2 fw-bold">{t("saving")}</div>
                                </div>
                            </div>
                        )}
                        {step === 1 ? <div className="registrationForm bg-secondary bg-opacity-50">
                            <div className="mb-2">
                                <label htmlFor="fund-name">{t("name")}</label>
                                <input id="fund-name" name="name" type="text" value={name}
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        if (errors.name) setErrors((current) => ({ ...current, name: null }));
                                    }} placeholder={t("name")} autoFocus maxLength={50} />
                                {renderFieldErrors(errors, "name", t)}
                            </div>
                        </div> :
                            <div>
                                <h5 className="fw-bold text-center">
                                    <span className="text-decoration-underline">
                                        {t("finance:assignFundFees")}
                                    </span>
                                </h5>
                                <div className="alert alert-light d-flex fw-bold justify-content-center p-1 shadow-sm">
                                    <span>{t("finance:fund")}</span>
                                    <span className="text-primary ms-2">{name}</span>
                                </div>
                                {availableFees.length === 0 ? (
                                    <p className="mb-0 text-muted text-center">
                                        {t("finance:noUnassignedFundFees")}
                                    </p>
                                ) : (
                                    <>
                                        <Table bordered striped hover size="sm"
                                            className="mb-0 text-center">
                                            <thead>
                                                <tr>
                                                    <th>{t("name")}</th>
                                                    <th>{t("value")}</th>
                                                    <th>{t("home:homes")}</th>
                                                    <th>{t("select")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {availableFees.map((fee) => (
                                                    <tr key={fee.id}>
                                                        <td>{fee.name}</td>
                                                        <td>€ {Number(fee.value || 0).toFixed(2)}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-link p-0 fw-bold"
                                                                onClick={() => openHomesModal(fee)}
                                                                disabled={!fee.homes}
                                                                aria-label={`${t("home:homes")}: ${fee.homes}`}
                                                            >
                                                                {fee.homes}
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <input
                                                                type="checkbox"
                                                                aria-label={`${t("select")} ${fee.name}`}
                                                                checked={selectedFeeIds.includes(fee.id)}
                                                                disabled={
                                                                    !selectedFeeIds.includes(fee.id)
                                                                    && selectedFeeIds.length >= fundFeeLimit
                                                                }
                                                                onChange={() => setSelectedFeeIds((current) => current.includes(fee.id)
                                                                    ? current.filter((id) => id !== fee.id)
                                                                    : [...current, fee.id])}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        <div className={`d-flex justify-content-center align-items-center text-center mt-2 fw-bolder ${selectedFeeIds.length === 0 ? "text-danger" : "text-muted"}`}>
                                            {selectedFeeIds.length === 0
                                                ? t("finance:selectAtLeastOneFundFee")
                                                : selectedFeeIds.length >= fundFeeLimit
                                                    ? t("finance:fundFeeLimitReached")
                                                    : <>
                                                        {t("finance:feeLimit")}:
                                                        <span className="badge bg-danger fs-6 ms-1 pt-1">
                                                            {fundFeeLimit - selectedFeeIds.length}
                                                        </span>
                                                    </>}
                                        </div>
                                    </>
                                )}
                            </div>}
                    </Modal.Body>
                    <div className="d-flex justify-content-center mb-3">
                        <button
                            type="submit"
                            className="authentication-button"
                            disabled={saving || (step === 2 && selectedFeeIds.length === 0)}
                        >
                            {t(step === 1 ? "next" : "save")}
                        </button>
                    </div>
                    <Modal.Footer className="d-flex">
                        {step === 2 &&
                            <button type="button"
                                className="authentication-button text-bg-info me-auto"
                                onClick={() => setStep(1)}>
                                ← {t("back")}
                            </button>}
                        {isEditing &&
                            <Button variant="danger"
                                size="sm"
                                className="me-auto"
                                onClick={() => setShowDeleteConfirm(true)}>
                                {t("delete")}
                            </Button>}
                        <Button variant="secondary"
                            className="justify-content-end"
                            onClick={handleClose}>
                            {t("close")}
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
                <Modal.Header closeButton><Modal.Title className="text-danger fw-bold fs-5">{t("finance:fundDeleteTitle")}</Modal.Title></Modal.Header>
                <Modal.Body className="text-center">
                    <h4 className="fw-bold mb-3">{fund?.name}</h4>
                    <div className="border border-danger rounded p-2 bg-danger-subtle">
                        <div className="fw-bold text-danger mb-2 fs-4">⚠️ {t("warning")}</div>
                        <div className="small">
                            <Trans i18nKey="finance:confirmFundDelete" />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>{t("cancel")}</Button>
                    <Button variant="danger" onClick={handleDelete}>{t("delete")}</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showHomesModal}
                onHide={closeHomesModal}
                onClick={(event) => event.stopPropagation()}
                centered size="l">
                <Modal.Header closeButton>
                    <Modal.Title className="fs-6">
                        <div className="fw-bold">
                            {selectedFee?.name}
                        </div>
                        <div>
                            {t("home:homes")}
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table bordered striped hover size="sm" className="mb-0 text-center align-middle">
                        <thead>
                            <tr>
                                <th>{t("home:fl")}</th>
                                <th>{t("name")}</th>
                                <th>{t("home:owner")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relatedHomes.map((home) => (
                                <tr key={home.id}>
                                    <td>{home.floor}</td>
                                    <td>{home.name}</td>
                                    <td>{getOwnerName(home) || <span className="text-muted">{t("common:noInfo")}</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ModalFund;
