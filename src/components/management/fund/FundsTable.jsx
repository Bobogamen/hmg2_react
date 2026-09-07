import React, { useState } from "react";
import { OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { Info, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import settings from "../../../assets/images/app/settings.png";
import add from "../../../assets/images/app/add.png";
import edit from "../../../assets/images/app/edit.png";
import ModalFund from "./ModalFund";
import ModalFundsInfo from "./ModalFundsInfo";
import { formatDate } from "../../../utils/formatDate";

const FundsTable = ({ condominium, onSaved, selectedFundId, highlightedFundId, onFundFeesSelect }) => {
    const { t, i18n } = useTranslation();
    const [selectedFund, setSelectedFund] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFundInfo, setShowFundInfo] = useState(false);
    const funds = condominium?.funds || [];
    const fundLimit = condominium?.fundMaxCount || 0;

    const openAdd = () => { setSelectedFund(null); setShowModal(true); };
    const openEdit = (fund) => { setSelectedFund(fund); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setSelectedFund(null); };

    return (
        <div className="bg-secondary bg-opacity-50 border border-3 border-primary border-opacity-75 rounded-5 shadow-lg p-3 mx-1">
            <div className="d-flex justify-content-center align-items-center position-relative pb-2 mb-1">
                <h4 className="text-capitalize fw-bold mb-0">{t("dashboard:funds")}</h4>
                <button
                    type="button"
                    className="btn btn-link p-0 text-dark ms-2"
                    onClick={() => setShowFundInfo(true)}
                    aria-label={t("finance:fundsInfo.open")}
                    title={t("finance:fundsInfo.open")}
                >
                    <Info size={20} color="blue" />
                </button>
                <div className="position-absolute end-0 fw-bold fs-5">{funds.length}/{fundLimit}</div>
            </div>
            <ModalFundsInfo show={showFundInfo} handleClose={() => setShowFundInfo(false)} />
            {funds.length > 0 ? (
                <Table bordered striped hover size="sm">
                    <thead className="align-middle">
                        <tr className="fw-bold">
                            <th>{t("condo:startDate")}</th>
                            <th className="w-50">{t("name")}</th>
                            <th>{t("finance:fees")}</th>
                            <th><img src={settings} alt="settings" className="icon" /></th>
                        </tr>
                    </thead>
                    <tbody className="align-middle">
                        {funds.map((fund) => (
                            <tr key={`fund-${fund.id}`}
                                className={highlightedFundId != null && String(highlightedFundId) === String(fund.id) ? "table-primary" : ""}>
                                <td>{formatDate(fund.startDate, i18n.language)}</td>
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
                                                    <TriangleAlert size={18} color="red" />
                                                </span>
                                            </OverlayTrigger>
                                        )}
                                    </div>
                                </td>
                                <td
                                    className={`fund-fees-cell ${selectedFundId === fund.id ? "selected" : ""}`}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={selectedFundId === fund.id}
                                    aria-label={t("finance:highlightFundFees", { name: fund.name })}
                                    title={t("finance:highlightFundFees", { name: fund.name })}
                                    onClick={() => onFundFeesSelect?.(fund)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            onFundFeesSelect?.(fund);
                                        }
                                    }}
                                >{fund.feeCount}</td>
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
