import React, { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { repairAmount } from "../repair/repairFormatting";
import { formatDate } from "../../utils/formatDate";
import fundIcon from "../../assets/images/app/fund.png";
import addIcon from "../../assets/images/app/add.png";
import ModalFundExpense from "./ModalFundExpense";

const FundDetails = ({ condominium, details, onSaved }) => {
  const { t, i18n } = useTranslation();
  const { fund, homes, expenses, incomes, totalExpenses, balance } = details;
  const [showExpense, setShowExpense] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  return (
    <div className="repair-details">
      <div className="d-flex justify-content-center align-items-stretch gap-2 mb-3 mb-lg-4">
        <div className="hg-title repair-details__title text-center">
          <h2 className="fw-bold fs-4 text-break mb-1">{fund.name}</h2>
          <div className="text-muted small fw-normal">{condominium.name}</div>
        </div>
        <button
          type="button"
          className="hg-title repair-details__navigator flex-shrink-0"
          onClick={() => setShowNavigator(true)}
          aria-label={t("finance:fundDetails.browseFunds")}
          title={t("finance:fundDetails.browseFunds")}
          aria-haspopup="dialog"
        >
          <img src={fundIcon} className="medium-icon" alt="" />
        </button>
      </div>
      <div className="d-flex justify-content-center mb-3">
        <div className="repair-details__summary bg-light border border-2 border-primary border-opacity-50 rounded-3 shadow-sm px-3 py-2 text-center">
          <div className="small text-muted">{t("finance:availableFunds")}</div>
          <strong
            className={`fs-5 ${Number(balance) < 0 ? "text-danger" : "text-success"}`}
          >
            {repairAmount(balance)}
          </strong>
        </div>
      </div>
      <div className="layout">
        <section className="homes-section" aria-label={t("home:homes")}>
          <div className="bg-info bg-opacity-50 border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-3 mx-1">
            <h3 className="h4 text-center text-capitalize fw-bold pb-2 mb-1">
              {t("home:homes")} · {homes.length}
            </h3>
            {homes.length ? (
              <Table
                responsive
                bordered
                striped
                hover
                size="sm"
                className="text-center align-middle mb-0"
              >
                <thead>
                  <tr>
                    <th scope="col">{t("home:fl")}</th>
                    <th scope="col">{t("home:apt")}</th>
                    <th scope="col">{t("home:owner")}</th>
                    <th scope="col">{t("finance:fee")}</th>
                    <th scope="col">{t("value")}</th>
                  </tr>
                </thead>
                <tbody>
                  {homes.map((home) => (
                    <tr key={home.id}>
                      <td>{home.floor}</td>
                      <td>{home.name}</td>
                      <td>{home.ownerName || t("common:noInfo")}</td>
                      <td>
                        {home.fees.map((fee) => (
                          <div key={fee.id} className="small text-break">
                            {fee.name}
                          </div>
                        ))}
                      </td>
                      <td className="nowrap fw-bold">
                        {repairAmount(home.totalFee)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="mt-3 fw-semibold text-center">
                {t("home:noHomes")}
              </p>
            )}
          </div>
        </section>
        <section
          className="utility-section"
          aria-label={t("finance:repairDetails.overview")}
        >
          <div className="bg-success bg-opacity-50 border border-3 border-primary border-opacity-75 rounded-5 shadow-lg p-3 mx-1">
            <h3 className="h4 text-center fw-bold pb-2 mb-1">
              {t("finance:repairDetails.overview")}
            </h3>
            <Table
              responsive
              bordered
              striped
              size="sm"
              className="align-middle mb-0"
            >
              <tbody>
                <tr>
                  <th scope="row">{t("finance:incomes")}</th>
                  <td className="text-end text-success">
                    {repairAmount(incomes)}
                  </td>
                </tr>
                <tr>
                  <th scope="row">{t("finance:repairDetails.expenses")}</th>
                  <td className="text-end">{repairAmount(totalExpenses)}</td>
                </tr>
                <tr
                  className={
                    Number(balance) < 0
                      ? "table-danger fw-bold"
                      : "table-success fw-bold"
                  }
                >
                  <th scope="row">{t("finance:repairDetails.difference")}</th>
                  <td className="text-end">{repairAmount(balance)}</td>
                </tr>
              </tbody>
            </Table>
          </div>
          <div className="bg-warning bg-opacity-50 border border-3 border-primary border-opacity-75 rounded-5 shadow-lg p-3 mx-1">
            <div className="position-relative d-flex justify-content-center align-items-center pb-2 mb-1 px-4">
              <h3 className="h4 text-capitalize fw-bold mb-0">
                {t("finance:repairDetails.expenses")}
              </h3>
              <span className="position-absolute end-0 fw-bold fs-5">
                {expenses.length > 0 ? expenses.length : ""}
              </span>
            </div>
            {expenses.length ? (
              <Table
                responsive
                bordered
                striped
                hover
                size="sm"
                className="text-center align-middle mb-0"
              >
                <thead>
                  <tr>
                    <th scope="col">{t("date")}</th>
                    <th scope="col" className="col-5">
                      {t("name")}
                    </th>
                    <th scope="col" className="col-5">
                      {t("numberN")}
                    </th>
                    <th scope="col">{t("value")}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="text-nowrap">
                        {formatDate(expense.documentDate, i18n.language)}
                      </td>
                      <td className="text-break text-start">{expense.name}</td>
                      <td className="text-break">{expense.documentNumber}</td>
                      <td className="text-nowrap text-end">
                        {repairAmount(expense.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="mt-3 fw-semibold text-center">
                {t("finance:repairDetails.noExpenses")}
              </p>
            )}
            <div
              type="button"
              className="img-button d-flex align-items-center m-auto mt-3"
              onClick={() => setShowExpense(true)}
            >
              <img src={addIcon} className="icon" alt="" />
              <span className="ms-1">
                {t("finance:repairDetails.addExpense")}
              </span>
            </div>
          </div>
        </section>
      </div>
      <ModalFundExpense
        show={showExpense}
        handleClose={() => setShowExpense(false)}
        condominiumId={condominium.id}
        fund={fund}
        onSaved={onSaved}
      />
      <Modal
        show={showNavigator}
        onHide={() => setShowNavigator(false)}
        centered
        scrollable
        aria-labelledby="fund-navigator-title"
      >
        <Modal.Header closeButton>
          <div className="fw-bold fs-5">
            <span className="bg-success bg-opacity-50 border border-3 border-primary border-opacity-50 px-1 rounded">
              {t("finance:funds")}
            </span>
            {t(" ")}
            {t("in")}
            {t(" ")}
            <span className="fst-italic text-primary border border-3 border-primary rounded px-1 text-break">
              {condominium?.name || ""}
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-unstyled d-grid gap-2 mb-0">
            {(condominium.funds || []).map((item) => (
              <li key={item.id}>
                <Link
                  to={`/fund/condominiums/${condominium.id}/funds/${item.id}`}
                  onClick={() => setShowNavigator(false)}
                  aria-current={item.id === fund.id ? "page" : undefined}
                  className={`d-block border rounded p-3 text-break text-decoration-none ${item.id === fund.id ? "border-primary bg-primary-subtle fw-bold" : "text-dark"}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNavigator(false)}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default FundDetails;
