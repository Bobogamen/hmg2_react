import { Button, Modal } from "react-bootstrap";
import { FilePlus2, Link, House, TriangleAlert, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";

const sections = [
    { key: "create", icon: FilePlus2, color: "primary" },
    { key: "fees", icon: Link, color: "success" },
    { key: "homes", icon: House, color: "info" },
    { key: "table", icon: TriangleAlert, color: "warning" },
];

const ModalFundsInfo = ({ show, handleClose }) => {
    const { t } = useTranslation();

    return (
        <Modal show={show} onHide={handleClose} centered size="xl" aria-labelledby="funds-info-title">
            <Modal.Header closeButton className="border-0 pb-2">
                <Modal.Title id="funds-info-title" className="fw-bold">
                    {t("finance:fundsInfo.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-1">
                <p className="text-muted mb-4">{t("finance:fundsInfo.description")}</p>
                <div className="d-flex flex-column gap-2">
                    {sections.map(({ key, icon: Icon, color }) => (
                        <div key={key} className={`d-flex align-items-start gap-3 p-3 border rounded-3 bg-${color} bg-opacity-10`}>
                            <div
                                className={`d-flex align-items-center justify-content-center rounded-circle bg-${color} bg-opacity-25 text-${color} flex-shrink-0`}
                                style={{ width: 42, height: 42 }}
                            >
                                <Icon size={20} aria-hidden="true" />
                            </div>
                            <div>
                                <h6 className="fw-bold mb-2">{t(`finance:fundsInfo.sections.${key}.title`)}</h6>
                                <p className="small mb-0">{t(`finance:fundsInfo.sections.${key}.description`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="d-flex align-items-start gap-2 mt-3 p-3 rounded-3 border bg-light">
                    <Lightbulb size={18} className="text-warning flex-shrink-0 mt-1" aria-hidden="true" />
                    <p className="small text-muted fw-semibold mb-0">{t("finance:fundsInfo.note")}</p>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="secondary" onClick={handleClose}>{t("close")}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalFundsInfo;
