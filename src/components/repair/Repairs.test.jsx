import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Repairs from "./Repairs";
import { BreadcrumbProvider } from "../breadcrumb/BreadcrumpContext";
import Breadcrumbs from "../breadcrumb/Breadcrumbs";
import { LoadingProvider } from "../../loader/LoadingContext";
import { getCondominium } from "../../api/services/managementService";
import { getRepairDetails, addRepairExpense, payRepairInstallment, completeRepair } from "../../api/services/repairService";

jest.mock("../../api/services/managementService", () => ({ getCondominium: jest.fn() }));
jest.mock("../../api/services/repairService", () => ({ getRepairDetails: jest.fn(), addRepairExpense: jest.fn(), payRepairInstallment: jest.fn(), completeRepair: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../../user/UserContext", () => ({ useUser: () => ({ user: { condominiums: [{ id: 1, name: "Building A" }] } }) }));
jest.mock("react-i18next", () => {
    const translations = {
        finance: require("../../locales/en/finance.json"), home: require("../../locales/en/home.json"),
        validation: require("../../locales/en/validation.json"), common: require("../../locales/en/common.json"),
    };
    const t = (key, options = {}) => {
        const [namespace, path] = key.includes(":") ? key.split(":") : ["common", key];
        const value = path.split(".").reduce((result, part) => result?.[part], translations[namespace]);
        return typeof value === "string" ? value.replace(/{{(\w+)}}/g, (_, name) => options[name]) : key;
    };
    return { useTranslation: () => ({ t, i18n: { language: "en" } }) };
});

const repair = { id: 5, name: "Roof repair", budget: "1000", totalPaid: "33.34", totalExpenses: "10", balance: "23.34", completed: false };
const details = { repair, payments: [
    { id: 1, homeId: 10, installmentNumber: 1, value: "33.34", paidDate: "2026-01-01" },
    { id: 2, homeId: 10, installmentNumber: 2, value: "33.33", paidDate: null },
    { id: 3, homeId: 11, installmentNumber: 1, value: "50", paidDate: null },
], expenses: [{ id: 4, name: "Inspection", value: "10", addedOn: "2026-01-02", documentDate: "2026-01-01", documentNumber: "INV-1" }] };
const condo = { id: 1, name: "Building A", repairs: [repair], homes: [
    { id: 10, floor: "1", name: "1", owner: { firstName: "Anna", lastName: "Ivanova" } },
    { id: 11, floor: "2", name: "2", owner: null },
] };

const open = (path = "/repair") => render(
    <MemoryRouter initialEntries={[path]}>
        <LoadingProvider><BreadcrumbProvider><Breadcrumbs /><Routes>
            <Route path="/repair" element={<Repairs />} />
            <Route path="/repair/condominiums/:condominiumId" element={<Repairs />} />
            <Route path="/repair/condominiums/:condominiumId/repairs/:repairId" element={<Repairs />} />
        </Routes></BreadcrumbProvider></LoadingProvider>
    </MemoryRouter>
);

beforeEach(() => {
    jest.clearAllMocks();
    getCondominium.mockResolvedValue(condo);
    getRepairDetails.mockResolvedValue(details);
    addRepairExpense.mockResolvedValue({ id: 42 });
    payRepairInstallment.mockResolvedValue({ id: 2, paidDate: "2026-01-04" });
    completeRepair.mockResolvedValue(undefined);
});

test("selects condominium then repair, and breadcrumbs navigate back", async () => {
    open();
    expect(getCondominium).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "Building A" }));
    fireEvent.click(await screen.findByRole("link", { name: /Roof repair/ }));
    await screen.findByRole("button", { name: "Add expense" });
    const breadcrumbs = within(screen.getByLabelText("breadcrumb"));
    expect(await breadcrumbs.findByText("Roof repair")).toBeInTheDocument();
    expect(breadcrumbs.getByRole("link", { name: "Repairs" })).toHaveAttribute("href", "/repair");
    fireEvent.click(breadcrumbs.getByRole("link", { name: "Building A" }));
    await screen.findByRole("link", { name: /Roof repair/ });
    expect(screen.queryByRole("button", { name: "Add expense" })).not.toBeInTheDocument();
});

