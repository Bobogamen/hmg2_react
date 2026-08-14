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
        setIsLoading(true);
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
            updateUser();
            await onSaved?.();
            handleClose();
        } catch (error) {
            if (error.isValidationError) {
                setErrors(
                    error.validationErrors ||
                    error.errors ||
                    {}
                );
            } else {
                const message =
                    error?.response?.data?.message;
                toast.error(
                    message
                        ? i18n.t(`server:${message}`)
                        : t("server:error"),
                    {
                        transition: Bounce
                    }
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await deleteResident({
                condominiumId: condominium.id,
                homeId: home.id,
                residentId: resident.id
            });
            toast.success(
                t("resident:deleted")
            );
            updateUser();
            await onSaved?.();
            setShowDeleteConfirm(false);
            handleClose();
        } catch (error) {
            if (error.response?.data === "atLeastOneActiveResident") {
                toast.info(
                    t("validation:atLeastOneActiveResident"),
                    {
                        transition: Bounce
                    }
                );
                setShowDeleteConfirm(false);
                handleClose();
                return;
            }
            toast.error(
                t("server:error"),
                {
                    transition: Bounce
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                centered
            >
                <Modal.Header closeButton>
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
                            >
                                {t("common:deactivate")}
                            </Button>
                        )
                    }
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                    >
                        {t("close")}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={showDeleteConfirm}
                onHide={() =>
                    setShowDeleteConfirm(false)
                }
                centered
                className="bg-dark"
            >
                <Modal.Header closeButton>
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
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                    >
                        {t("common:deactivate")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalResident;