import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Resident from "./Resident";

const ModalResident = ({ show, handleClose, input }) => {
    const { t } = useTranslation();

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {t('Add')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Resident />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>{t('Close')}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalResident;