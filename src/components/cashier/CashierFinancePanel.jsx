import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Modal, Button, Spinner } from "react-bootstrap";
import { closeCashierMonth } from "../../api/services/cashierService";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  CircleCheck,
  CalendarCheck,
} from "lucide-react";
import ModalCashierFinance from "./ModalCashierFinance";

function EntryTable({ entries, label, money, date, empty }) {
  if (!entries.length) return <p className="cashier-finance-empty">{empty}</p>;
  return (
    <div className="table-responsive">
      <table className="table table-sm table-bordered table-hover align-middle cashier-finance-table">
        <thead>
          <tr>
            {["name", "amount", "documentNumber", "documentDate"].map((key) => (
              <th key={key} scope="col">
                {label(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.kind || "income"}-${entry.id}`}
              className={entry.kind ? `cashier-entry-${entry.kind}` : undefined}
            >
              <td data-label={label("name")}>
                {entry.kind === "bill" ? <em>{entry.name}</em> : entry.name}
              </td>
              <td data-label={label("amount")} className="fw-semibold">
                {money(entry.value)}
              </td>
              <td data-label={label("documentNumber")}>
                {entry.documentNumber}
              </td>
              <td data-label={label("documentDate")}>
                {date(entry.documentDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CashierFinancePanel({
  finance,
  homesPaid = false,
  closeActionContainer,
  error,
  condominiumId,
  condominiumName,
  onSaved,
  onRefresh,
  onMonthSelect,
}) {
  const { t, i18n } = useTranslation();
  const [modal, setModal] = useState(null);
  const [saved, setSaved] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");
  const closingRequest = useRef(false);
  const label = (key) => t(`dashboard:cashierFinance.${key}`);
  const money = (value) =>
    "€ " +
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  const date = (value) =>
    value
      ? new Intl.DateTimeFormat(i18n.language).format(
          new Date(`${value}T12:00:00`),
        )
      : "—";
  const period = (month) =>
    new Intl.DateTimeFormat(i18n.language, {
      month: "long",
      year: "numeric",
    }).format(new Date(month.year, month.number - 1, 1));
  if (error)
    return (
      <div className="alert alert-danger" role="alert">
        {label("loadError")}{" "}
        <button className="btn btn-outline-dark btn-sm" onClick={onRefresh}>
          {label("refresh")}
        </button>
      </div>
    );
  if (!finance)
    return (
      <div className="cashier-month-panel" role="status">
        <Spinner as="span" animation="border" size="sm" className="me-2" aria-hidden="true" />
        {label("loading")}
      </div>
    );
  const { summary, expenses, bills, billPayments, incomes } = finance;
  const monthlyExpenses =
    Number(summary.totalExpenses || 0) + Number(summary.totalBills || 0);
  const monthlyDifference =
    Number(summary.currentIncome || 0) -
    Number(summary.forFunds || 0) -
    monthlyExpenses;
  const summaryValues = {
    ...summary,
    totalExpenses: monthlyExpenses,
    monthlyDifference,
  };
  const singleIncome = incomes.reduce(
    (sum, entry) => sum + Number(entry.value),
    0,
  );
  const amountChip = (value, caption, tone = "") => (
    <span className={`cashier-formula-amount ${tone ? `is-${tone}` : ""}`}>
      <span>{Number(value) < 0 ? `${money(value)}` : money(value)}</span>
      <small>{label(caption)}</small>
    </span>
  );
  const breakdown = (field) => {
    if (field === "currentIncome")
      return (
        <>
          {amountChip(
            Number(summary.currentIncome || 0) - singleIncome,
            "feePart",
            "income",
          )}
          <span>+</span>
          {amountChip(singleIncome, "singleIncomePart", "income")}
        </>
      );
    if (field === "totalExpenses")
      return (
        <>
          {amountChip(summary.totalBills, "bills", "bill")}
          <span>+</span>
          {amountChip(summary.totalExpenses, "expenses", "expense")}
        </>
      );
    if (field === "monthlyDifference")
      return (
        <>
          {amountChip(summary.currentIncome, "incomePart", "income")}
          <span>−</span>
          {amountChip(summary.forFunds, "fundPart", "fund")}
          <span>−</span>
          {amountChip(monthlyExpenses, "expenses", "expense")}
        </>
      );
    return null;
  };
  const paidIds = new Set(
    billPayments.map((payment) => String(payment.billId)),
  );
  const unpaidBills = bills.filter((bill) => !paidIds.has(String(bill.id)));
  const canClose = homesPaid && unpaidBills.length === 0 && !summary.completed;
  const closeMonth = async () => {
    if (closingRequest.current || !canClose) return;
    closingRequest.current = true;
    setClosing(true);
    setCloseError("");
    try {
      const result = await closeCashierMonth(condominiumId, summary.id);
      onSaved(result);
      setConfirmClose(false);
      onRefresh();
    } catch (error) {
      setCloseError(
        label(error.response?.status === 409 ? "notSettled" : "closeError"),
      );
    } finally {
      closingRequest.current = false;
      setClosing(false);
    }
  };
  const outgoings = [
    ...expenses.map((entry) => ({ ...entry, kind: "expense" })),
    ...billPayments.map((entry) => ({ ...entry, kind: "bill" })),
  ].sort((a, b) => (b.documentDate || "").localeCompare(a.documentDate || ""));
  const open = (mode, billId) => {
    setSaved(false);
    setModal({ mode, billId });
  };
  const addButton = (mode, text, disabled = false) => (
    <button
      type="button"
      className="btn btn-outline-primary btn-sm cashier-finance-add"
      disabled={summary.completed || disabled}
      onClick={() => open(mode)}
    >
      <Plus size={16} aria-hidden="true" />
      {text}
    </button>
  );
  return (
    <>
      {saved && (
        <div className="alert alert-success py-2" role="status">
          {label("saved")}
        </div>
      )}
      <section
        className="cashier-month-panel cashier-finance-overview"
        aria-label={label("summary")}
      >
        <div className="cashier-panel-heading">
          <div>
            <h3>
              <Wallet size={21} aria-hidden="true" />
              {label("summary")}
            </h3>
            <p>{period(summary)}</p>
          </div>
        </div>
        <table className="table table-sm table-bordered cashier-finance-summary">
          <tbody>
            {[
              "currentIncome",
              "forFunds",
              "totalExpenses",
              "monthlyDifference",
              "fromPreviousMonth",
            ].map((field) => (
              <tr key={field}>
                <th
                  scope="row"
                  className={
                    field === "monthlyDifference"
                      ? "cashier-monthly-difference-label"
                      : "d-flex justify-content-start align-items-center gap-1"
                  }
                >
                  {label(field)}
                  {[
                    "currentIncome",
                    "totalExpenses",
                    "monthlyDifference",
                  ].includes(field) && (
                    <div className="cashier-summary-formula">
                      {breakdown(field)}
                    </div>
                  )}
                  {field === "fromPreviousMonth" &&
                    summary.previousAccountingMonth && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 ms-1 d-block text-capitalize"
                        onClick={() =>
                          onMonthSelect(
                            String(summary.previousAccountingMonth.id),
                          )
                        }
                      >
                        {new Intl.DateTimeFormat(i18n.language, {
                          month: "long",
                        }).format(
                          new Date(
                            summary.previousAccountingMonth.year,
                            summary.previousAccountingMonth.number - 1,
                            1,
                          ),
                        )}{" "}
                        {summary.previousAccountingMonth.year}
                      </button>
                    )}
                </th>
                <td
                  className={
                    field === "monthlyDifference"
                      ? monthlyDifference < 0
                        ? "text-danger fw-bold"
                        : "text-success fw-bold"
                      : undefined
                  }
                >
                  {money(summaryValues[field])}
                </td>
              </tr>
            ))}
            <tr
              className={`cashier-finance-balance ${Number(summary.currentDifference) < 0 ? "is-negative" : ""}`}
            >
              <th scope="row">
                {label("currentDifference")}
                <div className="cashier-summary-formula">
                  {amountChip(monthlyDifference, "differencePart")}
                  <span>+</span>
                  {amountChip(summary.fromPreviousMonth, "previousPart")}
                </div>
              </th>
              <td>{money(summary.currentDifference)}</td>
            </tr>
          </tbody>
        </table>
        <p className="smaller-text text-muted text-start mb-0">
          {label("balanceFormula")
            .split(/<br\s*\/?>/i)
            .map((line, index) => (
              <React.Fragment key={index}>
                {index > 0 && <br />}
                {line.trim()}
              </React.Fragment>
            ))}
        </p>
      </section>
      {canClose &&
        closeActionContainer &&
        createPortal(
          <button
            className="btn btn-outline-success btn-sm cashier-close-month"
            title={label("closeMonth")}
            aria-label={label("closeMonth")}
            type="button"
            disabled={closing}
            aria-haspopup="dialog"
            onClick={() => {
              setCloseError("");
              setConfirmClose(true);
            }}
          >
            <CalendarCheck size={19} aria-hidden="true" />
          </button>,
          closeActionContainer,
        )}
      <Modal
        show={confirmClose}
        onHide={() => {
          if (!closingRequest.current) setConfirmClose(false);
        }}
        centered
        backdrop={closing ? "static" : true}
        keyboard={!closing}
        aria-labelledby="close-month-title"
      >
        <Modal.Header closeButton={!closing}>
          <Modal.Title id="close-month-title">
            {label("closeMonth")}
            <div className="fs-5 fst-italic">{period(summary)}</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>{label("closeExplanation")}</p>
          {closeError && (
            <p className="alert alert-danger mb-0" role="alert">
              {closeError}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="secondary"
            disabled={closing}
            onClick={() => setConfirmClose(false)}
          >
            {label("cancelClose")}
          </Button>
          <Button
            variant="success"
            disabled={closing || !canClose}
            onClick={closeMonth}
          >
            {label(closing ? "closing" : "closeMonth")}
          </Button>
        </Modal.Footer>
      </Modal>
      <section
        className="cashier-month-panel cashier-finance-expenses"
        aria-label={label("expensesAnd") + " " + label("bills")}
      >
        <div className="cashier-panel-heading">
          <h3>
            <ArrowUpRight size={21} aria-hidden="true" />
            {label("expensesAnd")} <em>{label("bills")}</em>
          </h3>
          <div className="cashier-finance-actions">
            {unpaidBills.length > 0 ? (
              addButton("bill", label("payBill"))
            ) : (
              <span className="cashier-bills-paid" role="status">
                <CircleCheck size={18} aria-hidden="true" />
                {label("allBillsPaid")}
              </span>
            )}
            {!summary.completed && addButton("expense", label("addExpense"))}
          </div>
        </div>
        <EntryTable
          entries={outgoings}
          label={label}
          money={money}
          date={date}
          empty={label("noExpenses")}
        />
        <div className="cashier-finance-total">
          <span>{label("total")}</span>
          <strong>
            {money(
              Number(summary.totalExpenses || 0) +
                Number(summary.totalBills || 0),
            )}
          </strong>
        </div>
      </section>
      <section
        className="cashier-month-panel cashier-finance-incomes"
        aria-label={label("incomes")}
      >
        <div className="cashier-panel-heading">
          <h3>
            <ArrowDownLeft size={21} aria-hidden="true" />
            {label("incomes")}
          </h3>
          {!summary.completed && addButton("income", label("addIncome"))}
        </div>
        <EntryTable
          entries={incomes}
          label={label}
          money={money}
          date={date}
          empty={label("noIncomes")}
        />
        <div className="cashier-finance-total">
          <span>{label("total")}</span>
          <strong>
            {money(
              incomes.reduce((sum, entry) => sum + Number(entry.value), 0),
            )}
          </strong>
        </div>
      </section>
      {modal && (
        <ModalCashierFinance
          key={`${summary.id}-${modal.mode}-${modal.billId || "new"}`}
          {...modal}
          bills={unpaidBills}
          condominiumId={condominiumId}
          condominiumName={condominiumName}
          month={summary}
          onClose={() => setModal(null)}
          onRefresh={onRefresh}
          onSaved={(result) => {
            onSaved(result);
            setModal(null);
            setSaved(true);
          }}
        />
      )}
    </>
  );
}
