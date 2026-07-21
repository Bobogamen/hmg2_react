import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation, Trans } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { useLoading } from "../../../loader/LoadingContext";
import { useUser } from "../../../user/UserContext";
import renderFieldErrors from "../../../utils/renderFieldErrors";
import { addFee, editFee, deleteFee } from "../../../api/services/feeService";
import "./Fee.css";

const initialState = {
    name: "",
    value: "",
    monthly: true,
    main: false,
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

    const [openMonthlyInfo, setOpenMonthlyInfo] = useState(false);
    const [openMainInfo, setMainInfo] = useState(false);

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
                monthly: fee?.monthly || true,
                main: fee?.main || false,
            });
        } else {
            setFeeData({
                ...initialState,
            });
        }
        setErrors({});
        setStep(1);
        setSelectedHomes([]);
    }, [show, fee?.id, fee?.name, fee?.value, fee?.monthly, fee?.main, isEditing]);
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
    const handleMainFeeChange = (e) => {
        setFeeData((prev) => ({
            ...prev,
            main: e.target.checked,
        }));
    };

    /*
          SIMPLE STEP 1 VALIDATION
          Backend validation still remains
      */
    const validateStepOne = () => {
        const newErrors = {};
        if (!feeData.name || feeData.name.trim().length < 3) {
            newErrors.name = [
                {
                    code: "lengthBetween",
                    args: {
                        min: 3,
                        max: 12,
                    },
                },
            ];
        }
        if (!feeData.value || Number(feeData.value) <= 0) {
            newErrors.value = [
                {
                    code: "positiveNumber",
                    args: {},
                },
            ];
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    /*
          CONTINUE / SAVE BUTTON
      */
    const handleContinue = async (e) => {
        e.preventDefault();
        if (step === 1) {
            if (!validateStepOne()) {
                return;
            }
            setStep(2);
            return;
        }
        await saveFee();
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
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        <div className="fw-bold fs-5">
                            {isEditing ? (
                                <>
                                    <span>{t("edit")} </span>
                                    <span
                                        className="
                                        bg-info
                                        bg-opacity-50
                                        border
                                        border-3
                                        border-primary
                                        border-opacity-50
                                        px-1
                                        rounded
                                    "
                                    >
                                        {t("finance:fee")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>{t("add")} </span>
                                    <span
                                        className="
                                        bg-danger
                                        bg-opacity-50
                                        border
                                        border-3
                                        border-primary
                                        border-opacity-50
                                        px-1
                                        rounded
                                    "
                                    >
                                        {t("finance:fee")}
                                    </span>
                                </>
                            )}
                            <div className="mt-2">
                                {t("in")}{" "}
                                <span
                                    className="
                                    text-muted
                                    fst-italic
                                    border
                                    border-3
                                    border-secondary
                                    rounded
                                    px-1
                                "
                                >
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
                                            <input
                                                type="text"
                                                name="name"
                                                value={feeData.name}
                                                onChange={handleChange}
                                            />
                                            {renderFieldErrors(errors, "name", t)}
                                        </div>
                                        <div>
                                            <label>{t("value")}</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                name="value"
                                                value={feeData.value}
                                                onChange={handleChange}
                                            />
                                            {renderFieldErrors(errors, "value", t)}
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between" >
                                            <div
                                                className="d-block pointer"
                                                onClick={() => setOpenMonthlyInfo(v => !v)}
                                            >
                                                <span className="mx-1 fs-5">
                                                    ℹ️
                                                </span>

                                                <label className="pointer">
                                                    {t("finance:monthlyFee")}
                                                </label>
                                            </div>

                                            <div className="form-check form-switch m-0">
                                                <input className="form-check-input monthly-switch border-2 border-dark m-auto"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={feeData.monthly}
                                                    onChange={handleMonthlyChange}
                                                    style={{
                                                        width: "3rem",
                                                        height: "1.5rem",
                                                        cursor: "pointer"
                                                    }} />
                                            </div>
                                        </div>

                                        {openMonthlyInfo && (
                                            <div className="d-inline border border-3 border-info rounded p-1 bg-info-subtle mt-1">
                                                <Trans
                                                    i18nKey="finance:monthlyFeeInfo"
                                                    components={{
                                                        strong: <strong />,
                                                        i: <i />,
                                                        u: <u />
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div className="d-flex align-items-center justify-content-between" >
                                            <div
                                                className="d-block pointer"
                                                onClick={() => setMainInfo(v => !v)}
                                            >
                                                <span className="mx-1 fs-5">
                                                    ℹ️
                                                </span>

                                                <label className="pointer">
                                                    {t("finance:main")}
                                                </label>
                                            </div>

                                            <div className="form-check form-switch m-0">
                                                <input className="form-check-input monthly-switch border-2 border-dark m-auto"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={feeData.main}
                                                    onChange={handleMainFeeChange}
                                                    style={{
                                                        width: "3rem",
                                                        height: "1.5rem",
                                                        cursor: "pointer"
                                                    }} />
                                            </div>
                                        </div>

                                        {openMainInfo && (
                                            <div className="d-inline border border-3 border-info rounded p-1 bg-info-subtle mt-1">
                                                <Trans
                                                    i18nKey="finance:mainFeeInfo"
                                                    components={{
                                                        strong: <strong />,
                                                        i: <i />,
                                                        u: <u />
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="authentication-button mt-3 m-auto d-flex align-items-center justify-content-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving && (
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                            />
                                        )}

                                        {saving ? t("saving") : t("continue")}
                                    </button>
                                </form>
                            )}
                            {step === 2 && (
                                <div>
                                    <h5
                                        className="
                                        fw-bold
                                        text-center
                                    "
                                    >
                                        {t("finance:assignHomes")}
                                    </h5>
                                    <div
                                        className="
                                        table-responsive
                                    "
                                    >
                                        <table
                                            className="
                                            table
                                            table-bordered
                                            table-hover
                                            mt-3
                                        "
                                        >
                                            <thead>
                                                <tr>
                                                    <th>{t("floor")}</th>
                                                    <th>{t("name")}</th>
                                                    <th>{t("owner")}</th>
                                                    <th className="text-center">✓</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {homes.map((home) => (
                                                    <tr key={home.id}>
                                                        <td>{home.floor}</td>
                                                        <td>{home.name}</td>
                                                        <td>
                                                            {home.owner?.firstName} {home.owner?.lastName}
                                                        </td>
                                                        <td
                                                            className="
                                                                text-center
                                                            "
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedHomes.includes(home.id)}
                                                                onChange={() => toggleHome(home.id)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div
                                        className="
                                        d-flex
                                        justify-content-between
                                        mt-3
                                    "
                                    >
                                        <button
                                            type="button"
                                            className="
                                                authentication-button text-bg-info
                                            "
                                            onClick={() => setStep(1)}
                                        >
                                            ← {t("back")}
                                        </button>
                                        <button
                                            type="button"
                                            className="authentication-button d-flex align-items-center justify-content-center gap-2"
                                            onClick={saveFee}
                                            disabled={saving}
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
            {/* DELETE CONFIRMATION */}
            <Modal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                centered
            >
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
                        onClick={() => setShowDeleteConfirm(false)}
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