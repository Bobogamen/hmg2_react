import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import settings from '../../../assets/images/app/settings.png';
import add from '../../../assets/images/app/add.png';
import edit from '../../../assets/images/app/edit.png';
import ModalFee from "./ModalFee";
import ModalFeeTypesInfo from "./ModalFeeTypesInfo";
const FeesTable = ({ condominium, onSaved, selectedFeeId, onFeeHomesSelect }) => {
      const [openFeeModal, setOpenFeeModal] = useState(false);
      const [selectedFee, setSelectedFee] = useState(null);
      const [showFeeInfo, setShowFeeInfo] = useState(false);
      const { t } = useTranslation();

      useEffect(() => {
            const handleOutsidePointerDown = (event) => {
                  if (!event.target.closest(".fee-homes-cell")) {
                        onFeeHomesSelect?.(null);
                  }
            };

            document.addEventListener("pointerdown", handleOutsidePointerDown);

            return () => {
                  document.removeEventListener("pointerdown", handleOutsidePointerDown);
            };
      }, [onFeeHomesSelect]);

      const handleOpenAdd = () => {
            setSelectedFee(null);
            setOpenFeeModal(true);
      };
      const handleOpenEdit = (fee) => {
            setSelectedFee(fee);
            setOpenFeeModal(true);
      };
      const handleClose = () => {
            setOpenFeeModal(false);
            setSelectedFee(null);
      };
      const handleSaved = async () => {
            handleClose();
            await onSaved?.();
      };

      return (
            <div className="bg-danger bg-opacity-50 border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-3 mx-1">
                  <div className="d-flex justify-content-center align-items-center position-relative pb-2 mb-1">
                        <h4 className="text-capitalize fw-bold mb-0">
                              {t('finance:fees')}
                        </h4>

                        <button
                              type="button"
                              className="btn btn-link p-0 text-dark ms-2"
                              onClick={() => setShowFeeInfo(true)}
                              aria-label={t("finance:feeTypesInfo.open")}
                              title={t("finance:feeTypesInfo.open")}
                        >
                              <Info size={20} color="blue" />
                        </button>

                        <div className="position-absolute end-0">
                              <div className="fw-bold fs-5">
                                    {condominium?.fees?.length || 0}/{condominium?.feeMaxCount || 0}
                              </div>
                        </div>
                  </div>
                  <ModalFeeTypesInfo
                        show={showFeeInfo}
                        handleClose={() => setShowFeeInfo(false)}
                  />
                  {condominium?.fees?.length ?
                        <Table bordered striped hover size="sm">
                              <thead className="align-middle">
                                    <tr className="fw-bold">
                                          <th className="w-50">{t("name")}</th>
                                          <th>{t("value")} €</th>
                                          <th>{t("home:homes")}</th>
                                          <th>
                                                <img src={settings} alt="settings" className="icon" />
                                          </th>
                                    </tr>
                              </thead>
                              <tbody className="align-middle">
                                    {condominium?.fees?.map((fee) => (
                                          <tr
                                                key={`f${fee.id}`}
                                                className={selectedFeeId === fee.id ? "table-primary" : ""}
                                          >
                                                <td>
                                                      <div className="d-flex align-items-center">
                                                            <div className="me-1 d-flex">
                                                                  {fee.fund ? (
                                                                        <span title={t("finance:fund")}>💰</span>
                                                                  ) : fee.primary ? (
                                                                        <span title={t("finance:primary")}>⭐</span>
                                                                  ) : fee.monthly ? (
                                                                        <span title={t("finance:monthlyFee")}>📅</span>
                                                                  ) : (
                                                                        <span title={t("finance:oneTimeFee")}>💶</span>
                                                                  )}
                                                            </div>
                                                            <span>{fee.name}</span>
                                                      </div>
                                                </td>
                                                <td>
                                                      € {fee.value.toFixed(2)}
                                                </td>
                                                <td
                                                      className={`fee-homes-cell ${selectedFeeId === fee.id ? "selected" : ""}`}
                                                      onClick={() => onFeeHomesSelect?.(fee)}
                                                      role="button"
                                                      tabIndex={0}
                                                      aria-pressed={selectedFeeId === fee.id}
                                                      title="Highlight homes assigned to this fee"
                                                      onKeyDown={(event) => {
                                                            if (event.key === "Enter" || event.key === " ") {
                                                                  event.preventDefault();
                                                                  onFeeHomesSelect?.(fee);
                                                            }
                                                      }}
                                                >
                                                      {fee.homes}
                                                </td>
                                                <td>
                                                      <img
                                                            src={edit}
                                                            alt="edit"
                                                            className="icon pointer"
                                                            onClick={() =>
                                                                  handleOpenEdit(fee)
                                                            }
                                                      />
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </Table>
                        :
                        <div>
                              <p className="mt-3 fs-4 fw-bold">
                                    {t(condominium?.homes?.length > 0 ? "finance:noneAddedFees" : "finance:addAtLeastOneHome")}
                              </p>
                        </div>
                  }
                  <ModalFee
                        show={openFeeModal}
                        handleClose={handleClose}
                        condominium={condominium}
                        fee={selectedFee}
                        onSaved={handleSaved}
                  />

                  {condominium?.homes?.length > 0 && !condominium?.feeLimit &&
                        <div className="img-button pointer m-auto mt-3"
                              onClick={handleOpenAdd}>
                              <img src={add}
                                    className="icon"
                                    alt="add" />
                              <span className="ms-1">
                                    {`${t('add')} ${t('finance:fee')}`}
                              </span>
                        </div>
                  }
            </div>
      );
};
export default FeesTable;
