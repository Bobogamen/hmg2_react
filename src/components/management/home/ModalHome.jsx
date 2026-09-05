import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { addHome, deleteHome, editHome } from "../../../api/services/homeService";
import { useLoading } from "../../../loader/LoadingContext";
import renderFieldErrors from "../../../utils/renderFieldErrors";
import Resident from "./resident/Resident";
import { useUser } from "../../../user/UserContext";
import { useNavigate } from "react-router-dom";

const initialState = {
    floor: "",
    name: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    email: ""
};

const ModalHome = ({
    show,
    handleClose,
    condominium,
    home,
    onSaved
}) => {
    const { updateUser } = useUser();
    const { t, i18n } = useTranslation();
    const { setIsLoading } = useLoading();
    const navigate = useNavigate();

    const [homeData, setHomeData] = useState(initialState);
    const [errors, setErrors] = useState({});

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const condominiumData = home?.condominium || condominium;

    const isEditing = !!home?.id;

    useEffect(() => {
        if (!show) return;

        if (isEditing) {
            setHomeData({
                floor: home.floor || "",
                name: home.name || "",
                firstName: "",
                middleName: "",
                lastName: "",
                phoneNumber: "",
                email: ""
            });
        } else {
            setHomeData(initialState);
        }

        setErrors({});
    }, [show, home?.id, home?.floor, home?.name, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setHomeData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                condominiumId: condominiumData?.id,
                floor: homeData.floor,
                name: homeData.name
            };

            if (isEditing) {
                await editHome({
                    ...payload,
                    homeId: home.id
                });
            } else {
                await addHome({
                    ...payload,
                    firstName: homeData.firstName,
                    middleName: homeData.middleName,
                    lastName: homeData.lastName,
                    phoneNumber: homeData.phoneNumber,
                    email: homeData.email
                });
            }

            resetForm();
            handleClose();
            updateUser();
            await onSaved?.();

            toast.success(
                isEditing ? t("home:updated") : t("home:created")
            );

        } catch (error) {
            if (error.isValidationError) {
                setErrors(
                    error.validationErrors || error.errors || {}
                );
            } else {
                const serverMessage = error?.response?.data?.message;

                toast.error(
                    serverMessage ? i18n.t(`server:${serverMessage}`) : t("server:error"),
                    { transition: Bounce }
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setHomeData(initialState);
        setErrors({});
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);

            await deleteHome({
                condominiumId: condominiumData.id,
                homeId: home.id
            });

            toast.error(t("home:deleted"));

            handleClose();
            updateUser();

            navigate(`/management/condominiums/${condominiumData.id}`);

        } catch (error) {
            toast.error(t("server:error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        <div className="fw-bold fs-5">
                            {isEditing ? (
                                <>
                                    <span>{t("edit")} </span>
                                    <span className="bg-info bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 py-0 rounded">
                                        {t("home:home")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>{t("add")} </span>
                                    <span className="bg-info bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 py-0 rounded">
                                        {t("home:home")}
                                    </span>
                                    <span> {t("and")} </span>
                                    <span className="bg-danger bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 py-0 rounded">{t("home:owner")}</span>
                                </>
                            )}
                            <div className="mt-2">
                                {t("in")}{" "}
                                <span className="fst-italic text-primary border border-3 border-primary rounded px-1 ms-1">
                                    {condominium?.name || ""}
                                </span>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="container-fluid">
                        <form
                            className=""
                            onSubmit={handleSubmit}
                        >
                            <div className="registrationForm mb-3 bg-info bg-opacity-50">
                                {isEditing ? null : <h4 className="fw-bold mb-2 text-decoration-underline">{t("home:home")}</h4>}
                                <div>
                                    <label>{t("home:floor")}</label>
                                    <input
                                        type="text"
                                        name="floor"
                                        value={homeData.floor}
                                        onChange={handleChange}
                                        placeholder={t("home:floor")}
                                    />
                                    {renderFieldErrors(errors, "floor", t)}
                                </div>

                                <div>
                                    <label>{`${t("home:apartment")}/${t("name")}`}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={homeData.name}
                                        onChange={handleChange}
                                        placeholder={t("name")}
                                    />
                                    {renderFieldErrors(errors, "name", t)}
                                </div>
                            </div>

                            {!isEditing && (
                                <Resident
                                    data={homeData}
                                    errors={errors}
                                    onChange={handleChange}
                                    showSubmit={false}
                                    showTitle
                                    titleKey="home:owner"
                                />
                            )}

                            <button
                                type="submit"
                                className="authentication-button mt-3 m-auto"
                            >
                                {isEditing ? t("save") : t("add")}
                            </button>
                        </form>
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
                onHide={() => setShowDeleteConfirm(false)}
                centered
                className="bg-dark"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger fw-bold fs-5">
                        {t("home:confirmDeleteTitle")}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="text-center">
                        <h4 className="fw-bold mb-1">
                            {t("home:apartment")} {home?.name}
                        </h4>
                        <div className="text-muted mb-3">
                            {t("home:floor")} {home?.floor}
                        </div>
                        <div className="border border-danger rounded p-2 bg-danger-subtle">
                            <div className="fw-bold text-danger mb-2 fs-4">
                                ⚠️ {t("warning")}
                            </div>
                            <div className="small">
                                <Trans i18nKey="home:deleteWarning" />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                    >
                        {t("delete")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalHome;
