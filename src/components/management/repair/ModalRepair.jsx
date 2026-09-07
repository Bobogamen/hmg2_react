import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import {
    addRepair,
    deleteRepair,
    editRepair,
    validateRepair,
} from "../../../api/services/repairService";
import { useLoading } from "../../../loader/LoadingContext";
import renderFieldErrors from "../../../utils/renderFieldErrors";
import resolveValidationMessage from "../../../utils/resolveValidationMessage";
import "../fee/Fee.css";
import { repairSchedule } from "../../../utils/repairSchedule";
const emptyHomes = [];
const initialState = {
    name: "",
    budget: "",
    distributionType: "EQUAL",
    installments: 1,
    homePercentages: {},
};
const ModalRepair = ({ show, handleClose, condominium, repair, onSaved }) => {
    const { t } = useTranslation();
    const { setIsLoading } = useLoading();
    const isEditing = Boolean(repair?.id);
    const [step, setStep] = useState(1);
    const [data, setData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [selectedHomes, setSelectedHomes] = useState([]);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const homes = condominium?.homes || emptyHomes;
    const scheduleLocked = isEditing;
    const installmentsLimit = condominium?.repairInstallmentsLimit ?? 60;
    /*
          SELECTED HOMES
      */
    const allHomesSelected =
        homes.length > 0 && homes.every((home) => selectedHomes.includes(home.id));
    /*
          INITIALIZE
      */
    useEffect(() => {
        if (!show) {
            return;
        }
        if (isEditing) {
            setData({
                name: repair?.name || "",
                budget: repair?.budget ?? "",
                distributionType: repair?.distributionType || "EQUAL",
                installments: repair?.installments || 1,
                homePercentages: repair?.homePercentages || {},
            });
            setSelectedHomes(repair?.homeIds || []);
        } else {
            setData({
                ...initialState,
            });
            setSelectedHomes(homes.map((home) => home.id));
        }
        setErrors({});
        setStep(1);
        setSaving(false);
        setConfirmDelete(false);
    }, [
        show,
        repair?.id,
        repair?.name,
        repair?.budget,
        repair?.distributionType,
        repair?.installments,
        repair?.homeIds,
        repair?.homePercentages,
        isEditing,
        homes,
    ]);
    /*
          INPUT CHANGE
      */
    const handleChange = ({ target }) => {
        const { name, value } = target;
        setData((current) => ({
            ...current,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((current) => ({
                ...current,
                [name]: null,
            }));
        }
    };
    /*
          DISTRIBUTION TYPE
      */
    const handleDistributionChange = (type) => {
        setData((current) => ({
            ...current,
            distributionType: type,
            homePercentages: type === "PERCENTAGE" ? current.homePercentages : {},
        }));
        setErrors((current) => ({
            ...current,
            homePercentages: null,
        }));
    };
    /*
          INSTALLMENTS
      */
    const handleInstallmentsChange = ({ target }) => {
        const value = target.value;
        setData((current) => ({
            ...current,
            installments: value,
        }));
    };
    /*
          HOME PERCENTAGE
      */
    const handleHomePercentageChange = (homeId, value) => {
        setData((current) => ({
            ...current,
            homePercentages: {
                ...current.homePercentages,
                [homeId]: value,
            },
        }));
        setErrors((current) => ({
            ...current,
            homePercentages: null,
        }));
    };
    /*
          SELECT ALL HOMES
      */
    const toggleAllHomes = () => {
        if (allHomesSelected) {
            setSelectedHomes([]);
            return;
        }
        setSelectedHomes(homes.map((home) => home.id));
    };
    /*
          SELECT HOME
      */
    const toggleHome = (homeId) => {
        setSelectedHomes((current) => {
            if (current.includes(homeId)) {
                return current.filter((id) => id !== homeId);
            }
            return [...current, homeId];
        });
    };
    /*
          PERCENTAGE TOTAL
      */
    const percentageTotal = useMemo(() => {
        return selectedHomes.reduce((total, homeId) => {
            return total + Number(data.homePercentages?.[homeId] || 0);
        }, 0);
    }, [selectedHomes, data.homePercentages]);
    /*
          EQUAL HOME AMOUNT
      */
    /*
          ERROR HANDLING
      */
    const showValidationToast = (error) => {
        const responseMessage =
            error?.response?.data?.message || error?.response?.data?.detail;
        const validationErrors =
            error?.validationErrors || error?.errors || error?.response?.data?.errors;
        const validationError =
            typeof validationErrors === "string"
                ? { code: validationErrors }
                : Object.values(validationErrors || {})
                    .flat()
                    .find((item) => item?.code);
        const validationCode =
            responseMessage ? t(`finance:${responseMessage}`, { max: installmentsLimit }) : resolveValidationMessage(validationError, t);
        if (validationCode) {
            toast.warning(validationCode, {
                transition: Bounce,
            });
            return true;
        }
        return false;
    };
    const requestError = (error) => {
        if (showValidationToast(error)) {
            return;
        }
        toast.error(t("server:error"), {
            transition: Bounce,
        });
    };
    /*
          STEP 1 VALIDATION
      */
    const validateStepOne = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await validateRepair({
                condominiumId: condominium.id,
                name: data.name.trim(),
                budget: data.budget,
                repairId: repair?.id,
            });
            setErrors({});
            setStep(2);
        } catch (error) {
            const fieldErrors = error.validationErrors || error.errors || {};
            if (error.isValidationError && Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
                if (fieldErrors.name || fieldErrors.budget) setStep(1);
                else requestError(error);
            } else {
                requestError(error);
            }
        } finally {
            setSaving(false);
        }
    };
    /*
          STEP 2 VALIDATION
      */
    const validateStepTwo = () => {
        if (selectedHomes.length === 0) {
            toast.warning(t("finance:selectAtLeastOneHome"), {
                transition: Bounce,
            });
            return false;
        }
        if (data.distributionType === "PERCENTAGE") {
            if (!Number.isFinite(percentageTotal) || Math.abs(percentageTotal - 100) > 0.00000001) {
                toast.warning(t("finance:repairPercentageMustBe100"), {
                    transition: Bounce,
                });
                return false;
            }
            const invalidPercentage = selectedHomes.some((homeId) => {
                const percentage = Number(data.homePercentages?.[homeId] ?? 0);
                return !Number.isFinite(percentage) || percentage < 0 || percentage > 100 ||
                    !/^\d+(\.\d{1,4})?$/.test(String(data.homePercentages?.[homeId] ?? ""));
            });
            if (invalidPercentage) {
                toast.warning(t("finance:repairInvalidPercentage"), {
                    transition: Bounce,
                });
                return false;
            }
        }
        if (
            !Number.isInteger(Number(data.installments)) ||
            Number(data.installments) < 1 || Number(data.installments) > installmentsLimit
        ) {
            toast.warning(t("finance:repairInvalidInstallments", { max: installmentsLimit }), {
                transition: Bounce,
            });
            return false;
        }
        return true;
    };
    /*
          CONTINUE
      */
    const handleContinue = async (event) => {
        event.preventDefault();
        if (isEditing) {
            await saveRepair();
            return;
        }
        if (step === 1) {
            await validateStepOne();
            return;
        }
        if (validateStepTwo()) await saveRepair();
    };
    /*
          SAVE
      */
    const saveRepair = async () => {
        if (saving) return;
        setSaving(true);
        setIsLoading(true);
        try {
            const payload = {
                condominiumId: condominium.id,
                name: data.name.trim(),
                budget: data.budget,
                homeIds: selectedHomes,
                distributionType: data.distributionType,
                homePercentages:
                    data.distributionType === "PERCENTAGE"
                        ? Object.fromEntries(selectedHomes.map((id) => [id, Number(data.homePercentages[id])])) : {},
                installments: Number(data.installments),
            };
            if (isEditing) {
                await editRepair({
                    condominiumId: condominium.id,
                    repairId: repair.id,
                    name: data.name.trim(),
                });
            } else {
                await addRepair(payload);
            }
            resetForm();
            handleClose();
            await onSaved?.();
            toast.success(
                t(isEditing ? "finance:repairUpdated" : "finance:repairCreated"),
                {
                    transition: Bounce,
                },
            );
        } catch (error) {
            const fieldErrors = error.validationErrors || error.errors || {};
            if (error.isValidationError && Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
                if (fieldErrors.name || fieldErrors.budget) setStep(1);
                else requestError(error);
            } else {
                requestError(error);
            }
        } finally {
            setSaving(false);
            setIsLoading(false);
        }
    };
    /*
          DELETE
      */
    const remove = async () => {
        if (!repair?.id) {
            return;
        }
        setSaving(true);
        setIsLoading(true);
        try {
            await deleteRepair({
                condominiumId: condominium.id,
                repairId: repair.id,
            });
            setConfirmDelete(false);
            resetForm();
            handleClose();
            await onSaved?.();
            toast.success(t("finance:repairDeleted"), {
                transition: Bounce,
            });
        } catch (error) {
            requestError(error);
        } finally {
            setSaving(false);
            setIsLoading(false);
        }
    };
    /*
          RESET
      */
    const resetForm = () => {
        setData({
            ...initialState,
        });
        setErrors({});
        setSelectedHomes([]);
        setStep(1);
    };
    /*
          HOME AMOUNT
      */
    const schedule = useMemo(() => repairSchedule({
        ...data, homeIds: selectedHomes, installmentsLimit,
    }), [data, selectedHomes, installmentsLimit]);
    const equalHomeAmount = schedule.length ? Math.max(...schedule.map((share) => share.total)) : 0;
    const getHomeAmount = (homeId) => data.distributionType === "EQUAL"
        ? equalHomeAmount
        : schedule.find((share) => share.homeId === homeId)?.total || 0;
    const formatMaximumAmount = (amounts) => {
        if (!amounts.length) return "—";
        const roundedAmounts = Math.max(...amounts);
        return Math.ceil(roundedAmounts).toFixed(0);
    };
    const getInstallmentAmount = (homeId) => {
        if (data.distributionType === "EQUAL") {
            return formatMaximumAmount(schedule.map((share) => Math.max(...share.payments)));
        }
        const payments = schedule.find((share) => share.homeId === homeId)?.payments || [];
        return formatMaximumAmount(payments);
    };
    return (
        <>
            {/* =====================================================
                MAIN MODAL
            ===================================================== */}
            <Modal show={show} onHide={handleClose} centered size={step === 2 ? "lg" : undefined}>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        <div className="fs-5">
                            <span className="pe-2">{t(isEditing ? "edit" : "add")}</span>
                            <span className="bg-success bg-opacity-50 border border-3 border-primary px-1 rounded">
                                {t("finance:repair")}
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
                                        height: "3rem",
                                    }}
                                />
                                <div className="mt-2 fw-bold">{t("saving")}</div>
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
                            {/* =================================================
                                STEP 1 — REPAIR INFORMATION
                            ================================================= */}
                            {step === 1 && (
                                <form onSubmit={handleContinue}>
                                    <div className="registrationForm mb-3 bg-success bg-opacity-50">
                                        <div className="fee-form-field">
                                            <label htmlFor="repair-name">{t("name")}</label>
                                            <input
                                                id="repair-name"
                                                name="name"
                                                type="text"
                                                value={data.name}
                                                onChange={handleChange}
                                                placeholder={t("name")}
                                                autoFocus
                                                maxLength={30}
                                            />
                                            {renderFieldErrors(errors, "name", t)}
                                        </div>
                                        <div className="fee-form-field">
                                            <label htmlFor="repair-budget">
                                                {t("finance:budget")} €
                                            </label>
                                            <input
                                                id="repair-budget"
                                                name="budget"
                                                type="number"
                                                min="1"
                                                disabled={scheduleLocked}
                                                step="1"
                                                value={data.budget}
                                                onChange={handleChange}
                                                placeholder={t("finance:budget")}
                                            />
                                            {renderFieldErrors(errors, "budget", t)}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="authentication-button mt-3 m-auto d-flex align-items-center justify-content-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving && (
                                            <span className="spinner-border spinner-border-sm" />
                                        )}
                                        {t(isEditing ? (saving ? "saving" : "save") : "continue")}
                                    </button>
                                </form>
                            )}
                            {/* =================================================
                                STEP 2 — SELECT HOMES
                            ================================================= */}
                            {step === 2 && !isEditing && (
                                <div>
                                    {scheduleLocked && <div className="alert alert-info">{t("finance:repairPaidScheduleLocked")}</div>}
                                    <fieldset disabled={saving || scheduleLocked}>
                                        <div className="alert alert-light border shadow-sm p-2 mb-3">
                                            <div className="d-flex justify-content-center align-items-center gap-1 flex-wrap fw-bold">
                                                <span className="fs-5">🔧</span>
                                                <span className="text-bg-warning bg-opacity-25 px-2 rounded">
                                                    {data.name}
                                                </span>
                                                <span className="text-muted">-</span>
                                                <span className="bg-success bg-opacity-25 px-2 rounded">
                                                    € {Math.ceil(Number(data.budget || 0)).toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card shadow-sm">
                                            <div className="card-body">
                                                <table className="table table-sm table-striped table-bordered border-1 table-hover text-center">
                                                    <thead>
                                                        <tr>
                                                            <th>{t("home:fl")}</th>
                                                            <th>{t("home:apt")}</th>
                                                            <th>{t("home:owner")}</th>
                                                            <th>
                                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                                    <input
                                                                        className="width-fit-content pointer"
                                                                        type="checkbox"
                                                                        aria-label={t("selectAll")}
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
                                                                <td
                                                                    colSpan="4"
                                                                    className="text-center text-muted"
                                                                >
                                                                    {t("finance:noHomes")}
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            homes.map((home) => (
                                                                <tr
                                                                    key={home.id}
                                                                    onClick={() => { if (!scheduleLocked && !saving) toggleHome(home.id); }}
                                                                    style={{
                                                                        cursor: "pointer",
                                                                    }}
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
                                                                            aria-label={home.name}
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
                                                <div
                                                    className={`text-center mt-1 fw-bolder ${selectedHomes.length === 0
                                                        ? "text-danger"
                                                        : "text-muted"
                                                        }`}
                                                >
                                                    {selectedHomes.length === 0
                                                        ? t("finance:selectAtLeastOneHome")
                                                        : t("finance:selectedHomes", {
                                                            selected: selectedHomes.length,
                                                            total: homes.length,
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="fw-bold text-center mt-4">{t("finance:repairDistribution")}</h5>
                                        {/* DISTRIBUTION */}
                                        <div className="card shadow-sm mb-3">
                                            <div className="card-body">
                                                <h6 className="fw-bold mb-3">
                                                    {t("finance:repairDistribution")}
                                                </h6>
                                                <div className="d-flex flex-column gap-2">
                                                    {/* EQUAL */}
                                                    <div className="form-check border rounded p-2 ps-5">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="distributionType"
                                                            id="distribution-equal"
                                                            checked={data.distributionType === "EQUAL"}
                                                            onChange={() => handleDistributionChange("EQUAL")}
                                                        />
                                                        <label
                                                            className="form-check-label fw-semibold"
                                                            htmlFor="distribution-equal"
                                                        >
                                                            ⚖️ {t("finance:equalToAll")}
                                                        </label>
                                                        <div className="small text-muted">
                                                            {t("finance:equalToAllDescription")}
                                                        </div>
                                                    </div>
                                                    {/* PERCENTAGE */}
                                                    <div className="form-check border rounded p-2 ps-5">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="distributionType"
                                                            id="distribution-percentage"
                                                            checked={data.distributionType === "PERCENTAGE"}
                                                            onChange={() =>
                                                                handleDistributionChange("PERCENTAGE")
                                                            }
                                                        />
                                                        <label
                                                            className="form-check-label fw-semibold"
                                                            htmlFor="distribution-percentage"
                                                        >
                                                            📊 {t("finance:differentPercentage")}
                                                        </label>
                                                        <div className="small text-muted">
                                                            {t("finance:differentPercentageDescription")}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* PERCENTAGES */}
                                        {data.distributionType === "PERCENTAGE" && (
                                            <div className="card shadow-sm mb-3">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <h6 className="fw-bold mb-0">
                                                            {t("finance:homePercentages")}
                                                        </h6>
                                                        <span
                                                            className={
                                                                percentageTotal === 100
                                                                    ? "badge text-bg-success"
                                                                    : "badge text-bg-danger"
                                                            }
                                                        >
                                                            {percentageTotal.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                    <table className="table table-sm table-bordered text-center align-middle">
                                                        <thead>
                                                            <tr>
                                                                <th>{t("home:fl")}</th>
                                                                <th>{t("home:apt")}</th>
                                                                <th>{t("home:owner")}</th>
                                                                <th>%</th>
                                                                <th>{t("finance:amount")}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectedHomes.map((homeId) => {
                                                                const home = homes.find(
                                                                    (item) => item.id === homeId,
                                                                );
                                                                if (!home) {
                                                                    return null;
                                                                }
                                                                const percentage = Number(
                                                                    data.homePercentages?.[homeId] || 0,
                                                                );
                                                                const amount =
                                                                    (Number(data.budget || 0) * percentage) / 100;
                                                                return (
                                                                    <tr key={homeId}>
                                                                        <td>{home.floor}</td>
                                                                        <td className="text-start">{home.name}</td>
                                                                        <td className="text-start">
                                                                            {home.owner?.firstName} {home.owner?.lastName}
                                                                        </td>
                                                                        <td>
                                                                            <div className="input-group input-group-sm">
                                                                                <input
                                                                                    aria-label={`${home.name} (%)`}
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    step="0.01"
                                                                                    className="form-control text-center"
                                                                                    value={
                                                                                        data.homePercentages?.[homeId] ?? ""
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        handleHomePercentageChange(
                                                                                            homeId,
                                                                                            e.target.value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <span className="input-group-text">
                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="fw-semibold">
                                                                            € {schedule.length ? Math.ceil(amount).toFixed(0) : "—"}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                    <div
                                                        className={`text-center fw-bold ${percentageTotal === 100
                                                            ? "text-success"
                                                            : "text-danger"
                                                            }`}
                                                    >
                                                        {percentageTotal === 100
                                                            ? `✓ ${t("finance:percentageComplete")}`
                                                            : `${t("finance:percentageRemaining")}: ${(
                                                                100 - percentageTotal
                                                            ).toFixed(2)}%`}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* EQUAL PREVIEW */}
                                        {data.distributionType === "EQUAL" && (
                                            <div className="alert alert-info border p-2">
                                                <div className="text-center">
                                                    <div className="fw-bold">
                                                        ⚖️ {t("finance:equalAmountPerHome")}
                                                    </div>
                                                    <div className="fs-5 fw-bold">
                                                        € {formatMaximumAmount(schedule.map((share) => share.total))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* NUMBER OF INSTALLMENTS */}
                                        <div className="card shadow-sm mb-3">
                                            <div className="card-body">
                                                <h6 className="fw-bold mb-2">
                                                    {t("finance:numberOfInstallments")}
                                                </h6>
                                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={installmentsLimit}
                                                        className="form-control text-center"
                                                        style={{
                                                            maxWidth: "120px",
                                                        }}
                                                        aria-label={t("finance:numberOfInstallments")}
                                                        aria-describedby="repair-installments-limit"
                                                        name="installments"
                                                        value={data.installments}
                                                        onChange={handleInstallmentsChange}
                                                    />
                                                    <span className="fw-semibold">
                                                        {Number(data.installments) === 1
                                                            ? t("finance:installment")
                                                            : t("finance:installments")}
                                                    </span>
                                                    <span id="repair-installments-limit" className="badge rounded-pill text-bg-light border ms-sm-auto">
                                                        {t("finance:maximumInstallments")}: {installmentsLimit}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* INSTALLMENT PREVIEW */}
                                        <div className="card shadow-sm">
                                            <div className="card-body">
                                                <h6 className="fw-bold text-center mb-3">
                                                    {t("finance:installmentPreview")}
                                                </h6>
                                                <table className="table table-sm table-striped table-bordered text-center align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>{t("home:fl")}</th>
                                                            <th>{t("home:apt")}</th>
                                                            <th>{t("home:owner")}</th>
                                                            <th>{t("finance:total")}</th>
                                                            <th>{t("finance:perInstallment")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedHomes.map((homeId) => {
                                                            const home = homes.find(
                                                                (item) => item.id === homeId,
                                                            );
                                                            if (!home) {
                                                                return null;
                                                            }
                                                            const total = getHomeAmount(homeId);
                                                            const installment = getInstallmentAmount(homeId);
                                                            return (
                                                                <tr key={homeId}>
                                                                    <td>{home.floor}</td>
                                                                    <td className="text-start">{home.name}</td>
                                                                    <td className="text-start">
                                                                        {home.owner?.firstName} {home.owner?.lastName}
                                                                    </td>
                                                                    <td className="fw-semibold">
                                                                        € {schedule.length ? Math.ceil(total).toFixed(0) : "—"}
                                                                    </td>
                                                                    <td className="fw-bold">
                                                                        € {installment}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td colSpan={5}>
                                                                <div className="fw-bold m-auto my-1 px-1 rounded small text-bg-danger width-fit-content">
                                                                    {t("finance:installmentRoundedInfo")}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </fieldset>
                                    {/* NAVIGATION */}
                                    <div className="d-flex justify-content-between mt-3">
                                        <button
                                            type="button"
                                            className="authentication-button text-bg-info"
                                            onClick={() => setStep(1)}
                                        >
                                            ← {t("back")}
                                        </button>
                                        <button
                                            type="button"
                                            className="authentication-button d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => {
                                                if (validateStepTwo()) {
                                                    saveRepair();
                                                }
                                            }}
                                            disabled={saving || selectedHomes.length === 0}
                                        >
                                            {saving && (
                                                <span className="spinner-border spinner-border-sm" />
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
                            onClick={() => setConfirmDelete(true)}
                            disabled={saving}
                        >
                            {t("delete")}
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleClose}>
                        {t("close")}
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* =====================================================
                DELETE CONFIRMATION
            ===================================================== */}
            <Modal
                show={confirmDelete}
                onHide={() => setConfirmDelete(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger fw-bold fs-5">
                        {t("finance:repairDeleteTitle")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <h4 className="fw-bold mb-3">{repair?.name}</h4>
                    <div className="border border-danger rounded p-2 bg-danger-subtle">
                        <div className="fw-bold text-danger mb-2 fs-4">
                            ⚠️ {t("warning")}
                        </div>
                        <Trans i18nKey="finance:confirmRepairDelete" />
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                        {t("cancel")}
                    </Button>
                    <Button variant="danger" onClick={remove} disabled={saving}>
                        {t("delete")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default ModalRepair;
