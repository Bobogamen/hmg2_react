import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import settings from '../../../assets/images/app/settings.png';
import add from '../../../assets/images/app/add.png';
import edit from '../../../assets/images/app/edit.png';
import ModalFee from "./ModalFee";
const FeesTable = ({ condominium, onSaved }) => {
      const [openFeeModal, setOpenFeeModal] = useState(false);
      const [selectedFee, setSelectedFee] = useState(null);
      const { t } = useTranslation();
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

 console.log(condominium)

      return (
            <div className="bg-danger bg-opacity-50 border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-3 mx-1">
                  <div className="d-flex justify-content-center align-items-center">
                        <h4 className="text-capitalize fw-bold">
                              {t('finance:fees')}&nbsp;
                        </h4>
                        <h4>
                              {condominium?.fees?.length || 0}
                              {t('home:pcs')}
                        </h4>
                  </div>
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
                                          <tr key={`f${fee.id}`}>
                                                <td>
                                                      <div className="d-flex align-items-center">
                                                            <div className="me-2 d-flex gap-1" style={{ minWidth: "40px" }}>
                                                                  {fee.monthly && <span title={t("finance:monthlyFee")}>📅</span>}
                                                                  {fee.primary && <span title={t("finance:primary")}>⭐</span>}
                                                                  {!fee.primary && !fee.monthly && (
                                                                        <span title={t("finance:oneTimeFee")}>💶</span>
                                                                  )}
                                                            </div>

                                                            <span>{fee.name}</span>
                                                      </div>
                                                </td>
                                                <td>
                                                      € {fee.value.toFixed(2)}
                                                </td>
                                                <td>
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