test("shows each home's paid installments in a modal without unpaid or other-home payments", async () => {
    open("/repair/condominiums/1/repairs/5");
    const count = await screen.findByRole("button", { name: "View paid installments for floor 1 • apt 1" });
    expect(count).toHaveTextContent("1 / 2");
    expect(screen.getByText("Anna Ivanova")).toBeInTheDocument();
    fireEvent.click(count);
    const modal = within(await screen.findByRole("dialog"));
    expect(modal.getByText("01-Jan-2026")).toBeInTheDocument();
    expect(modal.getByText("€ 33.34")).toBeInTheDocument();
    expect(modal.queryByText("€ 50.00")).not.toBeInTheDocument();
    expect(modal.getAllByRole("row")).toHaveLength(2);
    fireEvent.click(modal.getAllByRole("button", { name: "Close", exact: true })[0]);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "View paid installments for floor 2 • apt 2" }));
    expect(await screen.findByText("No installments have been paid for this home yet.")).toBeInTheDocument();
});

test("validates expense fields inline, saves selected repair, and refreshes totals and expenses", async () => {
    addRepairExpense.mockRejectedValueOnce({ isValidationError: true, validationErrors: {
        name: [{ code: "required" }], value: [{ code: "required" }], documentNumber: [{ code: "required" }],
    } });
    open("/repair/condominiums/1/repairs/5");
    fireEvent.click(await screen.findByRole("button", { name: "Add expense" }));
    const modal = within(await screen.findByRole("dialog"));
    expect(modal.queryByLabelText("Added on")).not.toBeInTheDocument();
    expect([...screen.getByRole("dialog").querySelectorAll("input")].map((input) => input.name))
        .toEqual(["name", "value", "documentNumber", "documentDate"]);
    fireEvent.click(modal.getByRole("button", { name: "Add" }));
    expect(await modal.findAllByText("This field is required")).toHaveLength(3);
    fireEvent.change(modal.getByLabelText(/^name$/i), { target: { value: "Materials" } });
    fireEvent.change(modal.getByLabelText("Document number"), { target: { value: "INV-2" } });
    fireEvent.change(modal.getByLabelText(/Value/), { target: { value: "-5" } });
    addRepairExpense.mockRejectedValueOnce({ isValidationError: true,
        validationErrors: { value: [{ code: "positiveNumber" }] },
    });
    fireEvent.submit(modal.getByRole("button", { name: "Add" }).closest("form"));
    expect(await modal.findByText("Must be a positive number")).toBeInTheDocument();
    fireEvent.change(modal.getByLabelText(/Value/), { target: { value: "5.25" } });
    getRepairDetails.mockResolvedValueOnce({ ...details, repair: { ...repair, totalExpenses: "15.25", balance: "18.09" },
        expenses: [...details.expenses, { id: 42, name: "Materials", value: "5.25", addedOn: "2026-01-03", documentDate: "2026-01-03", documentNumber: "INV-2" }] });
    fireEvent.click(modal.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(addRepairExpense).toHaveBeenCalledWith(expect.objectContaining({ condominiumId: 1, repairId: 5, name: "Materials", value: "5.25", documentNumber: "INV-2" })));
    expect(addRepairExpense.mock.calls[0][0]).not.toHaveProperty("addedOn");
    expect(await screen.findByText("Materials")).toBeInTheDocument();
    expect(screen.getAllByText("€ 18.09")).toHaveLength(2);
});

test("shows paid income, summed expenses and their difference with exact cents", async () => {
    getRepairDetails.mockResolvedValueOnce({ ...details,
        repair: { ...repair, totalExpenses: "20.47", balance: "12.87" },
        expenses: [
            { ...details.expenses[0], value: "10.23" },
            { ...details.expenses[0], id: 6, name: "Materials", value: "10.24" },
        ],
    });
    open("/repair/condominiums/1/repairs/5");
    await screen.findByRole("button", { name: "Add expense" });
    expect(screen.getByRole("rowheader", { name: "Income" }).closest("tr")).toHaveTextContent("€ 33.34");
    expect(screen.getByRole("rowheader", { name: "Expenses" }).closest("tr")).toHaveTextContent("€ 20.47");
    expect(screen.getAllByText("€ 12.87")).toHaveLength(2);
    expect(screen.getByText("€ 10.23")).toBeInTheDocument();
    expect(screen.getByText("€ 10.24")).toBeInTheDocument();
});

