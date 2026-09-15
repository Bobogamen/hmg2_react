import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import CashierFinancePanel from "./CashierFinancePanel";
import { saveCashierFinanceEntry, closeCashierMonth } from "../../api/services/cashierService";
import { randomFillSync } from "crypto";

beforeAll(() => Object.defineProperty(global, "crypto", { configurable: true, value: { getRandomValues: randomFillSync } }));
afterAll(() => { delete global.crypto; });

jest.mock("../../api/services/cashierService", () => ({ saveCashierFinanceEntry: jest.fn(), closeCashierMonth: jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: key => {
  const [namespace, path] = key.split(":");
  const sources = { dashboard: require("../../locales/en/dashboard.json"), common: require("../../locales/en/common.json"), validation: require("../../locales/en/validation.json") };
  return path?.split(".").reduce((value, part) => value?.[part], sources[namespace]) || key;
} }) }));
const finance = {
  summary: { id: 9, condominiumId: 1, year: 2026, number: 9, completed: false,
    currentIncome: "80", forFunds: "10", totalExpenses: "5", totalBills: "12", fromPreviousMonth: "100",
    totalIncome: "180", currentDifference: "153", previousAccountingMonth: { id: 8, year: 2026, number: 8 } },
  expenses: [{ id: 1, name: "Materials", value: "5", documentNumber: "EXP-1", documentDate: "2026-09-01", addedOn: "2026-09-02" }],
  bills: [{ id: 2, name: "Electricity" }, { id: 3, name: "Lift" }],
  billPayments: [{ id: 4, billId: 3, name: "Lift", value: "12", documentNumber: "BILL-1", documentDate: "2026-09-01", paidOn: "2026-09-02" }],
  incomes: [],
};
const setup = (overrides = {}) => {
  const props = { finance, condominiumId: 1, onSaved: jest.fn(), onRefresh: jest.fn(), onMonthSelect: jest.fn(), ...overrides };
  const toolbar = document.createElement("div");
  toolbar.className = "cashier-period-toolbar";
  document.body.appendChild(toolbar);
  render(<CashierFinancePanel {...props} closeActionContainer={toolbar} />);
  return props;
};
const fill = (mode) => {
  const dialog = within(screen.getByRole("dialog"));
  if (mode !== "bill") fireEvent.change(dialog.getByLabelText("Description"), { target: { value: "Rent income" } });
  fireEvent.change(dialog.getByLabelText("Amount (€)"), { target: { value: "15.25" } });
  fireEvent.change(dialog.getByLabelText("Document number"), { target: { value: "INV-9" } });
  fireEvent.change(dialog.getByLabelText("Document date"), { target: { value: "2026-09-01" } });
  return dialog;
};

test("closing requires paid homes and bills and refreshes after confirmation", async () => {
  const result = { ...finance, summary: { ...finance.summary, completed: true } };
  closeCashierMonth.mockResolvedValue(result);
  const props = setup({ homesPaid: true, finance: { ...finance, bills: [{ id: 3, name: "Lift" }] } });
  fireEvent.click(screen.getByRole("button", { name: "Close month" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close month" }));
  await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith(result));
  expect(closeCashierMonth).toHaveBeenCalledWith(1, 9);
  expect(props.onRefresh).toHaveBeenCalled();
});

test.each([[false, []], [true, finance.bills]])("closing is hidden when obligations remain", (homesPaid, bills) => {
  setup({ homesPaid, finance: { ...finance, bills } });
  expect(screen.queryByRole("button", { name: "Close month" })).not.toBeInTheDocument();
});
beforeEach(() => { jest.clearAllMocks(); saveCashierFinanceEntry.mockResolvedValue(finance); });

test("shows the stored accounting balance, scoped history and only unpaid bill actions", () => {
  const props = setup();
  expect(screen.getByText("Total for current month").closest("tr")).toHaveTextContent(/€\s*153\.00/);
  expect(screen.getByText("Monthly difference").closest("tr")).toHaveTextContent(/€\s*53\.00/);
  expect(screen.getByText("Materials")).toBeInTheDocument();
  expect(screen.getByText("EXP-1")).toBeInTheDocument();
  const expenseRow = screen.getByText("Materials").closest("tr");
  const billRow = screen.getByText("Lift").closest("tr");
  expect(expenseRow).toHaveClass("cashier-entry-expense");
  expect(billRow).toHaveClass("cashier-entry-bill");
  expect(within(billRow).getAllByRole("cell")).toHaveLength(4);
  expect(billRow).toHaveTextContent("9/1/2026");
  expect(billRow).not.toHaveTextContent("9/2/2026");
  expect(screen.getByRole("region", { name: "Expenses and Bills" })).toHaveTextContent(/€\s*17\.00/);
  expect(screen.getByText("Lift").tagName).toBe("EM");
  expect(screen.getByRole("button", { name: "Pay bill" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "August 2026" }));
  expect(props.onMonthSelect).toHaveBeenCalledWith("8");
});

test.each([["income", "Add income"], ["expense", "Pay expense"]])("saves %s for the selected month and closes only after success", async (mode, title) => {
  const props = setup();
  fireEvent.click(screen.getByRole("button", { name: title }));
  const dialog = fill(mode);
  fireEvent.click(dialog.getByRole("button", { name: title }));
  await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith(finance));
  expect(saveCashierFinanceEntry).toHaveBeenCalledWith(expect.objectContaining({
    mode, monthId: 9, condominiumId: 1, name: "Rent income", value: "15.25", documentNumber: "INV-9", requestId: expect.any(String),
  }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("bill payment uses the selected unpaid bill and retains the same request after an uncertain response", async () => {
  saveCashierFinanceEntry.mockRejectedValueOnce(new Error("Network error"));
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Pay bill", exact: true }));
  const dialog = fill("bill");
  fireEvent.change(dialog.getByLabelText("Bill"), { target: { value: "2" } });
  expect(dialog.getByLabelText("Bill")).toHaveValue("2");
  expect(dialog.queryByRole("option", { name: "Lift" })).not.toBeInTheDocument();
  fireEvent.click(dialog.getByRole("button", { name: "Pay bill" }));
  await screen.findByText(/The save could not be confirmed/);
  expect(dialog.getByLabelText("Amount (€)")).toBeDisabled();
  fireEvent.click(dialog.getByRole("button", { name: "Retry request" }));
  await waitFor(() => expect(saveCashierFinanceEntry).toHaveBeenCalledTimes(2));
  expect(saveCashierFinanceEntry.mock.calls[1][0]).toEqual(saveCashierFinanceEntry.mock.calls[0][0]);
  expect(saveCashierFinanceEntry.mock.calls[0][0]).toEqual(expect.objectContaining({ billId: 2, mode: "bill" }));
});

test("closed month leaves history readable and hides income and expense actions", () => {
  setup({ finance: { ...finance, summary: { ...finance.summary, completed: true } } });
  for (const name of ["Add income", "Pay expense"]) {
    expect(screen.queryByRole("button", { name, exact: true })).not.toBeInTheDocument();
  }
  expect(screen.getByRole("button", { name: "Pay bill", exact: true })).toBeDisabled();
  expect(screen.getByText("EXP-1")).toBeInTheDocument();
});

test("confirms every bill is paid while retaining expense payment", () => {
  setup({ finance: { ...finance, bills: [{ id: 3, name: "Lift" }] } });
  expect(screen.queryByRole("button", { name: "Pay bill" })).not.toBeInTheDocument();
  expect(screen.getByText("All bills paid")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Pay expense" })).toBeEnabled();
});
