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

const initialState = {
    name: "",
    value: "",
    monthly: true,
    primary: false,
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    const homes = condominium?.homes || [];

    const [hideMainModal, setHideMainModal] = useState(false);
    const [openMonthlyInfo, setOpenMonthlyInfo] = useState(false);
    const [showPrimaryInfoModal, setShowPrimaryInfoModal] = useState(false);
    const [showPrimaryConfirm, setShowPrimaryConfirm] = useState(false);

    // const [validating, setValidating] = useState(false);

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
                monthly: fee?.monthly ?? fee?.primary ?? true, // If primary, monthly must be true
                primary: fee?.primary || false,
            });
        } else {
            setFeeData({
                ...initialState,
            });
        }
        setErrors({});
        setStep(1);
        setSelectedHomes([]);
        setSelectedHomes((condominium?.homes || []).map(home => home.id));

    }, [show,
        fee?.id,
        fee?.name,
        fee?.value,
        fee?.monthly,
        fee?.primary,
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
        setTimeout(() => {
            setFeeData((prev) => ({
                ...prev,
                primary: true,
                monthly: true,
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
                feeId: fee?.id // optional while editing
            });

            setErrors({});
            setStep(2);

        } catch (error) {

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
        homes.length > 0 &&
        selectedHomes.length === homes.length;

    const toggleAllHomes = () => {
        if (allHomesSelected) {
            setSelectedHomes([]);
        } else {
            setSelectedHomes(homes.map(home => home.id));
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

    /*
          DELETE
      */
    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await deleteFee({
                condominiumId: condominium.id,
                feeId: fee.id,
            });
            toast.error(t("finance:feeDeleted"));
            handleClose();
            updateUser();
            await onSaved?.();
        } catch (error) {
            toast.error(t("server:error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal show={show && !hideMainModal} onHide={handleClose} centered>
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
                                <span className="text-muted fst-italic border border-3 border-secondary rounded px-1">
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
                                        <div>
                                            <label>{t("name")}</label>
                                            <input type="text" name="name"
                                                value={feeData.name}
                                                onChange={handleChange} />
                                            {renderFieldErrors(errors, "name", t)}
                                        </div>
                                        <div>
                                            <label>{`${t("value")} €`}</label>
                                            <input type="number" step="0.01" min="0" name="value"
                                                value={feeData.value}
                                                onChange={handleChange} />
                                            {renderFieldErrors(errors, "value", t)}
                                        </div>
                                        <div className="d-flex align-items-center gap-1">
                                            <div
                                                className="pointer d-flex align-items-center"
                                                onClick={() => setOpenMonthlyInfo(v => !v)}>
                                                <span
                                                    className="mx-1 fs-5"
                                                    title={t("clickForMoreInfo")}>
                                                    ℹ️
                                                </span>
                                                <span className="fw-semibold">
                                                    {t(feeData.monthly
                                                        ? "finance:monthlyFee"
                                                        : "finance:oneTimeFee"
                                                    )}
                                                </span>
                                                <span className="mx-1 fs-5">
                                                    {feeData.monthly ? "📅" : "💶"}
                                                </span>
                                            </div>
                                            <div className="form-check form-switch m-0">
                                                <input
                                                    className="form-check-input fee-switch"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={feeData.monthly}
                                                    onChange={handleMonthlyChange}
                                                    disabled={feeData.primary}
                                                />
                                            </div>
                                        </div>
                                        {openMonthlyInfo && (
                                            <span className="alert alert-info mt-1 py-1 px-2 small w-100">
                                                <Trans
                                                    i18nKey="finance:monthlyFeeInfo"
                                                    components={{
                                                        strong: <strong />,
                                                        u: <u />
                                                    }}
                                                />
                                            </span>
                                        )}
                                        <div className="d-flex align-items-center gap-2">
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
                                            {feeData.primary && (
                                                <span className="fs-5"
                                                    title={t("finance:primary")}>
                                                    ⭐
                                                </span>
                                            )}
                                            {feeData.monthly ? (
                                                <span className="fs-5"
                                                    title={t("finance:monthlyFee")}>
                                                    📅
                                                </span>
                                            ) : (
                                                <span className="fs-5"
                                                    title={t("finance:oneTimeFee")}>
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
                                                        {homes.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4" className="text-center text-muted">
                                                                    {t("finance:noHomes")}
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            homes.map((home) => (
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
                                                            total: homes.length
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
                <Modal.Footer className={isEditing ? "justify-content-between" : ""}>
                    {isEditing && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            {t("delete")}
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleClose}>
                        {t("close")}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* primary FEE INFORAMTION MODAL */}
            <Modal
                show={showPrimaryInfoModal}
                onHide={closePrimaryInfoModal}
                centered
                size="xl"
            >
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
            {/* DELETE CONFIRMATION */}
            <Modal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                centered >
                <Modal.Header closeButton>
                    <Modal.Title
                        className="
                            text-danger
                            fw-bold
                            fs-5
                        "
                    >
                        {t("finance:confirmDeleteTitle")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <h4 className="fw-bold mb-3">{fee?.name}</h4>
                        <div
                            className="
                            border
                            border-danger
                            rounded
                            p-2
                            bg-danger-subtle
                        "
                        >
                            <div
                                className="
                                fw-bold
                                text-danger
                                mb-2
                                fs-4
                            "
                            >
                                ⚠️ {t("warning")}
                            </div>
                            <div className="small">
                                <Trans
                                    i18nKey="
                                        finance:deleteWarning
                                    "
                                />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer
                    className="
                        justify-content-between
                    "
                >
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowPrimaryConfirm(false);
                            setHideMainModal(false);
                        }}
                    >
                        {t("cancel")}
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        {t("delete")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default ModalFee;