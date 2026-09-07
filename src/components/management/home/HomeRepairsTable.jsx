import React from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const formatAmount = (value) => Math.ceil(Number(value)).toFixed(0);

const HomeRepairsTable = ({ repairs = [] }) => {
    const { t } = useTranslation();

    return (
        <div className="card bg-success bg-opacity-25 mt-3">
            <div className="card-header d-flex justify-content-between align-items-center gap-3">
                <div className="fs-3 fw-bold">{t("finance:repairs")}</div>
                <span className="fw-bold fs-5">{repairs.length}</span>
            </div>
            <div className="card-body">
                {repairs.length > 0 ? (
                    <Table responsive bordered striped hover size="sm" className="align-middle text-center mb-0">
                        <thead>
                            <tr className="text-center">
                                <th scope="col" className="text-start">{t("name")}</th>
                                <th scope="col">{t("finance:installment")}</th>
                                <th scope="col">{t("finance:homeRepairs.paidInstallments")}</th>
                                <th scope="col">{t("finance:homeRepairs.status")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repairs.map((repair) => {
                                const payments = repair.payments || [];
                                const count = payments.length;
                                const paid = payments.filter((payment) => payment.paidDate != null).length;
                                const maximum = Math.max(0, ...payments.map((payment) => Number(payment.value)));

                                return (
                                    <tr key={repair.id}>
                                        <th scope="row" className="text-start fw-normal col-10">
                                            <div className="fw-bold text-break">{repair.name}</div>
                                            <div className="small text-muted fst-italic">
                                                {t("finance:budget")}: <span className="text-nowrap fw-semibold">€ {formatAmount(repair.budget)}</span>
                                            </div>
                                        </th>
                                        <td className="text-nowrap fw-semibold">
                                            {count > 0 ? `€ ${formatAmount(maximum)}` : "—"}
                                        </td>
                                        <td>
                                            <span className={`badge ${count > 0 && paid === count ? "bg-success" : "bg-secondary"}`}>
                                                {t("finance:homeRepairs.paidProgress", { paid, total: count })}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${repair.completed ? "bg-success" : "bg-warning text-dark"}`}>
                                                {t(repair.completed ? "finance:homeRepairs.completed" : "finance:homeRepairs.notCompleted")}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                ) : (
                    <p className="mb-0 text-muted">{t("finance:homeRepairs.empty")}</p>
                )}
            </div>
        </div>
    );
};
export default HomeRepairsTable;
