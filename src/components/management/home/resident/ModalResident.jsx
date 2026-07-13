import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Resident from "./Resident";

const ModalResident = ({ show, handleClose, home, condominium }) => {
    const { t } = useTranslation();
    const isEditing = false;

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">
                    <div className="fw-bold fs-5">
                        <span>{t("add")} </span>
                        <span className="bg-danger bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 py-0 rounded">{t("home:resident")}</span>
                        <span> {t("in")} </span>
                        <div className="my-2">
                            <span className="fst-italic text-danger border border-3 border-black rounded px-1"> {t("home:apt")} {home?.name}</span>
                            <span className="mx-1">{"•"}</span>
                            <span className="fst-italic text-danger border border-3 border-black rounded px-1">{t("home:fl")} {home?.floor}</span>
                        </div>
                    </div>
                    <span className="text-muted fs-5 fst-italic border border-3 border-secondary rounded px-1">
                        {condominium.name ? condominium.name : ""}
                    </span>
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