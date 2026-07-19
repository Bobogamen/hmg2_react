import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaUserCheck, FaTimes } from "react-icons/fa";
import { Trans, useTranslation } from "react-i18next";

const ModalActivateResident = ({
    show,
    handleClose,
    home,
    resident,
    onActivate
}) => {

    const { t } = useTranslation();

    if (!resident)
        return null;


    const fullName = [
        resident.firstName,
        resident.middleName,
        resident.lastName
    ]
        .filter(Boolean)
        .join(" ");


    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
        >

            <Modal.Header
                closeButton
                className="bg-success text-white"
            >
                <Modal.Title className="d-flex align-items-center gap-2">
                    <FaUserCheck />
                    {t("resident:confirmActiveTitle")}
                </Modal.Title>
            </Modal.Header>


            <Modal.Body>

                <div className="text-center mb-3">

                    <div className="fs-4 fw-bold">
                        {fullName}
                    </div>

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
                <div className="
                            border
                            border-danger
                            rounded
                            p-2
                            bg-danger-subtle
                        ">
                    <div className="small text-center">
                        <Trans i18nKey="resident:activateWarning" />
                    </div>
                </div>

            </Modal.Body>


            <Modal.Footer className="justify-content-between">

                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    <FaTimes />
                    {" "}
                    {t("common:cancel")}
                </Button>


                <Button
                    variant="success"
                    onClick={() => {
                        onActivate(resident.id);
                    }}
                >
                    <FaUserCheck />
                    {" "}
                    {t("activate")}
                </Button>

            </Modal.Footer>

        </Modal>
    );
};

export default ModalActivateResident;