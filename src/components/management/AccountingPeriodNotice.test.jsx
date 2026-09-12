import React from "react";
import { fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import AccountingPeriodNotice from "./AccountingPeriodNotice";
import { getAccountingPeriod, generateAccountingMonths } from "../../api/services/managementService";

jest.mock("../../api/services/managementService", () => ({ getAccountingPeriod: jest.fn(), generateAccountingMonths: jest.fn() }));
jest.mock("../../loader/LoadingContext", () => {
  const setIsLoading = jest.fn();
  return { useLoading: () => ({ setIsLoading }) };
});
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key, values) => values ? `${key} ${JSON.stringify(values)}` : key }) }));
const missing = { startMonth: "2026-01", endMonth: "2026-12", missingMonths: ["2026-01", "2026-02"], createdMonths: 0 };
beforeEach(() => jest.resetAllMocks());

test("shows missing period and creates it only after the manager clicks", async () => {
  getAccountingPeriod.mockResolvedValue(missing);
  let complete;
  generateAccountingMonths.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
  render(<AccountingPeriodNotice condominiumId="1" />);
  const button = await screen.findByRole("button", { name: "accountingPeriod.generate" });
  expect(screen.getByRole("status")).toHaveTextContent("01.2026");
  expect(screen.getByRole("status")).toHaveTextContent("12.2026");
  expect(generateAccountingMonths).not.toHaveBeenCalled();
  fireEvent.click(button);
  fireEvent.click(button);
  expect(generateAccountingMonths).toHaveBeenCalledTimes(1);
  expect(generateAccountingMonths).toHaveBeenCalledWith("1");
  await act(async () => complete({ ...missing, missingMonths: [], createdMonths: 2 }));
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("accountingPeriod.created");
});

test("checks again on returning to the page and offers the new year", async () => {
  getAccountingPeriod.mockResolvedValueOnce({ ...missing, missingMonths: [] })
    .mockResolvedValue({ ...missing, endMonth: "2027-12", missingMonths: ["2027-01"] });
  render(<AccountingPeriodNotice condominiumId="1" />);
  await waitFor(() => expect(getAccountingPeriod).toHaveBeenCalledTimes(1));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  fireEvent(window, new Event("focus"));
  await screen.findByRole("button", { name: "accountingPeriod.generate" });
  expect(screen.getByRole("status")).toHaveTextContent("01.2027");
  expect(screen.getByRole("status")).toHaveTextContent("12.2027");
});

test("retains the create action after a failed request", async () => {
  getAccountingPeriod.mockResolvedValue(missing);
  generateAccountingMonths.mockRejectedValue(new Error("offline"));
  render(<AccountingPeriodNotice condominiumId="1" />);
  fireEvent.click(await screen.findByRole("button", { name: "accountingPeriod.generate" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("accountingPeriod.error");
  expect(screen.getByRole("button", { name: "accountingPeriod.generate" })).toBeEnabled();
});

test("offers retry when the status could not be loaded", async () => {
  getAccountingPeriod.mockRejectedValueOnce(new Error("offline")).mockResolvedValue(missing);
  render(<AccountingPeriodNotice condominiumId="1" />);
  fireEvent.click(await screen.findByRole("button", { name: "accountingPeriod.retry" }));
  await screen.findByRole("button", { name: "accountingPeriod.generate" });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
