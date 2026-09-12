import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CashierAccounting from "./CashierAccounting";
import { getCashierMonths, getCashierMonth, payCashierHomeFees } from "../../api/services/cashierService";

jest.mock("../../api/services/cashierService", () => ({ getCashierMonths: jest.fn(), getCashierMonth: jest.fn(), payCashierHomeFees: jest.fn() }));
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
const home = { id: 2, floor: "1", name: "Apartment 2", owner: "Owner Name", total: 13, due: 13, paid: 0, paidDate: null, charges, receipts: [] };
const details = { month, homes: [home] };
const paidHome = { ...home, due: 0, paid: 13, paidDate: "2026-09-12", charges: [], receipts: charges.map((charge, i) => ({ ...charge, id: i + 1, paidDate: "2026-09-12" })) };
const open = () => render(<MemoryRouter initialEntries={["/cashier/condominium/1"]}><Routes><Route path="/cashier/condominium/:condominiumId" element={<CashierAccounting />} /></Routes></MemoryRouter>);
beforeEach(() => {
  jest.clearAllMocks();
  getCashierMonths.mockResolvedValue({ condominiumId: 1, name: "Building One", currentMonth: "2026-09", months: [month, { ...month, id: 10, number: 10 }] });
  getCashierMonth.mockResolvedValue(details);
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
  const confirm = within(dialog).getByRole("button", { name: /cashierAccounting.payAll/ });
  fireEvent.click(confirm); fireEvent.click(confirm);
  expect(payCashierHomeFees).toHaveBeenCalledTimes(1);
  expect(payCashierHomeFees).toHaveBeenCalledWith("1", 9, 2, "13.00");
  await act(async () => complete({ month, homes: [paidHome] }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.queryByRole("button", { name: "cashierAccounting.pay" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "9/12/2026" }));
  expect(within(screen.getByRole("dialog")).getByText("Cleaning")).toBeInTheDocument();
  expect(within(screen.getByRole("dialog")).queryByRole("button", { name: /cashierAccounting.payAll/ })).not.toBeInTheDocument();
});

test("switches accounting month", async () => {
  open(); await screen.findByText("Apartment 2");
  expect(getCashierMonth).toHaveBeenCalledWith("1", "9");
  fireEvent.change(screen.getByLabelText("cashierAccounting.month"), { target: { value: "10" } });
  await waitFor(() => expect(getCashierMonth).toHaveBeenCalledWith("1", "10"));
});

test("closed month shows paid receipt but prevents payment", async () => {
  getCashierMonth.mockResolvedValue({ month: { ...month, completed: true }, homes: [home, { ...paidHome, id: 3, name: "Apartment 3" }] });
  open();
  expect(await screen.findByRole("button", { name: "cashierAccounting.pay" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "9/12/2026" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("stale payment requires refresh instead of another submission", async () => {
  payCashierHomeFees.mockRejectedValue({ response: { data: { message: "homeFeesChanged" }, status: 409 } });
  open(); fireEvent.click(await screen.findByRole("button", { name: "cashierAccounting.pay" }));
  fireEvent.click(screen.getByRole("button", { name: /cashierAccounting.payAll/ }));
  expect(await screen.findByRole("alert")).toHaveTextContent("cashierAccounting.homeFeesChanged");
  expect(screen.getByRole("button", { name: /cashierAccounting.payAll/ })).toBeDisabled();
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
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.unpaidHomes" }));
  expect(screen.getByText("Apartment 2")).toBeInTheDocument();
  expect(screen.queryByText("Apartment 3")).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Other Owner" } });
  expect(screen.getByText("cashierAccounting.noResults")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "cashierAccounting.clearFilters" }));
  expect(screen.getByText("Apartment 2")).toBeInTheDocument();
  expect(screen.getByText("Apartment 3")).toBeInTheDocument();
});
