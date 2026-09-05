import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";
import { TriangleAlert, CircleX, Info } from "lucide-react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Popover } from "react-bootstrap";

import "./SortableRow.css";

import homeIcon from "../../src/assets/images/app/home.png";
import addResident from "../../src/assets/images/app/add_resident.png";
import { useTranslation } from "react-i18next";

const SortableRow = ({
    home,
    condominiumId,
    onOpenResidentModal,
    isHighlighted = false
}) => {
    const { t } = useTranslation();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: home.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
    };

    const feeCalculations = [...(home.feeCalculations || [])].sort((a, b) => {
        const groupA = a.primary ? 0 : a.monthly ? 1 : 2;
        const groupB = b.primary ? 0 : b.monthly ? 1 : 2;

        return groupA - groupB || a.feeName.localeCompare(b.feeName);
    });

    const formatAmount = (amount) => Number(amount || 0).toFixed(2);

    const calculationPopover = (
        <Popover id={`fee-calculation-${home.id}`} className="fee-calculation-popover">
            <Popover.Body className="p-2">
                <div className="fee-calculation-scroll">
                    <table className="table table-warning table-sm table-bordered table-striped mb-0 fee-calculation-table">
                        <thead>
                            <tr>
                                <th>{t("finance:fee")}</th>
                                <th>{t("value")}</th>
                                <th>{t("home:residents")}/{t("home:pcs")}</th>
                                <th className="text-center">{t("total")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeCalculations.map((calculation) => (
                                <tr
                                    key={calculation.feeName}
                                    className={`${calculation.primary ? "fw-bold" : ""} ${calculation.fund ? "fst-italic" : ""}`}
                                >
                                    <td>
                                        {calculation.fund
                                            ? "\u{1F4B0}"
                                            : calculation.primary
                                                ? "\u{2B50}"
                                                : calculation.monthly
                                                    ? "\u{1F4C5}"
                                                    : "\u{1F4B6}"}
                                        {calculation.feeName}{" "}
                                    </td>
                                    <td className="text-center">{formatAmount(calculation.feeValue)}</td>
                                    <td className="text-center">{calculation.activeResidentCount}</td>
                                    <td className="text-end">
                                        {formatAmount(calculation.feeValue)} × {calculation.activeResidentCount} = {formatAmount(calculation.total)}
                                    </td>
                                </tr>
                            ))}
                            <tr className="fw-bold">
                                <td colSpan="3">{t("total")}</td>
                                <td className="text-end">
                                    {formatAmount(home.totalForMonth)} €
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Popover.Body>
        </Popover>
    );

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={isHighlighted ? "fee-home-highlight" : ""}
            {...attributes}
            {...listeners}
        >
            <td>{home.floor}</td>
            <td>{home.name}</td>
            <td>
                <div className="owner-cell">
                    <div className="owner-cell-left">
                        {!home.hasFees && (
                            <OverlayTrigger
                                trigger={["hover", "focus", "click"]}
                                placement="top"
                                rootClose
                                overlay={
                                    <Tooltip id={`no-fees-tooltip-${home.id}`}>
                                        {t("finance:noFeesAssigned")}
                                    </Tooltip>
                                }
                            >
                                <span
                                    className="owner-warning-trigger"
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <CircleX
                                        size={18}
                                        className="owner-warning owner-warning-danger"
                                        aria-label="No fees assigned"
                                    />
                                </span>
                            </OverlayTrigger>
                        )}

                        {home.hasFees && !home.hasPrimaryFee && (
                            <OverlayTrigger
                                trigger={["hover", "focus", "click"]}
                                placement="top"
                                rootClose
                                overlay={
                                    <Tooltip id={`no-primary-fee-tooltip-${home.id}`}>
                                        {t("finance:noPrimaryFeeAssigned")}
                                    </Tooltip>
                                }
                            >
                                <span
                                    className="owner-warning-trigger"
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <TriangleAlert
                                        size={18}
                                        className="owner-warning owner-warning-warning"
                                        aria-label="No primary fee assigned"
                                        color="red"
                                    />
                                </span>
                            </OverlayTrigger>
                        )}
                    </div>

                    <div className="owner-cell-center">
                        {`${home.owner.firstName} ${home.owner.lastName}`}

                        {home.hasFees && <OverlayTrigger
                            trigger={["click"]}
                            placement="top"
                            rootClose
                            overlay={calculationPopover}
                        >
                            <span
                                className="owner-fee-info"
                                onPointerDown={(event) => event.stopPropagation()}
                                onClick={(event) => event.stopPropagation()}
                                role="button"
                                tabIndex={0}
                                aria-label="Show monthly fee calculation"
                            >
                                <Info size={15} />
                            </span>
                        </OverlayTrigger>
                        }
                    </div>
                </div>
            </td>
            <td>{home.residentsSize}</td>
            <td>€ {home.totalForMonth.toFixed(2)}</td>
            <td>
                <div className="d-flex justify-content-evenly">
                    <Link
                        to={`/management/condominiums/${condominiumId}/homes/${home.id}`}
                        className="text-decoration-none text-dark"
                    >
                        <img
                            src={homeIcon}
                            alt="home"
                            className="icon"
                        />
                    </Link>

                    <img
                        src={addResident}
                        alt="add_resident"
                        className="icon pointer"
                        onClick={onOpenResidentModal}
                    />
                </div>
            </td>
        </tr>
    );
};

export default SortableRow;
