import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Resident from "./Resident";

const ModalResident = ({ show, handleClose, home }) => {
    const { t } = useTranslation();

    const isEditing = false;

    

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">
                    <div className="fw-bold fs-5">
                        {`${t("add")} ${t("home:resident")} ${t("in")}`}
                    </div>
                    {home && (
                        <div className="text-muted fs-5">
                            {`${t("home:apt")} ${home.name}`}
                        </div>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="container-fluid justify-content-center">
                    <Resident
                        home={home}
                        handleClose={handleClose}
                    />
                    <button type="submit" className="authentication-button mt-3 m-auto">
                        {isEditing ? t("save") : t("add")}
                    </button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary"
                    onClick={handleClose}>
                    {t("close")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalResident;