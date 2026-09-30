import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";
import { useUser } from "../../user/UserContext";
import { getCondominium } from "../../api/services/managementService";

jest.mock("../../user/UserContext", () => ({ useUser: jest.fn() }));
jest.mock("../../api/services/managementService", () => ({ getCondominium: jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: key => key, i18n: { language: "en" } }) }));
const building = { id: 7, name: "Building A", city: "Sofia", address: "Street 1", startDate: "2026-01-01" };
const user = { name: "Manager", email: "user@example.com", roles: ["MANAGER"], condominiums: [building], condominiumLimit: 5 };
const details = { ...building, homes: [{}, {}], fees: [{}], bills: [], funds: [{}], repairs: [] };
const open = () => render(<MemoryRouter><Profile /></MemoryRouter>);
beforeEach(() => {
  jest.resetAllMocks();
  useUser.mockReturnValue({ user });
  getCondominium.mockResolvedValue(details);
});

test("loads actual counts without building navigation buttons", async () => {
  open();
  const homes = await screen.findByText("profile:counts.homes");
  expect(within(homes.parentElement).getByText("2")).toBeInTheDocument();
  expect(getCondominium).toHaveBeenCalledWith(7);
  expect(screen.queryByRole("link", { name: "profile:openManagement" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "profile:openCashier" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "profile:print" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "edit" })).toHaveAttribute("href", "/profile/edit");
});

test("failed data can be retried without showing false zero counts", async () => {
  getCondominium.mockRejectedValueOnce(new Error("offline"));
  open();
  await screen.findByRole("alert");
  expect(screen.queryByText("profile:counts.homes")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "profile:retry" }));
  await screen.findByText("profile:counts.homes");
});

test("cashiers do not receive management links", async () => {
  useUser.mockReturnValue({ user: { ...user, roles: ["CASHIER"] } });
  open();
  await screen.findByText("profile:counts.homes");
  expect(screen.queryByRole("link", { name: "profile:openManagement" })).not.toBeInTheDocument();
});

test("handles an empty profile without making requests", () => {
  useUser.mockReturnValue({ user: { ...user, condominiums: [] } });
  open();
  expect(screen.getByText("condo:noneAddedCondo")).toBeInTheDocument();
  expect(getCondominium).not.toHaveBeenCalled();
});
