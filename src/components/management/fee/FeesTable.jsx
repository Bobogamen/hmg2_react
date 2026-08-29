import React, { useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { Info, Star, CalendarDays, Coins, Calculator, CheckCircle2, Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";
import settings from '../../../assets/images/app/settings.png';
import add from '../../../assets/images/app/add.png';
import edit from '../../../assets/images/app/edit.png';
import ModalFee from "./ModalFee";
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
                              <Info size={20} color="blue"/>
                        </button>

                        <div className="position-absolute end-0">
                              <div className="fw-bold fs-5">
                                    {condominium?.fees?.length || 0}/{condominium?.feeMaxCount || 0}
                              </div>
                        </div>
                  </div>
                  <Modal
                        show={showFeeInfo}
                        onHide={() => setShowFeeInfo(false)}
                        centered
                        size="xl"
                  >
                        <Modal.Header closeButton className="border-0 pb-0">
                              <div>
                                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                                          {t("finance:feeTypesInfo.title")}
                                    </Modal.Title>
                              </div>
                        </Modal.Header>

                        <Modal.Body className="pt-3">

                              {/* Primary fee */}
                              <div className="border rounded-3 p-3 mb-3 bg-warning bg-opacity-10">
                                    <div className="d-flex align-items-start gap-3">
                                          <div
                                                className="rounded-circle bg-warning bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: 42, height: 42 }}
                                          >
                                                <Star size={22} className="text-warning" />
                                          </div>

                                          <div className="flex-grow-1">
                                                <div className="fw-bold">
                                                      {t("finance:feeTypesInfo.primary.title")}
                                                </div>

                                                <div className="text-muted small mt-1">
                                                      {t("finance:feeTypesInfo.primary.description")}
                                                </div>

                                                <div className="d-flex align-items-center gap-2 mt-2 fw-semibold small">
                                                      <Calculator size={16} />
                                                      {t("finance:feeTypesInfo.primary.rule")}
                                                </div>

                                                <div className="d-flex align-items-start gap-2 mt-2 small text-muted">
                                                      <CheckCircle2 size={15} className="flex-shrink-0 mt-1" />
                                                      <span>
                                                            {t("finance:feeTypesInfo.primary.note")}
                                                      </span>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              {/* Monthly fee */}
                              <div className="border rounded-3 p-3 mb-3 bg-info bg-opacity-10">
                                    <div className="d-flex align-items-start gap-3">
                                          <div
                                                className="rounded-circle bg-info bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: 42, height: 42 }}
                                          >
                                                <CalendarDays size={22} className="text-info" />
                                          </div>

                                          <div className="flex-grow-1">
                                                <div className="fw-bold">
                                                      {t("finance:feeTypesInfo.monthly.title")}
                                                </div>

                                                <div className="text-muted small mt-1">
                                                      {t("finance:feeTypesInfo.monthly.description")}
                                                </div>

                                                <div className="d-flex align-items-center gap-2 mt-2 fw-semibold small">
                                                      <CalendarDays size={16} />
                                                      {t("finance:feeTypesInfo.monthly.rule")}
                                                </div>

                                                <div className="d-flex align-items-start gap-2 mt-2 small text-muted">
                                                      <CheckCircle2 size={15} className="flex-shrink-0 mt-1" />
                                                      <span>
                                                            {t("finance:feeTypesInfo.monthly.note")}
                                                      </span>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              {/* One-time fee */}
                              <div className="border rounded-3 p-3 bg-light">
                                    <div className="d-flex align-items-start gap-3">
                                          <div
                                                className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: 42, height: 42 }}
                                          >
                                                <Banknote size={22} className="text-secondary" />
                                          </div>

                                          <div className="flex-grow-1">
                                                <div className="fw-bold">
                                                      {t("finance:feeTypesInfo.oneTime.title")}
                                                </div>

                                                <div className="text-muted small mt-1">
                                                      {t("finance:feeTypesInfo.oneTime.description")}
                                                </div>

                                                <div className="d-flex align-items-center gap-2 mt-2 fw-semibold small">
                                                      <Coins size={16} />
                                                      {t("finance:feeTypesInfo.oneTime.rule")}
                                                </div>

                                                <div className="d-flex align-items-start gap-2 mt-2 small text-muted">
                                                      <CheckCircle2 size={15} className="flex-shrink-0 mt-1" />
                                                      <span>
                                                            {t("finance:feeTypesInfo.oneTime.note")}
                                                      </span>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                        </Modal.Body>

                        <Modal.Footer className="border-0 pt-0">
                              <Button
                                    variant="secondary"
                                    onClick={() => setShowFeeInfo(false)}
                              >
                                    {t("close")}
                              </Button>
                        </Modal.Footer>
                  </Modal>
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
