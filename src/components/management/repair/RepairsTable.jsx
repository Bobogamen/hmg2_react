import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import settings from "../../../assets/images/app/settings.png";
import add from "../../../assets/images/app/add.png";
import edit from "../../../assets/images/app/edit.png";
import ModalRepair from "./ModalRepair";
import ModalRepairsInfo from "./ModalRepairsInfo";
import { formatDate } from "../../../utils/formatDate";

const RepairsTable = ({ condominium, onSaved }) => {
    const { t, i18n } = useTranslation();
    const [selectedRepair, setSelectedRepair] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRepairInfo, setShowRepairInfo] = useState(false);
    const repairs = condominium?.repairs || [];
    const repairLimit = condominium?.repairLimit ?? 20;
    const openAdd = () => {
        setSelectedRepair(null);
        setShowModal(true);
    };
    const openEdit = (repair) => {
        setSelectedRepair(repair);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setSelectedRepair(null);
    };

    return (
        <div className="bg-success bg-opacity-50 border border-3 border-primary border-opacity-75 rounded-5 shadow-lg p-3 mx-1">
            <div className="d-flex justify-content-center align-items-center position-relative pb-2 mb-1">
                <h4 className="text-capitalize fw-bold mb-0">{t("finance:repairs")}</h4>
                <button type="button" className="btn btn-link p-0 text-dark ms-2"
                    onClick={() => setShowRepairInfo(true)}
                    aria-label={t("finance:repairInfo.open")} title={t("finance:repairInfo.open")}>
                    <Info size={20} color="blue" />
                </button>
                <div className="position-absolute end-0 fw-bold fs-5">
                    {repairs.length}/{repairLimit}
                </div>
            </div>
            <ModalRepairsInfo show={showRepairInfo} handleClose={() => setShowRepairInfo(false)} />
            {repairs.length > 0 ? (
                <Table bordered striped hover size="sm">
                    <thead className="align-middle">
                        <tr className="fw-bold">
                            <th>{t("condo:startDate")}</th>
                            <th className="w-50">{t("name")}</th>
                            <th>{t("finance:budget")}</th>
                            <th>
                                <img src={settings} alt="settings" className="icon" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="align-middle">
                        {repairs.map((repair) => (
                            <tr key={repair.id}>
                                <td>{formatDate(repair.startDate, i18n.language)}</td>
                                <td>{repair.name}</td>
                                <td>€ {Math.ceil(Number(repair.budget || 0)).toFixed(0)}</td>
                                <td>
                                    <img
                                        src={edit}
                                        alt={t("edit")}
                                        className="icon pointer"
                                        onClick={() => openEdit(repair)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className="mt-3 fs-4 fw-bold">{t("finance:noneAddedRepairs")}</p>
            )}
            <ModalRepair
                show={showModal}
                handleClose={closeModal}
                condominium={condominium}
                repair={selectedRepair}
                onSaved={onSaved}
            />
            {repairs.length < repairLimit && (
                <div className="img-button pointer m-auto mt-3" onClick={openAdd}>
                    <img src={add} className="icon" alt={t("add")} />
                    <span className="ms-1">{t("add") + " " + t("finance:repair")}</span>
                </div>
            )}
        </div>
    );
};

export default RepairsTable;
