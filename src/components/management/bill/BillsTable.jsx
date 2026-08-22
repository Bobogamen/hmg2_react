import React, { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Info, FilePlus2, CalendarDays, Euro, Lightbulb } from "lucide-react";
import settings from "../../../assets/images/app/settings.png";
import add from "../../../assets/images/app/add.png";
import edit from "../../../assets/images/app/edit.png";
import ModalBill from "./ModalBill";

const BillsTable = ({ condominium, onSaved }) => {
    const { t } = useTranslation();
    const [selectedBill, setSelectedBill] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showBillInfo, setShowBillInfo] = useState(false);
    const bills = condominium?.bills || [];

    const openAdd = () => {
        setSelectedBill(null);
        setShowModal(true);
    };

    const openEdit = (bill) => {
        setSelectedBill(bill);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBill(null);
    };

    return (
        <div className="bg-warning bg-opacity-50 border border-3 border-primary border-opacity-75 rounded-5 shadow-lg p-3 mx-1">
            <div className="d-flex justify-content-center align-items-center position-relative pb-2 mb-1">
                <h4 className="text-capitalize fw-bold mb-0">{t("finance:bills")}</h4>
                <button
                    type="button"
                    className="btn btn-link p-0 text-dark ms-2"
                    onClick={() => setShowBillInfo(true)}
                    aria-label={t("finance:billInfo.open")}
                    title={t("finance:billInfo.open")}
                >
                    <Info size={20} color="blue" />
                </button>
                <div className="position-absolute end-0">
                    <div className="fw-bold fs-5">
                        {bills.length}/{condominium?.billMaxCount || 0}
                    </div>
                </div>
            </div>

            {/* DELETE BILL */}
            <Modal
                show={showBillInfo}
                onHide={() => setShowBillInfo(false)}
                size="xl"
                centered
            >
                <Modal.Header closeButton className="border-0 pb-2">
                    <Modal.Title className="fw-bold">
                        {t("finance:billInfo.title")}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="pt-1">
                    <p className="text-muted mb-4">
                        {t("finance:billInfo.description")}
                    </p>

                    <div className="d-flex flex-column gap-2 fw-bold">
                        {[
                            {
                                key: "add",
                                icon: FilePlus2,
                                color: "primary"
                            },
                            {
                                key: "monthly",
                                icon: CalendarDays,
                                color: "success"
                            },
                            {
                                key: "value",
                                icon: Euro,
                                color: "warning"
                            }
                        ].map(({ key, icon: Icon, color }, index) => (
                            <div
                                key={key}
                                className={`d-flex align-items-center gap-3 p-3 rounded-3 bg-${color} bg-opacity-10`}
                            >
                                <div
                                    className={`d-flex align-items-center justify-content-center rounded-circle
                                    bg-${color} bg-opacity-25 text-${color} flex-shrink-0`}
                                    style={{ width: 42, height: 42 }}
                                >
                                    <Icon size={20} />
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <span>
                                        {t(`finance:billInfo.steps.${key}`)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 p-3 rounded-3 border bg-light">
                        <div className="d-flex align-items-start gap-2">
                            <Lightbulb
                                size={18}
                                className="text-warning flex-shrink-0 mt-1"
                            />

                            <div className="small text-muted fw-semibold">
                                {t("finance:billInfo.note")}
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0">
                    <Button
                        variant="secondary"
                        onClick={() => setShowBillInfo(false)}
                    >
                        {t("close")}
                    </Button>
                </Modal.Footer>
            </Modal>

            {bills.length > 0 ? (
                <Table bordered striped hover size="sm">
                    <thead className="align-middle">
                        <tr className="fw-bold">
                            <th>{t("finance:addedOn")}</th>
                            <th className="w-50">{t("name")}</th>
                            <th><img src={settings} alt="settings" className="icon" /></th>
                        </tr>
                    </thead>
                    <tbody className="align-middle">
                        {bills.map((bill) => (
                            <tr key={bill.id}>
                                <td>{bill.addedOn}</td>
                                <td>{bill.name}</td>
                                <td>
                                    <img
                                        src={edit}
                                        alt={t("edit")}
                                        className="icon pointer"
                                        onClick={() => openEdit(bill)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className="mt-3 fs-5 fw-bold">{t("finance:noneAddedBills")}</p>
            )}

            <ModalBill
                show={showModal}
                handleClose={closeModal}
                condominium={condominium}
                bill={selectedBill}
                onSaved={onSaved}
            />

            {bills.length < (condominium?.billMaxCount || 0) && (
                <div className="img-button pointer m-auto mt-3" onClick={openAdd}>
                    <img src={add} className="icon" alt={t("add")} />
                    <span className="ms-1">{`${t("add")} ${t("finance:bill")}`}</span>
                </div>
            )}
        </div>
    );
};

export default BillsTable;
