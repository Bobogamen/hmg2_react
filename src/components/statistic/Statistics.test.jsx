import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Statistics from "./Statistics";
import { getStatistics } from "../../api/services/statisticsService";
import { useUser } from "../../user/UserContext";
jest.mock("../../api/services/statisticsService", () => ({ getStatistics: jest.fn() }));
jest.mock("../../user/UserContext", () => ({ useUser: jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: key => {
  return require("../../locales/en/dashboard.json").statisticsPage[key.split(".").pop()] || key;
} }) }));

const data = {
  condominiumId: 1, name: "First building", address: "Address", asOf: "2026-09-23", year: 2026, years: [2026, 2025],
  summary: { income: 250, expenses: 300, forFunds: 50, difference: -100, opening: 200, closing: 100, monthCount: 1, completedMonths: 0 },
  months: [{ id: 9, number: 9, completed: false, income: 250, expenses: 300, forFunds: 50, difference: -100, balance: 100 }],
  annual: {
    homes: [{ id: 1, name: "Apartment 1", floor: "2", fees: 40, repairs: 60, total: 100 }],
    fees: [{ id: 1, name: "Cleaning fee", detail: "", count: 2, income: 40, expenses: 0, difference: 40 }],
    bills: [{ id: 1, name: "Electricity", count: 1, income: 0, expenses: 30, difference: -30 }],
    repairs: [{ id: 1, name: "Lift", count: 2, income: 60, expenses: 80, difference: -20, archived: true }],
    funds: [{ id: 1, name: "Reserve", count: 1, income: 40, expenses: 0, difference: 40 }],
    expenses: [
      { id: 1, source: "cashExpense", name: "Cleaning", account: "", period: "2026-09-01", date: "2026-09-02", documentNumber: "CASH-1", amount: 12 },
      { id: 1, source: "repairExpense", name: "Parts", account: "Lift", period: "2026-09-03", date: "2026-09-03", documentNumber: "INV-2", amount: 80 },
    ],
  },
};
const open = (path = "/statistics") => render(<MemoryRouter initialEntries={[path]}><Statistics /></MemoryRouter>);
beforeEach(() => {
  jest.clearAllMocks();
  useUser.mockReturnValue({ user: { id: 7, condominiums: [{ id: 1, name: "First" }, { id: 2, name: "Second" }] } });
  getStatistics.mockResolvedValue(data);
});

test("shows summary and monthly values, then requests the selected year", async () => {
  open();
  await screen.findByText("First building");
  const table = screen.getByRole("table");
  expect(within(table).getByText("September")).toBeInTheDocument();
  expect(within(table).getByText("Open")).toBeInTheDocument();
  expect(screen.getAllByText(/100\.00/).some(el => el.classList.contains("statistics-negative"))).toBe(true);
  expect(getStatistics).toHaveBeenCalledWith("1", "");
  getStatistics.mockResolvedValueOnce({ ...data, year: 2025 });
  fireEvent.change(screen.getByRole("combobox", { name: "Year" }), { target: { value: "2025" } });
  await screen.findByText("First building");
  expect(getStatistics).toHaveBeenLastCalledWith("1", "2025");
  expect(screen.getByRole("combobox", { name: "Year" })).toHaveValue("2025");
});

test("ignores stale responses and resets the year on building change", async () => {
  let resolveFirst;
  getStatistics.mockImplementation(id => id === "1" ? new Promise(resolve => { resolveFirst = resolve; })
    : Promise.resolve({ ...data, condominiumId: 2, name: "Second building" }));
  open("/statistics?condominium=1&year=2025");
  fireEvent.change(screen.getByRole("combobox", { name: "Building" }), { target: { value: "2" } });
  await screen.findByText("Second building");
  await act(async () => resolveFirst(data));
  expect(screen.queryByText("First building")).not.toBeInTheDocument();
  expect(getStatistics).toHaveBeenLastCalledWith("2", "");
});

test("offers retry after a failed request", async () => {
  getStatistics.mockRejectedValueOnce(new Error("offline"));
  open(); await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("First building");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("shows an empty period without misleading zero cards", async () => {
  getStatistics.mockResolvedValue({ ...data, months: [] });
  open();
  await screen.findByText("No accounting months for this year up to the current month.");
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

test("does not request data when there are no buildings", () => {
  useUser.mockReturnValue({ user: { id: 7, condominiums: [] } });
  open();
  expect(screen.getAllByText("No accessible buildings.").length).toBeGreaterThan(0);
  expect(getStatistics).not.toHaveBeenCalled();
});

test.each([["homes", "Apartment 1"], ["fees", "Cleaning fee"], ["bills", "Electricity"],
  ["repairs", "Lift"], ["funds", "Reserve"]])("shows annual %s even without accounting months", async (section, name) => {
  getStatistics.mockResolvedValue({ ...data, months: [] });
  open(); await screen.findByText("First building");
  fireEvent.click(screen.getByRole("button", { name: `By ${section}` }));
  expect(within(screen.getByRole("table")).getByText(name)).toBeInTheDocument();
  if (section === "repairs") expect(screen.getByText("Archived")).toBeInTheDocument();
});

test("searches expenses by document and account, updates totals and clears search on year change", async () => {
  open(); await screen.findByText("First building");
  fireEvent.click(screen.getByRole("button", { name: "By expenses" }));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "inv-2" } });
  expect(screen.queryByText("Cleaning")).not.toBeInTheDocument();
  expect(screen.getByText("Parts")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("1 / 2");
  expect(screen.getByRole("status")).toHaveTextContent("80.00");
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "LIFT" } });
  expect(screen.getByText("Parts")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "missing" } });
  expect(screen.getByText("No expenses match your search.")).toBeInTheDocument();
  getStatistics.mockResolvedValueOnce({ ...data, year: 2025 });
  fireEvent.change(screen.getByRole("combobox", { name: "Year" }), { target: { value: "2025" } });
  await screen.findByText("First building");
  expect(screen.getByRole("searchbox")).toHaveValue("");
  expect(screen.getByText("Cleaning")).toBeInTheDocument();
});
