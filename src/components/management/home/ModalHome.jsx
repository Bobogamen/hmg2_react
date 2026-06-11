import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { addHome, editHome } from "../../../api/services/homeService";
import { useLoading } from "../../../loader/LoadingContext";
import renderFieldErrors from "../../../utils/renderFieldErrors";

const initialState = {
    floor: "",
    name: ""
};

const ModalHome = ({
    show,
    handleClose,
    condominium,
    inputData,
    onSaved
}) => {
    const { t, i18n } = useTranslation();
    const { setIsLoading } = useLoading();

    const [homeData, setHomeData] = useState(initialState);
    const [errors, setErrors] = useState({});

    const isEditing = !!inputData?.id;

    useEffect(() => {
        if (!show) return;

        if (isEditing) {
            setHomeData({
                floor: inputData.floor || "",
                name: inputData.name || ""
            });
        } else {
            setHomeData(initialState);
        }

        setErrors({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, inputData?.id]);

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
                condominiumId: condominium?.id,
                floor: homeData.floor,
                name: homeData.name
            };

            if (isEditing) {
                await editHome({
                    ...payload,
                    homeId: inputData.id
                });
            } else {
                await addHome(payload);
            }

            resetForm();
            handleClose();
            onSaved?.();

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

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">
                    <div className="fw-bold fs-5">
                        {isEditing
                            ? homeData.name
                            : `${t("add")} ${t("home:home")} ${t("in")} ${condominium?.name || ""}`}
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container-fluid">
                    <form
                        className="registrationForm"
                        onSubmit={handleSubmit}
                    >
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
                            <label>{t("name")}</label>
                            <input
                                type="text"
                                name="name"
                                value={homeData.name}
                                onChange={handleChange}
                                placeholder={t("name")}
                            />
                            {renderFieldErrors(errors, "name", t)}
                        </div>

                        <button
                            type="submit"
                            className="authentication-button mt-3"
                        >
                            {isEditing ? t("save") : t("add")}
                        </button>
                    </form>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    {t("close")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalHome;
