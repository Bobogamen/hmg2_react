import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CashierAccounting from "./CashierAccounting";
import { getCashierMonths, getCashierMonth, payCashierHomeFees, getCashierFinance, getCashierDebtors } from "../../api/services/cashierService";

jest.mock("../../api/services/cashierService", () => ({ getCashierMonths: jest.fn(), getCashierMonth: jest.fn(), payCashierHomeFees: jest.fn(), getCashierFinance: jest.fn(), getCashierDebtors: jest.fn() }));
jest.mock("../../loader/LoadingContext", () => {
  const setIsLoading = jest.fn(); return { useLoading: () => ({ setIsLoading }) };
});
jest.mock("../../user/UserContext", () => ({ useUser: () => ({ user: { roles: ["CASHIER"] } }) }));
jest.mock("../breadcrumb/BreadcrumpContext", () => {
  const setBreadcrumbs = jest.fn(); return { useBreadcrumb: () => ({ setBreadcrumbs }) };
});
jest.mock("../breadcrumb/Breadcrumbs", () => () => null);
jest.mock("react-i18next", () => {
  const t = key => key; return { useTranslation: () => ({ t, i18n: { language: "en" } }) };
});
const month = { id: 9, year: 2026, number: 9, completed: false };
const charges = [{ homeFeeId: 10, feeId: 10, name: "Cleaning", value: 5, times: 2, amount: 10 }, { homeFeeId: 11, feeId: 11, name: "Electricity", value: 3, times: 1, amount: 3 }];
const home = { id: 2, floor: "1", name: "Apartment 2", owner: "Owner Name", activeResidents: 3, total: 13, due: 13, paid: 0, paidDate: null, charges, receipts: [] };
const details = { month, homes: [home] };
const paidHome = { ...home, due: 0, paid: 13, paidDate: "2026-09-12", charges: [], receipts: charges.map((charge, i) => ({ ...charge, id: i + 1, paidDate: "2026-09-12" })) };
const open = () => render(<MemoryRouter initialEntries={["/cashier/condominium/1"]}><Routes><Route path="/cashier/condominium/:condominiumId" element={<CashierAccounting />} /></Routes></MemoryRouter>);
beforeEach(() => {
  jest.clearAllMocks();
  getCashierMonths.mockResolvedValue({ condominiumId: 1, name: "Building One", currentMonth: "2026-09", months: [month, { ...month, id: 10, number: 10 }] });
  getCashierMonth.mockResolvedValue(details);
  getCashierFinance.mockResolvedValue(null);
  getCashierDebtors.mockResolvedValue({ condominiumId: 1, totalDue: 0, homes: 0, debtors: [] });
});

test("shows debtors across accounting months and opens the selected month", async () => {
  getCashierDebtors.mockResolvedValue({ condominiumId: 1, totalDue: 13, homes: 1, debtors: [{
    homeId: 2, name: "Apartment 2", owner: "Owner Name", due: 13,
    months: [{ monthId: 9, year: 2026, number: 9, due: 13, charges: [] }]
  }] });
  open(); await screen.findByText("Apartment 2");
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.debtors" }));
  const debtorsDialog = await screen.findByRole("dialog", { name: "cashierAccounting.debtors" });
  expect(within(debtorsDialog).getByText("Owner Name")).toBeInTheDocument();
  expect(within(debtorsDialog).getAllByText("€ 13.00").length).toBeGreaterThan(0);
  fireEvent.click(within(debtorsDialog).getByRole("button", { name: "cashierAccounting.openMonth" }));
  await waitFor(() => expect(getCashierMonth).toHaveBeenLastCalledWith("1", "9"));
});

test("allows correcting a snapshotted charge before recording payment", async () => {
  const snapshotted = { ...home, charges: [{ ...charges[0], id: 101 }] };
  getCashierMonth.mockResolvedValue({ month, homes: [snapshotted] });
  payCashierHomeFees.mockResolvedValue({ month, homes: [{ ...snapshotted, charges: [], due: 0, paid: 12 }] });
  open(); await screen.findByText("Apartment 2");
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.pay" }));
  const dialog = screen.getByRole("dialog", { name: /cashierAccounting.payTitle/ });
  fireEvent.change(screen.getByRole("spinbutton", { name: "cashierAccounting.value: Cleaning" }), { target: { value: "6" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "cashierAccounting.pay" }));
  await waitFor(() => expect(payCashierHomeFees).toHaveBeenCalledWith("1", 9, 2, "12.00", expect.any(String), [
    { chargeId: 101, value: "6", times: 2 }
  ]));
});

test("cashier can open print documents for the selected month using the print icon", async () => {
  open();
  await screen.findByText("Apartment 2");
  const printLink = screen.getByRole("link", { name: "dashboard:printPage.print" });
  expect(printLink).toHaveAttribute("href", "/print?condominium=1&month=9");
  expect(printLink.querySelector("svg")).toBeInTheDocument();
  expect(printLink).toHaveTextContent("");
});

