import { Button, Modal } from "react-bootstrap";
import { Star, CalendarDays, Calculator, Banknote, ReceiptText, BadgeCheck, House, X, CircleQuestionMark, Ban, CircleDollarSign, Layers3 } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { TbCircleNumber1 } from "react-icons/tb";

const ModalFeeTypesInfo = ({ show, handleClose }) => {
      const { t } = useTranslation();

      return (
            <Modal show={show} onHide={handleClose} centered size="xl">
                  <Modal.Header closeButton className="border-0 pb-0">
                        <div>
                              <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                                    {t("finance:feeTypesInfo.title")}
                              </Modal.Title>
                        </div>
                  </Modal.Header>
                  {/* PRIMARY FEE */}
                  <Modal.Body className="pt-3">
                        <div className="border rounded-3 p-3 mb-3 bg-warning bg-opacity-10">
                              <div className="d-flex align-items-start gap-3">
                                    <div
                                          className="rounded-circle bg-warning bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                                          style={{ width: 42, height: 42 }}
                                    >
                                          <Star size={22} className="text-warning" />
                                    </div>

                                    <div className="">
                                          <div className="fw-bold">
                                                {t("finance:feeTypesInfo.primary.title")}
                                          </div>

                                          <div className="gap-1 mt-2 small">
                                                <BadgeCheck size={20} /> <Trans i18nKey="finance:feeTypesInfo.primary.description"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="gap-1 mt-2 small">
                                                <Calculator size={20} /><Trans i18nKey="finance:feeTypesInfo.primary.rule"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="gap-1 mt-2 small">
                                                <House size={20} className="flex-shrink-0 mt-1" /> <Trans i18nKey="finance:feeTypesInfo.primary.note"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>
                                    </div>
                              </div>
                        </div>
                        {/* MONTHLY FEE */}
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
                                                <Trans i18nKey="finance:feeTypesInfo.monthly.title"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="gap-2 mt-2 small">
                                                <CalendarDays size={20} /> <Trans i18nKey="finance:feeTypesInfo.monthly.description"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="gap-2 mt-2 small">
                                                <X size={20} /><Trans i18nKey="finance:feeTypesInfo.monthly.rule"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="gap-2 mt-2 small">
                                                <CircleQuestionMark size={20} className="flex-shrink-0 mt-1" /> <Trans i18nKey="finance:feeTypesInfo.monthly.note"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>
                                    </div>
                              </div>
                        </div>
                        {/* ONE TIME FEE */}
                        <div className="border rounded-3 p-3 mb-3 bg-white">
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

                                          <div className="gap-2 mt-2 small">
                                                <TbCircleNumber1 size={22} /> <Trans i18nKey="finance:feeTypesInfo.oneTime.description"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="gap-2 mt-2 small">
                                                <ReceiptText size={20} /> <Trans i18nKey="finance:feeTypesInfo.oneTime.rule"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="gap-2 mt-2 small">
                                                <Ban size={20} className="flex-shrink-0 mt-1" /> <Trans i18nKey="finance:feeTypesInfo.oneTime.note"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>
                                    </div>
                              </div>
                        </div>
                        {/* FUND FEE */}
                        <div className="border rounded-3 p-3 bg-secondary bg-opacity-10">
                              <div className="d-flex align-items-start gap-3">
                                    <div
                                          className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                                          style={{ width: 42, height: 42 }}
                                    >
                                          <CircleDollarSign size={22} className="text-secondary" />
                                    </div>

                                    <div className="flex-grow-1">
                                          <div className="fw-bold">
                                                {t("finance:feeTypesInfo.forFund.title")}
                                          </div>

                                          <div className="d-flex align-items-start gap-2 mt-2 small">
                                                <TbCircleNumber1 size={22} /> <Trans i18nKey="finance:feeTypesInfo.forFund.description"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="d-flex align-items-start gap-2 mt-2 small">
                                                <Layers3 size={20} /><Trans i18nKey="finance:feeTypesInfo.forFund.rule"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>

                                          <div className="d-flex align-items-start gap-2 mt-2 small">
                                                <CalendarDays size={20} /> <Trans i18nKey="finance:feeTypesInfo.monthly.description"
                                                      components={{ strong: <strong />, u: <u /> }} />
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </Modal.Body>

                  <Modal.Footer className="border-0 pt-0">
                        <Button variant="secondary" onClick={handleClose}>
                              {t("close")}
                        </Button>
                  </Modal.Footer>
            </Modal>
      );
};

export default ModalFeeTypesInfo;
