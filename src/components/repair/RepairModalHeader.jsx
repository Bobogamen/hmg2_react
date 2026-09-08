import React from "react";
import { Modal, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const RepairModalHeader = ({ title, repair, homeName, saving = false }) => {
    const { t } = useTranslation();
    return (
        <Modal.Header closeButton={!saving} closeLabel={t("close")}>
            <Modal.Title className="fw-bold fs-5 w-100">
                <div>{title}</div>
                <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                    <span className="bg-success bg-opacity-50 border border-3 border-primary px-1 rounded">
                        {t("finance:repair")}
                    </span>
                    <span className="fst-italic text-primary border border-3 border-primary rounded px-1 text-break">
                        {repair.name}
                    </span>
                </div>
                {homeName && <div className="mt-2 small text-muted">{homeName}</div>}
            </Modal.Title>
        </Modal.Header>
    );
};

export const RepairModalSaving = ({ saving }) => {
    const { t } = useTranslation();
    return saving ? (
        <div
            className="repair-modal__saving position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center rounded"
            role="status"
        >
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2 fw-bold">{t("saving")}</div>
            </div>
        </div>
    ) : null;
};
export default RepairModalHeader;
