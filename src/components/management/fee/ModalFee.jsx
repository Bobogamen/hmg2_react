import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation, Trans } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { useLoading } from "../../../loader/LoadingContext";
import { useUser } from "../../../user/UserContext";
import renderFieldErrors from "../../../utils/renderFieldErrors";
import { validateFee, addFee, editFee, deleteFee } from "../../../api/services/feeService";
import "./Fee.css";
import PrimaryFeeInfo from "./PrimaryFeeInfo";
import MonthlyFeeInfo from "./MonthlyFeeInfo";
import FundFeeInfo from "./FundFeeInfo";
import resolveValidationMessage from "../../../utils/resolveValidationMessage";

const initialState = {
    name: "",
    value: "",
    monthly: true,
    primary: false,
    fund: false,
};

const ModalFee = ({ show, handleClose, condominium, fee, onSaved }) => {
    const { t } = useTranslation();
    const { setIsLoading } = useLoading();
    const { updateUser } = useUser();
    const isEditing = !!fee?.id;

    const [step, setStep] = useState(1);
    const [feeData, setFeeData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [selectedHomes, setSelectedHomes] = useState([]);
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const homes = condominium?.homes || [];
    const assignableHomes = feeData.primary
        ? homes.filter((home) =>
            !home.hasPrimaryFee || (isEditing && fee?.homeIds?.includes(home.id))
        )
        : homes;

    const [hideMainModal, setHideMainModal] = useState(false);
    const [showMonthlyInfoModal, setShowMonthlyInfoModal] = useState(false);
    const [showFundInfoModal, setShowFundInfoModal] = useState(false);
    const [showPrimaryInfoModal, setShowPrimaryInfoModal] = useState(false);
    const [showPrimaryConfirm, setShowPrimaryConfirm] = useState(false);

    const showFeeValidationToast = (error) => {
        const responseMessage = error?.response?.data?.message || error?.response?.data?.detail;
        const validationErrors = error?.validationErrors || error?.errors || error?.response?.data?.errors;
        const validationError = typeof validationErrors === "string"
            ? { code: validationErrors }
            : Object.values(validationErrors || {})
                .flat()
                .find((item) => item?.code);
        const validationCode = responseMessage || resolveValidationMessage(validationError, t);

        if (validationCode === "feeAlreadyExists"
            || validationCode === "primaryMustBeMonthly"
            || validationCode === "homeFeeAlreadyPrimary") {
            toast.warning(t(`finance:${validationCode}`), {
                transition: Bounce,
            });
            return true;
        }

        return false;
    };

    /*
          LOAD DATA
      */
    useEffect(() => {
        if (!show) {
            return;
        }
        if (isEditing) {
            setFeeData({
                name: fee?.name || "",
                value: fee?.value || "",
                monthly: fee?.fund ? true : (fee?.monthly ?? fee?.primary ?? true), // Fund and primary fees must be monthly
                primary: fee?.fund ? false : (fee?.primary || false),
                fund: fee?.fund || false,
            });
        } else {
            setFeeData({
                ...initialState,
            });
        }
        setErrors({});
        setStep(1);
        setSelectedHomes(
            isEditing
                ? (fee?.homeIds || [])
                : (condominium?.homes || []).map(home => home.id)
        );

    }, [show,
        fee?.id,
        fee?.name,
        fee?.value,
        fee?.monthly,
        fee?.primary,
        fee?.fund,
        fee?.homeIds,
        isEditing,
        condominium?.homes
    ]);

    /*
          INPUT CHANGE
      */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeeData((prev) => ({
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

    /*
          MONTHLY CHECKBOX
      */
    const handleMonthlyChange = (e) => {
        setFeeData((prev) => ({
            ...prev,
            monthly: e.target.checked,
        }));
    };

    /*
      FUND CHECKBOX
  */
    const handleFundChange = (e) => {
        const isChecked = e.target.checked;
        setFeeData((prev) => ({
            ...prev,
            fund: isChecked,
            monthly: isChecked ? true : prev.monthly,
            primary: isChecked ? false : prev.primary,
        }));
    };

    /*
      MAINT CHECKBOX
  */
    const handlePrimaryFeeChange = (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            setHideMainModal(true);
            setShowPrimaryInfoModal(true);
            return;
        }
        setFeeData((prev) => ({
            ...prev,
            primary: false,
        }));
    };

    const confirmPrimaryFee = () => {
        setShowPrimaryConfirm(false);
        setHideMainModal(false);
        setSelectedHomes((previousHomeIds) => previousHomeIds.filter((homeId) =>
            homes.some((home) =>
                home.id === homeId
                && (!home.hasPrimaryFee || (isEditing && fee?.homeIds?.includes(home.id)))
            )
        ));
        setTimeout(() => {
            setFeeData((prev) => ({
                ...prev,
                primary: true,
                monthly: true,
                fund: false,
            }));
        }, 400);
    };
    /*
      CLOSE HELPERS
  */
    const closePrimaryInfoModal = () => {
        setShowPrimaryInfoModal(false);
        setHideMainModal(false);
    };

    const closePrimaryConfirmModal = () => {
        setShowPrimaryConfirm(false);
        setHideMainModal(false);
    };

    /*
          SIMPLE STEP 1 VALIDATION
      */
    const validateStepOne = async () => {
        setSaving(true);
        try {
            await validateFee({
                condominiumId: condominium.id,
                name: feeData.name,
                value: feeData.value,
                monthly: feeData.monthly,
                primary: feeData.primary,
                fund: feeData.fund,
                feeId: fee?.id,
                homeIds: selectedHomes
            });

            setErrors({});
            setStep(2);

        } catch (error) {

            if (showFeeValidationToast(error)) {
                return;
            }

            if (error.isValidationError) {
                setErrors(error.validationErrors || {});
            } else {
                toast.error(t("server:error"));
            }

        } finally {
            setSaving(false);
        }
    };

    /*
          CONTINUE / SAVE BUTTON
      */
    const handleContinue = async (e) => {
        e.preventDefault();

        if (step === 1) {
            await validateStepOne();
            return;
        }

        await saveFee();
    };

    /*
          SELECT ALL HOMES
      */
    const allHomesSelected =
        assignableHomes.length > 0 &&
        assignableHomes.every((home) => selectedHomes.includes(home.id));

    const toggleAllHomes = () => {
        if (allHomesSelected) {
            setSelectedHomes([]);
        } else {
            setSelectedHomes(assignableHomes.map(home => home.id));
        }
    };

    /*
          CREATE / UPDATE
      */
    const saveFee = async () => {
        setSaving(true);
        setIsLoading(true);
        try {
            const payload = {
                condominiumId: condominium.id,
                name: feeData.name,
                value: feeData.value,
                monthly: feeData.monthly,
                primary: feeData.primary,
                fund: feeData.fund,
                homeIds: selectedHomes,
            };
            if (isEditing) {
                await editFee({
                    ...payload,
                    feeId: fee.id,
                });
            } else {
                await addFee(payload);
            }
            resetForm();
            handleClose();
            updateUser();
            await onSaved?.();
            toast.success(
                isEditing ? t("finance:feeUpdated") : t("finance:feeCreated")
            );
        } catch (error) {
            if (showFeeValidationToast(error)) {
                return;
            }

            if (error.isValidationError) {
                setErrors(error.validationErrors || error.errors || {});
            } else {
                toast.error(t("server:error"), {
                    transition: Bounce,
                });
            }
        } finally {
            setSaving(false);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!fee?.id) return;

        setSaving(true);
        setIsLoading(true);
        try {
            await deleteFee({ condominiumId: condominium.id, feeId: fee.id });
            setShowDeleteConfirm(false);
            resetForm();
            handleClose();
            updateUser();
            await onSaved?.();
            toast.success(t("finance:feeDeleted"), { transition: Bounce });
        } catch (error) {
            const errorCode = error?.response?.data?.message;
            toast.error(
                errorCode ? t(`validation:${errorCode}`) : t("server:error"),
                { transition: Bounce }
            );
        } finally {
            setSaving(false);
            setIsLoading(false);
        }
    };

    /*
          SELECT HOME
      */
    const toggleHome = (homeId) => {
        setSelectedHomes((prev) => {
            if (prev.includes(homeId)) {
                return prev.filter((id) => id !== homeId);
            }
            return [...prev, homeId];
        });
    };

    /*
          RESET
      */
    const resetForm = () => {
        setFeeData({
            ...initialState,
        });
        setErrors({});
        setStep(1);
        setSelectedHomes([]);
    };

    return (
        <>
            <Modal show={show && !hideMainModal}
                onHide={handleClose}
                centered
                size="l">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        <div className="fw-bold fs-5">
                            {isEditing ? (
                                <>
                                    <span>{t("edit")} </span>
                                    <span className="bg-info bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 rounded">
                                        {t("finance:fee")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>{t("add")} </span>
                                    <span className="bg-danger bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 rounded">
                                        {t("finance:fee")}
                                    </span>
                                </>
                            )}
                            <div className="mt-2">
                                {t("in")}{" "}
                                <span className="fst-italic text-primary border border-3 border-primary rounded px-1 ms-1">
                                    {condominium?.name}
                                </span>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="position-relative">
                    {saving && (
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center rounded"
                            style={{ zIndex: 10 }}
                        >
                            <div className="text-center">
                                <div
                                    className="spinner-border text-primary"
                                    style={{
                                        width: "3rem",
                                        height: "3rem"
                                    }}
                                />
                                <div className="mt-2 fw-bold">
                                    {t("saving")}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="fee-step-container">
                        <div
                            className={
                                step === 1
                                    ? "fee-step slide-in-right"
                                    : "fee-step slide-in-left"
                            }
                        >
                            {step === 1 && (
                                <form onSubmit={handleContinue}>
                                    <div className="registrationForm mb-3 bg-danger bg-opacity-50">
                                        <div className="fee-form-field">
                                            <label>{t("name")}</label>
                                            <input type="text" name="name"
                                                value={feeData.name}
                                                onChange={handleChange} />
                                            {renderFieldErrors(errors, "name", t)}
                                        </div>
                                        <div className="fee-form-field">
                                            <label>{`${t("value")} €`}</label>
                                            <input type="number" step="0.01" min="0" name="value"
                                                value={feeData.value}
                                                onChange={handleChange} />
                                            {renderFieldErrors(errors, "value", t)}
                                        </div>
                                        <div className="fee-form-option d-flex align-items-center gap-1 mt-2">
                                            <div
                                                className="pointer d-flex align-items-center"
                                                onClick={() => setShowMonthlyInfoModal(true)}>
                                                <span className="mx-1 fs-5">
                                                    {feeData.monthly ? "📅" : "💶"}
                                                </span>
                                                <span className="fw-semibold">
                                                    {t(feeData.monthly
                                                        ? "finance:monthlyFee"
                                                        : "finance:oneTimeFee"
                                                    )}
                                                </span>
                                            </div>
                                            <div className="form-check form-switch m-0">
                                                <input
                                                    className="form-check-input fee-switch"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={feeData.monthly}
                                                    onChange={handleMonthlyChange}
                                                    disabled={feeData.fund || feeData.primary || (isEditing && fee?.primary)}
                                                />
                                            </div>
                                        </div>
                                        <div className="fee-form-option d-flex align-items-center gap-2">
                                            <div className="d-flex align-items-center pointer">
                                                <span className="fs-5 me-1">⭐</span>
                                                <span className="fw-semibold">
                                                    {t("finance:primary")}
                                                </span>
                                            </div>

                                            <div className="form-check form-switch m-0">
                                                <input
                                                    className="form-check-input fee-switch"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={feeData.primary}
                                                    onChange={handlePrimaryFeeChange}
                                                    disabled={feeData.fund || (isEditing && fee?.primary)}
                                                />
                                            </div>
                                        </div>
                                        <div className="fee-form-option d-flex align-items-center gap-2">
                                            <div
                                                className="d-flex align-items-center pointer"
                                                onClick={() => setShowFundInfoModal(true)}>
                                                <span className="fs-5 me-1">💰</span>
                                                <span className="fw-semibold">
                                                    {t("finance:forFund")}
                                                </span>
                                            </div>
                                            <div className="form-check form-switch m-0">
                                                <input
                                                    className="form-check-input fee-switch"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={feeData.fund}
                                                    onChange={handleFundChange}
                                                    disabled={isEditing && fee?.primary}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="authentication-button mt-3 m-auto d-flex align-items-center justify-content-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? <span className="spinner-border spinner-border-sm" />
                                            : t("continue")}
                                    </button>
                                </form>
                            )}

                            {/* HOMES SELECTION */}
                            {step === 2 && (
                                <div>
                                    <h5 className="fw-bold text-center">
                                        <span className="text-decoration-underline">
                                            {t("finance:applyToProperties")}
                                        </span>
                                    </h5>
                                    <div className="alert alert-light border shadow-sm p-2 mb-3">
                                        <div className="d-flex justify-content-center align-items-center gap-1 flex-wrap fw-bold">
                                            {feeData.primary ? (
                                                <span className="fs-5" title={t("finance:primary")}>
                                                    ⭐
                                                </span>
                                            ) : feeData.fund ? (
                                                <span className="fs-5" title={t("finance:fund")}>
                                                    💰
                                                </span>
                                            ) : feeData.monthly ? (
                                                <span className="fs-5" title={t("finance:monthlyFee")}>
                                                    📅
                                                </span>
                                            ) : (
                                                <span className="fs-5" title={t("finance:oneTimeFee")}>
                                                    💶
                                                </span>
                                            )}
                                            <span className="text-bg-warning bg-opacity-25 px-2 rounded">
                                                {feeData.name}
                                            </span>
                                            <span className="text-muted">
                                                -
                                            </span>
                                            <span className="bg-success bg-opacity-25 px-2 rounded">
                                                {feeData.value} €
                                            </span>
                                            {feeData.monthly && (
                                                <span className="text-muted">
                                                    / {t("month")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="card shadow-sm">
                                            <div className="card-body">
                                                <table className="table table-sm table-striped table-bordered border-1 table-hover text-center">
                                                    <thead>
                                                        <tr>
                                                            <th>{t("home:floor")}</th>
                                                            <th>{t("name")}</th>
                                                            <th>{t("home:owner")}</th>
                                                            <th>
                                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                                    <input
                                                                        className="width-fit-content pointer"
                                                                        type="checkbox"
                                                                        checked={allHomesSelected}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onChange={toggleAllHomes}
                                                                    />
                                                                    <small>{t("selectAll")}</small>
                                                                </div>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {assignableHomes.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4" className="text-center text-muted">
                                                                    {t("finance:noHomes")}
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            assignableHomes.map((home) => (
                                                                <tr
                                                                    key={home.id}
                                                                    onClick={() => toggleHome(home.id)}
                                                                    style={{ cursor: "pointer" }}
                                                                    role="button"
                                                                >
                                                                    <td>{home.floor}</td>
                                                                    <td>{home.name}</td>
                                                                    <td className="text-start">
                                                                        {home.owner?.firstName} {home.owner?.lastName}
                                                                    </td>
                                                                    <td>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="width-fit-content pointer"
                                                                            checked={selectedHomes.includes(home.id)}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onChange={() => toggleHome(home.id)}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className={`text-center mt-1 fw-bolder ${selectedHomes.length === 0 ? "text-danger" : "text-muted"
                                                    }`}>
                                                    {selectedHomes.length === 0
                                                        ? t("finance:selectAtLeastOneHome")
                                                        : t("finance:selectedHomes", {
                                                            selected: selectedHomes.length,
                                                            total: assignableHomes.length
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                        <button type="button"
                                            className="authentication-button text-bg-info"
                                            onClick={() => setStep(1)}>
                                            ← {t("back")}
                                        </button>
                                        <button
                                            type="button"
                                            className="authentication-button d-flex align-items-center justify-content-center gap-2"
                                            onClick={saveFee}
                                            disabled={saving || selectedHomes.length === 0}
                                        >
                                            {saving && (
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {saving ? t("saving") : t("save")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    {isEditing && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={saving}
                        >
                            {t("delete")}
                        </Button>
                    )}
                    <Button className="text-end" variant="secondary" onClick={handleClose}>
                        {t("close")}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger fw-bold fs-5">
                        {t("finance:feeDeleteTitle")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <h4 className="fw-bold mb-3">{fee?.name}</h4>
                    <div className="border border-danger rounded p-2 bg-danger-subtle">
                        <div className="fw-bold text-danger mb-2 fs-4">⚠️ {t("warning")}</div>
                        <div className="small">
                            <Trans i18nKey="finance:confirmFeeDelete" />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        {t("cancel")}
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={saving}>
                        {t("delete")}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showMonthlyInfoModal} onHide={() => setShowMonthlyInfoModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        📅{`${t("finance:monthlyFee")} ${t("and")} 💶${t("finance:oneTimeFee")} ${t("finance:fee")}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center"><MonthlyFeeInfo /></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMonthlyInfoModal(false)}>{t("close")}</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showFundInfoModal} onHide={() => setShowFundInfoModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        {`${t("finance:fee")} ${t("for")} 💰${t("finance:fund")}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center"><FundFeeInfo /></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFundInfoModal(false)}>{t("close")}</Button>
                </Modal.Footer>
            </Modal>

            {/* primary FEE INFORAMTION MODAL */}
            <Modal show={showPrimaryInfoModal}
                onHide={closePrimaryInfoModal}
                centered
                size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        ⭐ {`${t("finance:primary")} ${t("finance:fee")}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <PrimaryFeeInfo />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowPrimaryInfoModal(false);
                            setShowPrimaryConfirm(true);
                        }}
                    >
                        {t("common:understand")}
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* primary FEE CONFIRMATION */}
            <Modal
                show={showPrimaryConfirm}
                onHide={closePrimaryConfirmModal}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold text-warning">
                        {t("finance:primaryFeeConfirmation.title")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <div className="d-flex justify-content-center align-items-center mt-0 mb-3">
                            <span className="fs-2 me-0">⚠️</span>
                            <div className="d-block ms-1">
                                <Trans i18nKey="finance:primaryFeeConfirmation.question"
                                    components={{
                                        strong: <strong />,
                                        u: <u />
                                    }}
                                />
                            </div>
                        </div>
                        <div className="border border-warning rounded bg-warning-subtle p-2">
                            <Trans i18nKey="finance:primaryFeeConfirmation.description"
                                components={{
                                    strong: <strong />,
                                    u: <u />
                                }}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowPrimaryConfirm(false);
                            setHideMainModal(false);
                        }}>
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="info"
                        onClick={confirmPrimaryFee}
                        className="fw-bold">
                        ⭐ {t("finance:primaryFeeConfirmation.confirm")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default ModalFee;
