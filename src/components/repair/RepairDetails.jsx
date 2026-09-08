import React, { useRef, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { completeRepair } from "../../api/services/repairService";
import { formatDate } from "../../utils/formatDate";
import { repairAmount, repairAmountValue } from "./repairFormatting";
import ModalRepairExpense from "./ModalRepairExpense";
import ModalRepairPayment from "./ModalRepairPayment";
import repairIcon from "../../assets/images/app/repair.png";
import addIcon from "../../assets/images/app/add.png";
import "./Repair.css";

const RepairDetails = ({ condominium, details, onSaved }) => {
    const { t, i18n } = useTranslation();
    const { repair, payments, expenses } = details;
    const [selectedHomeId, setSelectedHomeId] = useState(null);
    const [showExpense, setShowExpense] = useState(false);
    const [paymentHomeId, setPaymentHomeId] = useState(null);
    const [completing, setCompleting] = useState(false);
    const [confirmCompletion, setConfirmCompletion] = useState(false);
    const [completionError, setCompletionError] = useState(null);
    const completionPending = useRef(false);
    const canComplete =
        !repair.completed &&
        payments.length > 0 &&
        payments.every((payment) => payment.paidDate != null);
    const handleComplete = async () => {
        if (!confirmCompletion || !canComplete || completionPending.current) return;
        completionPending.current = true;
        setCompleting(true);
        setCompletionError(null);
        try {
            await completeRepair({
                condominiumId: condominium.id,
                repairId: repair.id,
            });
        } catch (error) {
            const code = error.response?.data?.message;
            if (!error.handled && !error.isForbidden) {
                setCompletionError(
                    ["repairNotFullyPaid", "repairNotFound"].includes(code)
                        ? `finance:${code}`
                        : "server:error",
                );
            }
            completionPending.current = false;
            setCompleting(false);
            return;
        }
        setConfirmCompletion(false);
        toast.success(t("finance:repairDetails.completedSuccessfully"));
        onSaved();
    };
    const sumPayments = (items) =>
        items.reduce(
            (total, payment) => total + Math.round(Number(payment.value) * 100),
            0,
        ) / 100;
    const homesById = new Map(
        (condominium.homes || []).map((home) => [String(home.id), home]),
    );
    const paymentsByHome = new Map();
    payments.forEach((payment) => {
        const key = String(payment.homeId);
        if (!paymentsByHome.has(key)) paymentsByHome.set(key, []);
        paymentsByHome.get(key).push(payment);
    });
    const rows = [...paymentsByHome]
        .map(([id, installments]) => ({
            id,
            home: homesById.get(id),
            installments,
            paid: installments.filter((payment) => payment.paidDate != null).length,
            total: sumPayments(installments),
            amountPaid: sumPayments(
                installments.filter((payment) => payment.paidDate != null),
            ),
            maximum: Math.max(
                0,
                ...installments.map((payment) => Number(payment.value)),
            ),
        }))
        .sort((a, b) => (a.home?.sortOrder ?? 0) - (b.home?.sortOrder ?? 0));
    const selected = rows.find((row) => row.id === selectedHomeId);
    const paymentHome = rows.find((row) => row.id === paymentHomeId);
    const homeName = (row) =>
        [
            row.home?.floor != null && row.home.floor !== ""
                ? `${t("home:floor")} ${row.home.floor}`
                : null,
            row.home?.name != null && row.home.name !== ""
                ? `${t("home:apt")} ${row.home.name}`
                : null,
        ]
            .filter(Boolean)
            .join(" • ") || t("finance:repairDetails.homeReference", { id: row.id });
    const paidInstallments = (selected?.installments || [])
        .filter((payment) => payment.paidDate != null)
        .sort((a, b) => (a.installmentNumber || 0) - (b.installmentNumber || 0));

    return (
        <div className="repair-details">
            <div className="d-flex justify-content-center mb-3 mb-lg-4">
                <div className="hg-title repair-details__title">
                    <div className="d-flex justify-content-center align-items-center gap-3">
                        <div className="text-center">
                            <h2 className="fw-bold fs-4 text-break mb-1">{repair.name}</h2>
                            <div className="text-muted small fw-normal">
                                {condominium.name}
                            </div>
                        </div>
                        <img
                            src={repairIcon}
                            className="medium-icon flex-shrink-0"
                            alt=""
                        />
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-center mb-3">
                <div className="repair-details__summary d-flex justify-content-center align-items-center flex-wrap gap-3 bg-light border border-2 border-primary border-opacity-50 rounded-3 shadow-sm px-3 py-2 text-center">
                    <div className="px-2">
                        <div className="small text-muted">{t("finance:budget")}</div>
                        <strong className="fs-5">{repairAmount(repair.budget)}</strong>
                    </div>
                    <div className="vr align-self-stretch" aria-hidden="true" />
                    <div className="px-2">
                        <div className="small text-muted">
                            {t("finance:availableFunds")}
                        </div>
                        <strong
                            className={`fs-5 ${Number(repair.balance) < 0 ? "text-danger" : "text-success"}`}
                        >
                            {repairAmount(repair.balance)}
                        </strong>
                    </div>
                    <span
                        className={`badge ${repair.completed ? "bg-success" : "bg-danger"}`}
                    >
                        {t(
                            repair.completed
                                ? "finance:homeRepairs.completed"
                                : "finance:homeRepairs.notCompleted",
                        )}
                    </span>
                </div>
            </div>
            <div className="layout">
                <section className="homes-section" aria-label={t("home:homes")}>
                    <div className="bg-info bg-opacity-50 border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-3 mx-1">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-2 mb-1">
                            <div className="d-flex flex-grow-1 justify-content-center align-items-center gap-2">
                                <h3 className="h4 text-capitalize fw-bold mb-0">
                                    {t("home:homes")}
                                </h3>
                                <span className="h4 mb-0">
                                    {rows.length} {t("home:pcs")}
                                </span>
                            </div>
                            {canComplete && (
                                <Button
                                    variant="success"
                                    size="sm"
                                    className="ms-auto fw-bold"
                                    disabled={completing}
                                    onClick={() => {
                                        setCompletionError(null);
                                        setConfirmCompletion(true);
                                    }}
                                >
                                    <span aria-hidden="true" className="me-1">
                                        ✓
                                    </span>
                                    {t(
                                        completing
                                            ? "saving"
                                            : "finance:repairDetails.completeRepair",
                                    )}
                                </Button>
                            )}
                        </div>
                        <div>
                            {rows.length ? (
                                <Table
                                    responsive
                                    bordered
                                    striped
                                    hover
                                    size="sm"
                                    className="repair-details__homes-table text-center align-middle mb-0"
                                >
                                    <thead>
                                        <tr>
                                            <th scope="col">{t("home:fl")}</th>
                                            <th scope="col">{t("home:apt")}</th>
                                            <th scope="col">{t("home:owner")}</th>
                                            <th scope="col">{t("finance:installment")}</th>
                                            <th scope="col">
                                                {t("finance:repairPayments.paidOfTotal")}
                                            </th>
                                            <th scope="col">
                                                {t("finance:homeRepairs.paidInstallments")}
                                            </th>
                                            <th scope="col">{t("finance:repairPayments.payment")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => {
                                            const totalCents = Math.round(row.total * 100);
                                            const paidCents = Math.round(row.amountPaid * 100);
                                            const progress =
                                                totalCents > 0
                                                    ? Math.min(
                                                        100,
                                                        Math.max(
                                                            0,
                                                            Math.floor((paidCents / totalCents) * 100),
                                                        ),
                                                    )
                                                    : row.paid === row.installments.length
                                                        ? 100
                                                        : 0;
                                            return (
                                                <tr key={row.id}>
                                                    <td>{row.home?.floor ?? "—"}</td>
                                                    <td>{row.home?.name ?? "—"}</td>
                                                    <td>
                                                        {[
                                                            row.home?.owner?.firstName,
                                                            row.home?.owner?.lastName,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ") || t("common:noInfo")}
                                                    </td>
                                                    <td className="text-nowrap">
                                                        {repairAmount(row.maximum)}
                                                    </td>
                                                    <td className="repair-details__amounts">
                                                        <div className="text-nowrap mb-2">
                                                            <strong className="text-success">
                                                                {repairAmount(row.amountPaid)}
                                                            </strong>
                                                            <span className="text-muted">
                                                                {" "}
                                                                / {repairAmountValue(row.total)}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className="progress repair-details__payment-progress"
                                                            title={t("finance:repairPayments.percentPaid", {
                                                                percent: progress,
                                                            })}
                                                        >
                                                            <div
                                                                className="progress-bar bg-success"
                                                                role="progressbar"
                                                                style={{ width: `${progress}%` }}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                                aria-valuenow={progress}
                                                                aria-label={t(
                                                                    "finance:repairPayments.progressForHome",
                                                                    { home: homeName(row) },
                                                                )}
                                                                aria-valuetext={t(
                                                                    "finance:repairPayments.percentPaid",
                                                                    { percent: progress },
                                                                )}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={`repair-details__paid-count btn btn-sm fw-bold ${row.paid === row.installments.length ? "btn-success" : "btn-outline-primary"}`}
                                                            onClick={() => setSelectedHomeId(row.id)}
                                                            aria-label={t(
                                                                "finance:repairDetails.viewPayments",
                                                                { home: homeName(row) },
                                                            )}
                                                        >
                                                            {row.paid} / {row.installments.length}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        {row.paid < row.installments.length ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm repair-details__pay-button"
                                                                onClick={() => setPaymentHomeId(row.id)}
                                                                aria-label={t(
                                                                    "finance:repairPayments.payForHome",
                                                                    { home: homeName(row) },
                                                                )}
                                                            >
                                                                {t("finance:repairPayments.payInstallment")}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn btn-success btn-sm repair-details__pay-button"
                                                                disabled
                                                            >
                                                                {t("finance:repairPayments.paidInFull")}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="mt-3 fs-5 fw-semibold text-center">
                                    {t("finance:repairDetails.noHomes")}
                                </p>
                            )}
                        </div>
                    </div>
                </section>
                <section
                    className="utility-section"
                    aria-label={t("finance:repairDetails.overview")}
                >
                    <div className="bg-success bg-opacity-50 border border-3 border-primary border-opacity-75 rounded-5 shadow-lg p-3 mx-1">
                        <h3 className="h4 text-center text-capitalize fw-bold pb-2 mb-1">
                            {t("finance:repairDetails.overview")}
                        </h3>
                        <div>
                            <Table
                                responsive
                                bordered
                                striped
                                hover
                                size="sm"
                                className="align-middle mb-0"
                            >
                                <tbody>
                                    <tr>
                                        <th scope="row">{t("finance:incomes")}</th>
                                        <td className="text-end text-success">
                                            {repairAmount(repair.totalPaid)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">{t("finance:repairDetails.expenses")}</th>
                                        <td className="text-end">
                                            {repairAmount(repair.totalExpenses)}
                                        </td>
                                    </tr>
                                    <tr
                                        className={`fw-bold ${Number(repair.balance) < 0 ? "table-danger" : "table-success"}`}
                                    >
                                        <th scope="row">{t("finance:repairDetails.difference")}</th>
                                        <td
                                            className={`text-end ${Number(repair.balance) < 0 ? "text-danger" : "text-success"}`}
                                        >
                                            {repairAmount(repair.balance)}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
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
                        <div>
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
                                                <td className="text-break text-start">
                                                    {expense.name}
                                                </td>
                                                <td className="text-break">{expense.documentNumber}</td>
                                                <td className="text-nowrap text-end">
                                                    {repairAmount(expense.value)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="mt-3 fs-5 fw-semibold text-center">
                                    {t("finance:repairDetails.noExpenses")}
                                </p>
                            )}
                        </div>
                        {!repair.completed && (
                            <div
                                className="img-button pointer d-flex align-items-center m-auto mt-3"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowExpense(true)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        setShowExpense(true);
                                    }
                                }}
                            >
                                <img src={addIcon} className="icon" alt="" />
                                <span className="ms-1">
                                    {t("finance:repairDetails.addExpense")}
                                </span>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Modal
                show={confirmCompletion && canComplete}
                onHide={() => !completing && setConfirmCompletion(false)}
                centered
                backdrop={completing ? "static" : true}
                keyboard={!completing}
                aria-describedby="repair-completion-warning"
            >
                <Modal.Header closeButton closeLabel={t("close")}>
                    <Modal.Title className="fs-5 fw-bold">
                        {t("complete")} {" "}
                        <span className="m-auto bg-success bg-opacity-50 border border-3 border-primary px-1 rounded width-fit-content fs-5 fw-bold">
                            {t("finance:repair")}
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-grid justify-content-center flex-wrap gap-1 mb-3">
                        <div className="fst-italic text-primary border border-3 border-primary rounded px-1 text-break width-fit-content fs-5 fw-bold">
                            {repair.name}
                        </div>
                    </div>
                    <div
                        className="text-center bg-warning bg-opacity-25 border border-warning rounded p-3"
                        id="repair-completion-warning"
                    >
                        <p className="fw-bold mb-2">
                            {t("finance:repairDetails.completeWarning")}
                        </p>
                        <p className="mb-0">
                            {t("finance:repairDetails.completeCheckExpenses")}
                        </p>
                    </div>
                    {completionError && (
                        <div role="alert" className="alert alert-danger mt-3 mb-0">
                            {t(completionError)}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button
                        variant="secondary"
                        disabled={completing}
                        onClick={() => setConfirmCompletion(false)}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="success"
                        disabled={completing}
                        onClick={handleComplete}
                    >
                        {t(completing ? "saving" : "finance:repairDetails.completeRepair")}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={Boolean(selected)}
                onHide={() => setSelectedHomeId(null)}
                centered
                size="l"
            >
                <Modal.Header closeButton closeLabel={t("close")}>
                    <Modal.Title className="fs-5 fw-bold">
                        {t("finance:repairDetails.paymentDetails")} {t("for")}
                        <div className="text-muted fs-5 fst-italic">
                            {selected && homeName(selected)}
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-grid justify-content-center flex-wrap gap-1 mb-3">
                        <div className="m-auto bg-success bg-opacity-50 border border-3 border-primary px-1 rounded width-fit-content fs-5 fw-bold">
                            {t("finance:repair")}
                        </div>
                        <div className="fst-italic text-primary border border-3 border-primary rounded px-1 text-break width-fit-content fs-5 fw-bold">
                            {repair.name}
                        </div>
                    </div>
                    <div className="bg-info bg-opacity-25 border border-2 border-primary border-opacity-50 rounded p-3">
                        {paidInstallments.length ? (
                            <Table
                                responsive
                                bordered
                                striped
                                hover
                                size="sm"
                                className="text-center align-middle mb-0"
                            >
                                <thead className="align-middle">
                                    <tr>
                                        <th scope="col">
                                            {t("finance:repairDetails.installmentNumber")}
                                        </th>
                                        <th scope="col">{t("finance:repairDetails.paidDate")}</th>
                                        <th scope="col">{t("value")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paidInstallments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{payment.installmentNumber}</td>
                                            <td>{formatDate(payment.paidDate, i18n.language)}</td>
                                            <td className="fw-semibold">
                                                {repairAmount(payment.value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted mb-0">
                                {t("finance:repairDetails.noPaidInstallments")}
                            </p>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedHomeId(null)}>
                        {t("close")}
                    </Button>
                </Modal.Footer>
            </Modal>
            <ModalRepairExpense
                show={showExpense && !repair.completed}
                handleClose={() => setShowExpense(false)}
                condominiumId={condominium.id}
                repair={repair}
                onSaved={onSaved}
            />
            {paymentHome && (
                <ModalRepairPayment
                    key={paymentHome.id}
                    condominiumId={condominium.id}
                    repair={repair}
                    homeName={homeName(paymentHome)}
                    installments={paymentHome.installments}
                    handleClose={() => setPaymentHomeId(null)}
                    onSaved={onSaved}
                />
            )}
        </div>
    );
};
export default RepairDetails;
