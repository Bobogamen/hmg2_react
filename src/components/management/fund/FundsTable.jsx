import React, { useState } from "react";
import { OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import settings from "../../../assets/images/app/settings.png";
import add from "../../../assets/images/app/add.png";
import edit from "../../../assets/images/app/edit.png";
import ModalFund from "./ModalFund";

const FundsTable = ({ condominium, onSaved }) => {
    const { t } = useTranslation();
    const [selectedFund, setSelectedFund] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const funds = condominium?.funds || [];
    const fundLimit = condominium?.fundMaxCount || 0;

    const openAdd = () => { setSelectedFund(null); setShowModal(true); };
    const openEdit = (fund) => { setSelectedFund(fund); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setSelectedFund(null); };

    return (
        <div className="bg-secondary bg-opacity-50 border border-3 border-primary border-opacity-75 rounded-5 shadow-lg p-3 mx-1">
            <div className="d-flex justify-content-center align-items-center position-relative pb-2 mb-1">
                <h4 className="text-capitalize fw-bold mb-0">{t("dashboard:funds")}</h4>
                <div className="position-absolute end-0 fw-bold fs-5">{funds.length}/{fundLimit}</div>
            </div>
            {funds.length > 0 ? (
                <Table bordered striped hover size="sm">
                    <thead className="align-middle">
                        <tr className="fw-bold">
                            <th>{t("finance:fundStartDate")}</th>
                            <th className="w-50">{t("name")}</th>
                            <th>{t("finance:fees")}</th>
                            <th><img src={settings} alt="settings" className="icon" /></th>
                        </tr>
                    </thead>
                    <tbody className="align-middle">
                        {funds.map((fund) => (
                            <tr key={`fund-${fund.id}`}>
                                <td>{fund.startDate}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <span>{fund.name}</span>
                                        {fund.feeCount === 0 && (
                                            <OverlayTrigger
                                                trigger={["hover", "focus", "click"]}
                                                placement="top"
                                                rootClose
                                                overlay={
                                                    <Tooltip id={`fund-no-fees-${fund.id}`}>
                                                        {t("finance:noFeesAssigned")}
                                                    </Tooltip>
                                                }
                                            >
                                                <span className="text-warning ms-2 pointer">
                                                    <TriangleAlert size={18} color="red"/>
                                                </span>
                                            </OverlayTrigger>
                                        )}
                                    </div>
                                </td>
                                <td>{fund.feeCount}</td>
                                <td><img src={edit} alt={t("edit")} className="icon pointer" onClick={() => openEdit(fund)} /></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className="mt-3 fs-4 fw-bold">{t("finance:noneAddedFunds")}</p>
            )}
            <ModalFund show={showModal} handleClose={closeModal} condominium={condominium} fund={selectedFund} onSaved={onSaved} />
            {funds.length < fundLimit && (
                <div className="img-button pointer m-auto mt-3" onClick={openAdd}>
                    <img src={add} className="icon" alt={t("add")} />
                    <span className="ms-1">{`${t("add")} ${t("finance:fund")}`}</span>
                </div>
            )}
        </div>
    );
};

export default FundsTable;
