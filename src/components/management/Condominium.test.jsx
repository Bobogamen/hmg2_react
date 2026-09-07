import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Condominium from "./Condominium";
import { getCondominium } from "../../api/services/managementService";

jest.mock("../../api/services/managementService", () => ({ getCondominium: jest.fn() }));
jest.mock("../../loader/LoadingContext", () => {
    const setIsLoading = jest.fn();
    return { useLoading: () => ({ setIsLoading }) };
});
jest.mock("../../user/UserContext", () => {
    const logout = jest.fn();
    return { useUser: () => ({ logout }) };
});
jest.mock("../breadcrumb/BreadcrumpContext", () => {
    const setBreadcrumbs = jest.fn();
    return { useBreadcrumb: () => ({ setBreadcrumbs }) };
});
jest.mock("react-i18next", () => {
    const t = (key, options) => options?.name ? `${key}: ${options.name}` : key;
    return { useTranslation: () => ({ t, i18n: { language: "en" } }) };
});
jest.mock("./ModalCondominium", () => () => null);
jest.mock("./bill/BillsTable", () => () => null);
jest.mock("./repair/RepairsTable", () => () => null);
jest.mock("./fee/ModalFee", () => () => null);
jest.mock("./fee/ModalFeeTypesInfo", () => () => null);
jest.mock("./fund/ModalFund", () => () => null);
jest.mock("./fund/ModalFundsInfo", () => () => null);
jest.mock("./home/HomesTable", () => ({ condominium, selectedHomeIds }) => (
    <div>{condominium.homes.map((home) => (
        <div key={home.id} className={selectedHomeIds.includes(home.id) ? "table-primary" : ""}>
            {home.name}
        </div>
    ))}</div>
));

const fixture = {
    id: 1, name: "Building", homes: [
        { id: 1, name: "Home 1" }, { id: 2, name: "Home 2" }, { id: 3, name: "Home 3" },
    ],
    fees: [
        { id: 11, name: "Fee A", fund: true, fundId: 101, homeIds: [1, 2], homes: 2, value: 10 },
        { id: 12, name: "Fee B", fund: true, fundId: "101", homeIds: [3], homes: 1, value: 20 },
        { id: 13, name: "Ordinary fee", fund: false, homeIds: [2], homes: 1, value: 5 },
        { id: 14, name: "Unassigned fee", fund: true, fundId: null, homeIds: [3], homes: 1, value: 5 },
    ],
    funds: [
        { id: 101, name: "Fund A", feeCount: 2 },
        { id: 102, name: "Empty fund", feeCount: 0 },
    ],
};

const feeCount = (name, linked = true) => screen.getByRole("button", {
    name: `finance:${linked ? "highlightFeeHomesAndFund" : "highlightFeeHomes"}: ${name}`,
});
const fundCount = (name) => screen.getByRole("button", { name: `finance:highlightFundFees: ${name}` });
const row = (name) => screen.getByText(name).closest("tr");
const click = (element) => {
    fireEvent.pointerDown(element);
    fireEvent.click(element);
};

beforeEach(async () => {
    getCondominium.mockResolvedValue(fixture);
    render(<MemoryRouter><Condominium /></MemoryRouter>);
    await screen.findByText("Fee A");
});

test("a fee highlights its homes and linked fund, and toggles off", () => {
    click(feeCount("Fee A"));
    expect(row("Fee A")).toHaveClass("table-primary");
    expect(row("Fund A")).toHaveClass("table-primary");
    expect(row("Fee B")).not.toHaveClass("table-primary");
    expect(row("Empty fund")).not.toHaveClass("table-primary");
    expect(screen.getByText("Home 1")).toHaveClass("table-primary");
    expect(screen.getByText("Home 2")).toHaveClass("table-primary");
    expect(screen.getByText("Home 3")).not.toHaveClass("table-primary");
    expect(feeCount("Fee A")).toHaveAttribute("aria-pressed", "true");

    click(feeCount("Fee A"));
    expect(document.querySelectorAll(".table-primary")).toHaveLength(0);
});

test("a fund highlights only its fees and replaces the previous fee selection", () => {
    click(feeCount("Fee A"));
    click(fundCount("Fund A"));
    expect(row("Fund A")).toHaveClass("table-primary");
    expect(row("Fee A")).toHaveClass("table-primary");
    expect(row("Fee B")).toHaveClass("table-primary");
    expect(row("Ordinary fee")).not.toHaveClass("table-primary");
    expect(row("Unassigned fee")).not.toHaveClass("table-primary");
    expect(screen.getByText("Home 1")).not.toHaveClass("table-primary");
    expect(screen.getByText("Home 2")).not.toHaveClass("table-primary");
    expect(feeCount("Fee A")).toHaveAttribute("aria-pressed", "false");
    expect(fundCount("Fund A")).toHaveAttribute("aria-pressed", "true");

    click(fundCount("Fund A"));
    expect(document.querySelectorAll(".table-primary")).toHaveLength(0);
});

test("fees without a linked fund and funds without fees leave unrelated rows clear", () => {
    for (const [name, home] of [["Ordinary fee", "Home 2"], ["Unassigned fee", "Home 3"]]) {
        click(fundCount("Fund A"));
        click(feeCount(name, false));
        expect(row("Fund A")).not.toHaveClass("table-primary");
        expect(screen.getByText(home)).toHaveClass("table-primary");
        expect(document.querySelectorAll(".table-primary")).toHaveLength(2);
    }
    click(fundCount("Empty fund"));
    expect(row("Empty fund")).toHaveClass("table-primary");
    expect(document.querySelectorAll(".table-primary")).toHaveLength(1);
});

test("keyboard activation, Escape, and clicking outside work for both count columns", () => {
    fireEvent.keyDown(fundCount("Fund A"), { key: "Enter" });
    expect(row("Fee B")).toHaveClass("table-primary");
    fireEvent.keyDown(fundCount("Fund A"), { key: " " });
    expect(document.querySelectorAll(".table-primary")).toHaveLength(0);

    fireEvent.keyDown(feeCount("Fee A"), { key: " " });
    expect(row("Fund A")).toHaveClass("table-primary");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.querySelectorAll(".table-primary")).toHaveLength(0);

    click(fundCount("Fund A"));
    fireEvent.pointerDown(screen.getByText("Building"));
    expect(document.querySelectorAll(".table-primary")).toHaveLength(0);
});
