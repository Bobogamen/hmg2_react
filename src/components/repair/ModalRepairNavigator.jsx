import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import repairIcon from "../../assets/images/app/repair.png";
import { repairAmount } from "./repairFormatting";

const ModalRepairNavigator = ({ show, handleClose, condominium, repairId }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (show) setQuery("");
  }, [show]);
  const repairs = condominium.repairs || [];
  const visible = repairs.filter((repair) =>
    repair.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      scrollable
      size="lg"
      aria-labelledby="repair-navigator-title"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          <div className="fw-bold fs-5">
            <span className="bg-success bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 rounded">
              {t("finance:repairs")}
            </span>
            {t(" ")}
            {t("in")}
            {t(" ")}
            <span className="fst-italic text-primary border border-3 border-primary rounded px-1 text-break">
              {condominium?.name || ""}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="repair-navigator-search" className="mb-3">
          <Form.Label>{t("finance:repairNavigator.search")}</Form.Label>
          <Form.Control
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Form.Group>
        <p className="small text-muted" role="status">
          {t("finance:repairNavigator.results", {
            shown: visible.length,
            total: repairs.length,
          })}
        </p>
        {visible.length ? (
          <ul className="list-unstyled d-grid gap-3 mb-0">
            {visible.map((repair) => {
              const current = String(repair.id) === String(repairId);
              return (
                <li key={repair.id}>
                  <Link
                    to={`/repair/condominiums/${condominium.id}/repairs/${repair.id}`}
                    onClick={handleClose}
                    aria-current={current ? "page" : undefined}
                    className={`repair-selection-card repair-selection-card--${repair.completed ? "completed" : "pending"} d-flex align-items-center gap-3 p-3 text-decoration-none text-dark`}
                  >
                    <img src={repairIcon} width={32} height={32} alt="" />
                    <div className="flex-grow-1 text-break">
                      <div className="fw-bold">{repair.name}</div>
                      <div className="small mt-1">
                        {t("finance:budget")}: {repairAmount(repair.budget)}
                      </div>
                      <div className="small mt-1">
                        {t(
                          repair.completed
                            ? "finance:homeRepairs.completed"
                            : "finance:homeRepairs.notCompleted",
                        )}
                      </div>
                      {current && (
                        <span className="badge bg-primary mt-2">
                          {t("finance:repairNavigator.current")}
                        </span>
                      )}
                    </div>
                    <ArrowRight
                      size={18}
                      className="flex-shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-muted py-4">
            {t(
              repairs.length
                ? "finance:repairNavigator.noResults"
                : "finance:noneAddedRepairs",
            )}
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          {t("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRepairNavigator;
