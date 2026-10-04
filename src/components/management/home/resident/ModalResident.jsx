import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import Resident from "./Resident";
import { addResident, editResident, deleteResident } from "../../../../api/services/residentService";
import { useLoading } from "../../../../loader/LoadingContext";
import { useUser } from "../../../../user/UserContext";

const initialState = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: ""
};

const ModalResident = ({
    show,
    handleClose,
    home,
    condominium,
    resident,
    isEditing = false,
    isOwner = false,
    onSaved
}) => {

    const { t, i18n } = useTranslation();
    const { setIsLoading } = useLoading();
    const { updateUser } = useUser();
    const [residentData, setResidentData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const isBusy = isSaving;

    useEffect(() => {
        if (!show) {
            return;
        }
        if (isEditing && resident) {
            setResidentData({
                firstName: resident.firstName || "",
                middleName: resident.middleName || "",
                lastName: resident.lastName || "",
                email: resident.email || "",
                phoneNumber: resident.phoneNumber || ""
            });
        } else {
            setResidentData(initialState);
        }
        setErrors({});
        setIsSaving(false);

    }, [show, isEditing, resident]);

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;
        setResidentData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (data) => {
        if (isBusy) return;
        setIsSaving(true);
        setIsLoading(true);
        handleClose();
        try {
            const payload = {
                condominiumId: condominium.id,
                homeId: home.id,
                ...data
            };
            if (isEditing) {
                await editResident({
                    ...payload,
                    residentId: resident.id
                });
                toast.success(
                    t(isOwner ? "resident:updatedOwner" : "resident:updated")
                );
            } else {
                await addResident(payload);
                toast.success(
                    t("resident:created")
                );
            }
            await Promise.all([updateUser(), onSaved?.()]);
        } catch (error) {
            const serverMessage = error?.response?.data?.message;

            if (serverMessage === "residentsMaxCountReached") {
                toast.warning(t("validation:residentsMaxCountReached"), {
                    transition: Bounce
                });
            } else if (error.isValidationError) {
                setErrors(
                    error.validationErrors ||
                    error.errors ||
                    {}
                );
            } else {
                toast.error(
                    serverMessage
                        ? i18n.t(`server:${serverMessage}`)
                        : t("server:error"),
                    {
                        transition: Bounce
                    }
                );
            }
        } finally {
            setIsSaving(false);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isBusy) return;
        setIsSaving(true);
        setIsLoading(true);
        setShowDeleteConfirm(false);
        handleClose();
        try {
            await deleteResident({
                condominiumId: condominium.id,
                homeId: home.id,
                residentId: resident.id
            });
            toast.success(
                t("resident:deleted")
            );
            await Promise.all([updateUser(), onSaved?.()]);
        } catch (error) {
            if (error.response?.data === "atLeastOneActiveResident") {
                toast.info(
                    t("validation:atLeastOneActiveResident"),
                    {
                        transition: Bounce
                    }
                );
                return;
            }
            toast.error(
                t("server:error"),
                {
                    transition: Bounce
                }
            );
        } finally {
            setIsSaving(false);
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal
                show={show}
                onHide={isBusy ? undefined : handleClose}
                centered
                backdrop={isBusy ? "static" : true}
                keyboard={!isBusy}
            >
                <Modal.Header closeButton={!isBusy}>
                    <Modal.Title className="fw-bold">
                        <div className="fs-5">
                            <span className="pe-2">
                                {
                                    isEditing
                                        ? t("edit")
                                        : t("add")
                                }
                            </span>
                            <span className={`
                                ${isOwner ? "bg-danger" : "bg-success"}
                                bg-opacity-50
                                border
                                border-3
                                border-primary
                                px-1
                                rounded
                            `}>
                                {t(isOwner ? "home:owner" : "home:resident")}
                            </span>
                            <div className="mt-2">
                                {t("in")}
                                <span className="
                                    fst-italic
                                    text-danger
                                    border
                                    border-3
                                    border-dark
                                    rounded
                                    px-1
                                    ms-1
                                ">
                                    {t("home:apt")} {home?.name}
                                </span>
                                <span className="
                                    fst-italic
                                    text-primary
                                    border
                                    border-3
                                    border-primary
                                    rounded
                                    px-1
                                    ms-2
                                ">
                                    {t("home:fl")} {home?.floor}
                                </span>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Resident
                        data={residentData}
                        errors={errors}
                        onChange={handleChange}
                        showSubmit={true}
                        isEditing={isEditing}
                        onSubmit={handleSubmit}
                        isSubmitting={isBusy}
                    />
                </Modal.Body>
                <Modal.Footer className={isEditing ? "justify-content-between" : ""}>
                    {
                        isEditing && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                    setShowDeleteConfirm(true)
                                }
                                disabled={isBusy}
                            >
                                {t("common:deactivate")}
                            </Button>
                        )
                    }
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isBusy}
                    >
                        {t("close")}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={showDeleteConfirm}
                onHide={isBusy ? undefined : () => setShowDeleteConfirm(false)}
                centered
                className="bg-dark"
                backdrop={isBusy ? "static" : true}
                keyboard={!isBusy}
            >
                <Modal.Header closeButton={!isBusy}>
                    <Modal.Title className="text-danger fw-bold fs-5">
                        {t(isOwner ? "resident:ownerConfirmDeleteTitle" : "resident:confirmDeleteTitle")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <h4 className="fw-bold mb-1">
                            {resident?.firstName}{" "}
                            {resident?.lastName}
                        </h4>
                        <div className="mb-2">
                            <span className="fw-bold m-1">
                                {t("home:apt")} {home?.name}
                            </span>
                            <span className="text-muted fst-italic">
                                {t("home:fl")} {home?.floor}
                            </span>
                        </div>
                        <div className="
                            border
                            border-danger
                            rounded
                            p-2
                            bg-danger-subtle
                        ">
                            <div className="
                                fw-bold
                                text-danger
                                mb-2
                                fs-4
                            ">
                                ⚠️ {t("warning")}
                            </div>
                            <div className="small">
                                <Trans i18nKey="resident:deleteWarning" />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            setShowDeleteConfirm(false)
                        }
                        disabled={isBusy}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isBusy}
                    >
                        {t("common:deactivate")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalResident;