test("shows the configured expense maximum from backend validation and allows a corrected submission", async () => {
    addRepairExpense.mockRejectedValueOnce({ isValidationError: true,
        validationErrors: { value: [{ code: "notMoreThanMaxValue", args: { value: 100 } }] },
    });
    open("/repair/condominiums/1/repairs/5");
    fireEvent.click(await screen.findByRole("button", { name: "Add expense" }));
    const modal = within(await screen.findByRole("dialog"));
    const value = modal.getByLabelText(/Value/);
    expect(value).not.toHaveAttribute("max");
    fireEvent.change(modal.getByLabelText(/^name$/i), { target: { value: "Materials" } });
    fireEvent.change(modal.getByLabelText("Document number"), { target: { value: "INV-2" } });
    fireEvent.change(value, { target: { value: "100.01" } });
    fireEvent.click(modal.getByRole("button", { name: "Add" }));
    expect(await modal.findByText("Must not exceed 100")).toBeInTheDocument();
    expect(value).toHaveValue(100.01);
    expect(getRepairDetails).toHaveBeenCalledTimes(1);
    fireEvent.change(value, { target: { value: "100" } });
    expect(modal.queryByText("Must not exceed 100")).not.toBeInTheDocument();
    fireEvent.click(modal.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(addRepairExpense).toHaveBeenLastCalledWith(expect.objectContaining({ value: "100" }));
    expect(getRepairDetails).toHaveBeenCalledTimes(2);
});

test.each([
    ["unpaid installments", details],
    ["no installments", { ...details, payments: [] }],
    ["an already completed repair", { ...details, repair: { ...repair, completed: true },
        payments: details.payments.map((payment) => ({ ...payment, paidDate: "2026-01-04" })) }],
])("hides completion for %s", async (_, result) => {
    getRepairDetails.mockResolvedValueOnce(result);
    open("/repair/condominiums/1/repairs/5");
    await screen.findByRole("region", { name: "homes" });
    expect(screen.queryByRole("button", { name: "Complete repair" })).not.toBeInTheDocument();
    if (result.repair.completed) {
        expect(screen.queryByRole("button", { name: "Add expense" })).not.toBeInTheDocument();
    }
});

test("completes a fully paid repair, prevents duplicate clicks, and refreshes the status", async () => {
    const paidDetails = { ...details, payments: details.payments.map((payment) => ({ ...payment, paidDate: "2026-01-04" })) };
    getRepairDetails.mockResolvedValueOnce(paidDetails);
    let finish;
    completeRepair.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    open("/repair/condominiums/1/repairs/5");
    const button = await screen.findByRole("button", { name: "Complete repair" });
    expect(within(screen.getByRole("region", { name: "homes" })).getByRole("button", { name: "Complete repair" })).toBe(button);
    fireEvent.click(button);
    const modal = within(await screen.findByRole("dialog"));
    expect(modal.getByText("After completing this repair, you will no longer be able to add expenses.")).toBeInTheDocument();
    expect(completeRepair).not.toHaveBeenCalled();
    const confirm = modal.getByRole("button", { name: "Complete repair" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(confirm).toBeDisabled();
    expect(modal.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(completeRepair).toHaveBeenCalledTimes(1);
    expect(completeRepair).toHaveBeenCalledWith({ condominiumId: 1, repairId: 5 });
    getRepairDetails.mockResolvedValueOnce({ ...paidDetails, repair: { ...repair, completed: true } });
    await act(async () => finish());
    expect(await screen.findByText("Completed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Complete repair" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add expense" })).not.toBeInTheDocument();
});

test("cancelling completion leaves the repair open for expenses", async () => {
    getRepairDetails.mockResolvedValueOnce({ ...details,
        payments: details.payments.map((payment) => ({ ...payment, paidDate: "2026-01-04" })) });
    open("/repair/condominiums/1/repairs/5");
    fireEvent.click(await screen.findByRole("button", { name: "Complete repair" }));
    fireEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(completeRepair).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
    expect(within(await screen.findByRole("dialog")).getByLabelText(/Value/)).toBeInTheDocument();
});

test("refreshes a stale expense form when the repair was completed elsewhere", async () => {
    addRepairExpense.mockRejectedValueOnce({ response: { status: 409, data: { message: "repairCompletedExpensesLocked" } } });
    open("/repair/condominiums/1/repairs/5");
    fireEvent.click(await screen.findByRole("button", { name: "Add expense" }));
    const modal = within(await screen.findByRole("dialog"));
    fireEvent.change(modal.getByLabelText(/^name$/i), { target: { value: "Materials" } });
    fireEvent.change(modal.getByLabelText("Document number"), { target: { value: "INV-2" } });
    fireEvent.change(modal.getByLabelText(/Value/), { target: { value: "25" } });
    getRepairDetails.mockResolvedValueOnce({ ...details, repair: { ...repair, completed: true } });
    fireEvent.click(modal.getByRole("button", { name: "Add" }));
    expect(await screen.findByText("Completed")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add expense" })).not.toBeInTheDocument();
});

test("keeps completion errors visible and allows retry without changing the repair status", async () => {
    getRepairDetails.mockResolvedValueOnce({ ...details,
        payments: details.payments.map((payment) => ({ ...payment, paidDate: "2026-01-04" })) });
    completeRepair.mockRejectedValueOnce({ response: { status: 409, data: { message: "repairNotFullyPaid" } } });
    open("/repair/condominiums/1/repairs/5");
    fireEvent.click(await screen.findByRole("button", { name: "Complete repair" }));
    const modal = within(await screen.findByRole("dialog"));
    fireEvent.click(modal.getByRole("button", { name: "Complete repair" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("All installments must be paid before completing the repair.");
    expect(modal.getByRole("button", { name: "Complete repair" })).toBeEnabled();
    expect(getRepairDetails).toHaveBeenCalledTimes(1);
});

test("failed requests show an error and support retry instead of empty financial totals", async () => {
    getRepairDetails.mockRejectedValueOnce(new Error("Network error"));
    open("/repair/condominiums/1/repairs/5");
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("€ 0.00")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("button", { name: "Add expense" })).toBeInTheDocument();
});

test("repair cards show collection progress while their colors follow completion status", async () => {
    getCondominium.mockResolvedValueOnce({ ...condo, repairs: [
        { ...repair, name: "Partly funded", budget: 1000, totalPaid: 250, completed: false },
        { ...repair, id: 6, name: "Fully funded", budget: 1000, totalPaid: 1000, completed: false },
        { ...repair, id: 7, name: "Finished work", budget: 1000, totalPaid: 1000, completed: true },
    ] });
    open("/repair/condominiums/1");
    const partlyFunded = await screen.findByRole("link", { name: /Partly funded/ });
    expect(partlyFunded).toHaveClass("repair-selection-card--pending");
    expect(within(partlyFunded).getByRole("progressbar", { name: "Budget collected for Partly funded" })).toHaveAttribute("aria-valuenow", "25");
    expect(within(partlyFunded).getByText("€ 750.00 left to collect")).toBeInTheDocument();

    const fullyFunded = screen.getByRole("link", { name: /Fully funded/ });
    expect(fullyFunded).toHaveClass("repair-selection-card--pending");
    expect(within(fullyFunded).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(within(fullyFunded).getByText("Full budget collected")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Finished work/ })).toHaveClass("repair-selection-card--completed");
});

test("collection progress handles missing budgets, overpayments, and nearly funded repairs", async () => {
    getCondominium.mockResolvedValueOnce({ ...condo, repairs: [
        { ...repair, name: "No budget", budget: null, totalPaid: null },
        { ...repair, id: 6, name: "Overpaid", budget: 100, totalPaid: 110 },
        { ...repair, id: 7, name: "Nearly funded", budget: 100, totalPaid: 99.99 },
    ] });
    open("/repair/condominiums/1");
    const empty = await screen.findByRole("link", { name: /No budget/ });
    expect(within(empty).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(within(empty).getByText("No budget set")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Budget collected for Overpaid" })).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByRole("progressbar", { name: "Budget collected for Nearly funded" })).toHaveAttribute("aria-valuenow", "99");
});

test("shows each home's paid/total and changes the red payment control to green after payment", async () => {
    open("/repair/condominiums/1/repairs/5");
    const pay = await screen.findByRole("button", { name: "Pay installment for floor 1 • apt 1" });
    expect(pay).toHaveClass("btn-danger");
    expect(screen.getByRole("columnheader", { name: "Paid / total" })).toBeInTheDocument();
    const cells = within(pay.closest("tr")).getAllByRole("cell");
    expect(cells.slice(3, 5).map((cell) => cell.textContent)).toEqual(["€ 33.34", "€ 33.34 / 66.67"]);
    expect(within(pay.closest("tr")).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    fireEvent.click(pay);
    const modal = within(await screen.findByRole("dialog"));
    expect(modal.getAllByRole("option")).toHaveLength(1);
    expect(modal.getByRole("combobox")).toHaveValue("2");
    fireEvent.change(modal.getByLabelText("Payment date"), { target: { value: "2026-01-04" } });
    getRepairDetails.mockResolvedValueOnce({ ...details,
        repair: { ...repair, totalPaid: "66.67", balance: "56.67" },
        payments: details.payments.map((payment) => payment.id === 2 ? { ...payment, paidDate: "2026-01-04" } : payment),
    });
    fireEvent.click(modal.getByRole("button", { name: "Pay", exact: true }));
    await waitFor(() => expect(payRepairInstallment).toHaveBeenCalledWith({ condominiumId: 1, repairId: 5, paymentId: 2, paidDate: "2026-01-04" }));
    expect(await screen.findByText("Paid in full")).toBeInTheDocument();
    const refreshed = screen.getByRole("button", { name: "View paid installments for floor 1 • apt 1" });
    expect(refreshed).toHaveTextContent("2 / 2");
    expect(within(refreshed.closest("tr")).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(within(refreshed.closest("tr")).getAllByRole("cell")[4]).toHaveTextContent("€ 66.67 / 66.67");
    const fullyPaid = screen.getByRole("button", { name: "Paid in full" });
    expect(fullyPaid).toHaveClass("btn-success");
    expect(fullyPaid).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Pay installment for floor 1 • apt 1" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay installment for floor 2 • apt 2" })).toHaveClass("btn-danger");
});

test("payment date errors stay inline and rejected payments do not change the paid count", async () => {
    open("/repair/condominiums/1/repairs/5");
    fireEvent.click(await screen.findByRole("button", { name: "Pay installment for floor 1 • apt 1" }));
    const modal = within(await screen.findByRole("dialog"));
    for (const value of ["", "9999-01-01"]) {
        fireEvent.change(modal.getByLabelText("Payment date"), { target: { value } });
        fireEvent.click(modal.getByRole("button", { name: "Pay", exact: true }));
        expect(modal.getByText("Choose a payment date that is today or earlier.")).toBeInTheDocument();
    }
    expect(payRepairInstallment).not.toHaveBeenCalled();
    fireEvent.change(modal.getByLabelText("Payment date"), { target: { value: "2026-01-04" } });
    payRepairInstallment.mockRejectedValueOnce({ response: { data: { message: "repairPaymentAlreadyPaid" } } });
    fireEvent.click(modal.getByRole("button", { name: "Pay", exact: true }));
    expect(await modal.findByRole("alert")).toHaveTextContent("This installment has already been paid.");
    expect(modal.getByRole("button", { name: "Refresh payments" })).toBeInTheDocument();
    expect(getRepairDetails).toHaveBeenCalledTimes(1);
});

test("can choose another unpaid installment and prevents duplicate submissions while saving", async () => {
    getRepairDetails.mockResolvedValueOnce({ ...details, payments: [...details.payments,
        { id: 4, homeId: 10, installmentNumber: 3, value: "33.33", paidDate: null },
    ] });
    let finishPayment;
    payRepairInstallment.mockImplementationOnce(() => new Promise((resolve) => { finishPayment = resolve; }));
    open("/repair/condominiums/1/repairs/5");
    fireEvent.click(await screen.findByRole("button", { name: "Pay installment for floor 1 • apt 1" }));
    const modal = within(await screen.findByRole("dialog"));
    expect(modal.getAllByRole("option").map((option) => option.value)).toEqual(["2", "4"]);
    fireEvent.change(modal.getByRole("combobox"), { target: { value: "4" } });
    const submit = modal.getByRole("button", { name: "Pay", exact: true });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(submit).toBeDisabled();
    expect(payRepairInstallment).toHaveBeenCalledTimes(1);
    expect(payRepairInstallment).toHaveBeenCalledWith(expect.objectContaining({ paymentId: 4 }));
    await act(async () => finishPayment({ id: 4 }));
});
