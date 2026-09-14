import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Finance from "./Finance";
import { getFinanceOverview } from "../../api/services/financeService";
jest.mock("../../api/services/financeService", () => ({ getFinanceOverview: jest.fn() }));
jest.mock("../../user/UserContext", () => ({ useUser: () => ({ user: { id: 1, condominiums: [{ id: 1, name: "First" }, { id: 2, name: "Second" }] } }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: key => {
  const dictionary = require("../../locales/en/dashboard.json").financeOverview;
  return dictionary[key.split(".").pop()] || key;
} }) }));
const data = { name: "First", startDate: "2026-01-01", cash: 140, fundBalance: 40, repairBalance: -20, total: 160,
  funds: [{ id: 1, name: "Roof", income: 50, expenses: 10, balance: 40, archived: false }], repairs: [], months: [],
  movements: [{ id: 1, type: "fee", name: "Cleaning", value: 20, date: "2026-09-01" },
    { id: 1, type: "expense", name: "Materials", value: 5, date: "2026-09-02", documentNumber: "INV-1", documentDate: "2026-09-01" }] };
const open = () => render(<MemoryRouter><Finance /></MemoryRouter>);
beforeEach(() => { jest.clearAllMocks(); getFinanceOverview.mockResolvedValue(data); });
test("shows separate balances, account links and filters recent movements without changing totals", async () => {
  open(); await screen.findByText("€ 160.00");
  expect(screen.getByText("€ -20.00")).toHaveClass("finance-negative");
  expect(screen.getByRole("link", { name: "Roof" })).toHaveAttribute("href", "/fund/condominiums/1/funds/1");
  fireEvent.change(screen.getByRole("combobox", { name: "Movement type" }), { target: { value: "expense" } });
  expect(screen.queryByText("Cleaning")).not.toBeInTheDocument();
  expect(screen.getByText("Materials")).toBeInTheDocument();
  expect(screen.getByText("€ 160.00")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "missing" } });
  expect(screen.getByText("No matching movements.")).toBeInTheDocument();
});
test("ignores a stale response after switching buildings", async () => {
  let resolveFirst;
  getFinanceOverview.mockImplementation(id => id === "1" ? new Promise(resolve => { resolveFirst = resolve; }) : Promise.resolve({ ...data, name: "Second", total: 222 }));
  open();
  fireEvent.change(screen.getByRole("combobox", { name: "Building" }), { target: { value: "2" } });
  await screen.findByText("€ 222.00");
  await act(async () => resolveFirst(data));
  expect(screen.queryByText("€ 160.00")).not.toBeInTheDocument();
  expect(screen.getByText("€ 222.00")).toBeInTheDocument();
});
test("shows a retry after failed loading", async () => {
  getFinanceOverview.mockRejectedValueOnce(new Error("offline"));
  open(); await screen.findByRole("alert");
  fireEvent.click(screen.getAllByRole("button", { name: "Refresh" })[0]);
  await waitFor(() => expect(screen.getByText("€ 160.00")).toBeInTheDocument());
});