test("shows the active residents count for each home", async () => {
  open();
  const row = (await screen.findByText("Apartment 2")).closest("tr");
  expect(within(row).getAllByRole("cell")[3]).toHaveTextContent("3");
});

test("uses the primary fee multiplier when an older response has no residents field", async () => {
  getCashierMonth.mockResolvedValue({
    month,
    homes: [{ ...home, activeResidents: undefined, charges: [{ ...charges[0], primary: true, times: 4 }] }],
  });
  open();
  const row = (await screen.findByText("Apartment 2")).closest("tr");
  expect(within(row).getAllByRole("cell")[3]).toHaveTextContent("4");
});

test("opens current month and pays all fees once after reviewing the modal", async () => {
  let complete;
  payCashierHomeFees.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
  open();
  fireEvent.click(await screen.findByRole("button", { name: "cashierAccounting.pay" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("Cleaning")).toBeInTheDocument();
  expect(within(dialog).getByText("Electricity")).toBeInTheDocument();
  expect(within(dialog).queryByRole("checkbox")).not.toBeInTheDocument();
  expect(payCashierHomeFees).not.toHaveBeenCalled();
  const confirm = within(dialog).getByRole("button", { name: "cashierAccounting.pay" });
  fireEvent.change(within(dialog).getByLabelText("cashierAccounting.paidDate"), { target: { value: "2026-09-12" } });
  fireEvent.click(confirm); fireEvent.click(confirm);
  expect(payCashierHomeFees).toHaveBeenCalledTimes(1);
  expect(payCashierHomeFees).toHaveBeenCalledWith("1", 9, 2, "13.00", "2026-09-12");
  await act(async () => complete({ month, homes: [paidHome] }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.queryByRole("button", { name: "cashierAccounting.pay" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "12-Sep-2026" }));
  expect(within(screen.getByRole("dialog")).getByText("Cleaning")).toBeInTheDocument();
  expect(within(screen.getByRole("dialog")).queryByText("12-Sep-2026")).not.toBeInTheDocument();
  expect(within(screen.getByRole("dialog")).queryByText("cashierAccounting.paidDate")).not.toBeInTheDocument();
  expect(within(screen.getByRole("dialog")).queryByRole("button", { name: "cashierAccounting.pay" })).not.toBeInTheDocument();
});

test("requires a payment date before submitting", async () => {
  open();
  fireEvent.click(await screen.findByRole("button", { name: "cashierAccounting.pay" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("cashierAccounting.paidDate"), { target: { value: "" } });
  const confirm = within(dialog).getByRole("button", { name: "cashierAccounting.pay" });
  expect(confirm).toBeDisabled();
  fireEvent.click(confirm);
  expect(payCashierHomeFees).not.toHaveBeenCalled();
});

test("searches by the recorded payment date", async () => {
  getCashierMonth.mockResolvedValue({ month, homes: [home, { ...paidHome, id: 3, name: "Apartment 3" }] });
  open();
  await screen.findByText("Apartment 3");
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "2026-09-12" } });
  expect(screen.getByText("Apartment 3")).toBeInTheDocument();
  expect(screen.queryByText("Apartment 2")).not.toBeInTheDocument();
});

test("switches accounting month", async () => {
  open(); await screen.findByText("Apartment 2");
  expect(getCashierMonth).toHaveBeenCalledWith("1", "9");
  fireEvent.change(screen.getByLabelText("cashierAccounting.month"), { target: { value: "10" } });
  await waitFor(() => expect(getCashierMonth).toHaveBeenCalledWith("1", "10"));
});

test("closed month shows paid receipt and still allows recorded debts to be paid", async () => {
  getCashierMonth.mockResolvedValue({ month: { ...month, completed: true }, homes: [home, { ...paidHome, id: 3, name: "Apartment 3" }] });
  open();
  expect(await screen.findByRole("button", { name: "cashierAccounting.pay" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "12-Sep-2026" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("stale payment requires refresh instead of another submission", async () => {
  payCashierHomeFees.mockRejectedValue({ response: { data: { message: "homeFeesChanged" }, status: 409 } });
  open(); fireEvent.click(await screen.findByRole("button", { name: "cashierAccounting.pay" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "cashierAccounting.pay" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("cashierAccounting.homeFeesChanged");
  expect(within(screen.getByRole("dialog")).getByRole("button", { name: "cashierAccounting.pay" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.refresh" }));
  await waitFor(() => expect(getCashierMonth).toHaveBeenCalledTimes(2));
});

test("does not offer payment for homes with no fees", async () => {
  getCashierMonth.mockResolvedValue({ month, homes: [{ ...home, charges: [], total: 0, due: 0 }] });
  open(); await screen.findByText("cashierAccounting.noFees");
  expect(screen.queryByRole("button", { name: "cashierAccounting.pay" })).not.toBeInTheDocument();
});

test("filters homes by payment and owner and restores the full list", async () => {
  getCashierMonth.mockResolvedValue({ month, homes: [home, { ...paidHome, id: 3, name: "Apartment 3", owner: "Other Owner" }] });
  open(); await screen.findByText("Apartment 2");
  const footer = screen.getByText("Apartment 2").closest("table").querySelector("tfoot");
  expect(footer).toHaveTextContent("26.00");
  expect(within(footer).getByText("6")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.unpaidHomes" }));
  expect(footer).toHaveTextContent("13.00");
  expect(within(footer).getByText("3")).toBeInTheDocument();
  expect(screen.getByText("Apartment 2")).toBeInTheDocument();
  expect(screen.queryByText("Apartment 3")).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Other Owner" } });
  expect(screen.getByText("cashierAccounting.noResults")).toBeInTheDocument();
  expect(footer).toHaveTextContent("0.00");
  expect(within(footer).getByText("0")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.clearFilters" }));
  expect(footer).toHaveTextContent("26.00");
  expect(screen.getByText("Apartment 2")).toBeInTheDocument();
  expect(screen.getByText("Apartment 3")).toBeInTheDocument();
});

test("compact collection summary keeps the full-month totals without an unpaid shortcut", async () => {
  getCashierMonth.mockResolvedValue({ month, homes: [home, { ...paidHome, id: 3, name: "Apartment 3" }] });
  open();
  await screen.findByText("Apartment 2");
  const summary = within(screen.getByRole("region", { name: "cashierAccounting.collection" }));
  expect(summary.getByText("€ 26.00")).toBeInTheDocument();
  expect(summary.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  expect(summary.queryByText("cashierAccounting.paymentHint")).not.toBeInTheDocument();
  expect(summary.queryByRole("button", { name: /cashierAccounting.showUnpaid/ })).not.toBeInTheDocument();
});

test("month arrows and the current month shortcut load the requested period", async () => {
  open();
  await screen.findByText("Apartment 2");
  expect(screen.getByRole("button", { name: "cashierAccounting.previousMonth" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.nextMonth" }));
  await waitFor(() => expect(getCashierMonth).toHaveBeenLastCalledWith("1", "10"));
  expect(screen.getByRole("button", { name: "cashierAccounting.nextMonth" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.currentMonth" }));
  await waitFor(() => expect(getCashierMonth).toHaveBeenLastCalledWith("1", "9"));
});

test("partial payment remains actionable and clearly shows the remaining amount", async () => {
  getCashierMonth.mockResolvedValue({ month, homes: [{ ...home, paid: 5, due: 8, paidDate: "2026-09-12" }] });
  open();
  const row = (await screen.findByText("Apartment 2")).closest("tr");
  expect(within(row).getAllByRole("cell")).toHaveLength(6);
  expect(within(row).queryByRole("button", { name: "12-Sep-2026" })).not.toBeInTheDocument();
  expect(within(row).getByText(/cashierAccounting.due: € 8\.00/)).toBeInTheDocument();
  expect(within(row).getByRole("button", { name: "cashierAccounting.pay" })).toBeEnabled();
});

test.each(["pay", "receipt"])("%s modal groups fees and shows matching icons and fund names", async (mode) => {
  const entries = [
    { id: 1, homeFeeId: 1, name: "Reserve contribution", fund: true, primary: true, monthly: true, fundName: "Roof reserve" },
    { id: 2, homeFeeId: 2, name: "One-off cleaning", fund: false, primary: false, monthly: false },
    { id: 3, homeFeeId: 3, name: "Monthly electricity", fund: false, primary: false, monthly: true },
    { id: 4, homeFeeId: 4, name: "Basic fee", fund: false, primary: true, monthly: true },
  ].map(item => ({ ...item, value: 1, times: 1, amount: 1, paidDate: "2026-09-12" }));
  getCashierMonth.mockResolvedValue({ month, homes: [mode === "pay"
    ? { ...home, charges: entries }
    : { ...paidHome, receipts: entries }] });
  open();
  fireEvent.click(await screen.findByRole("button", { name: mode === "pay" ? "cashierAccounting.pay" : "12-Sep-2026" }));
  const dialog = within(screen.getByRole("dialog"));
  const rows = dialog.getAllByRole("row").slice(1, -1);
  expect(rows.map(row => within(row).getAllByRole("cell")[0].textContent)).toEqual([
    "⭐Basic fee", "📅Monthly electricity", "💶One-off cleaning", '💰Reserve contributionfinance:fund "Roof reserve"',
  ]);
  expect(entries[0].name).toBe("Reserve contribution");
});
