import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cashier from "./Cashier";
import { useUser } from "../../user/UserContext";
import { getCashiers, registerCashier } from "../../api/services/cashierService";
import { BreadcrumbProvider } from "../breadcrumb/BreadcrumpContext";
import { toast } from "react-toastify";

jest.mock("../../user/UserContext", () => ({ useUser: jest.fn() }));
jest.mock("../../api/services/cashierService", () => ({ getCashiers: jest.fn(), registerCashier: jest.fn() }));
jest.mock("react-i18next", () => {
  const t = key => key;
  return { useTranslation: () => ({ t, i18n: { language: "bg" } }) };
});
jest.mock("react-toastify", () => ({ toast: { success: jest.fn() }, Bounce: undefined }));

const building = { id: 7, name: "Building Seven", address: "Street 7" };
const overview = { cashierLimit: 5, cashiers: [], condominiums: [building] };
const open = () => render(<MemoryRouter><BreadcrumbProvider><Cashier /></BreadcrumbProvider></MemoryRouter>);
const openRegistration = async () => fireEvent.click(await screen.findByRole("button", { name: "cashierPage.register" }));

beforeEach(() => {
  jest.clearAllMocks();
  useUser.mockReturnValue({ user: { id: 1, roles: ["MANAGER"] } });
  getCashiers.mockResolvedValue(overview);
});

test("registers a cashier with selected buildings without replacing the manager session", async () => {
  const saveUser = jest.fn();
  useUser.mockReturnValue({ user: { id: 1, roles: ["MANAGER"] }, saveUser });
  registerCashier.mockResolvedValue({ ...overview, cashiers: [{ id: 2, name: "New Cashier", email: "cashier@example.com", condominiums: [building] }] });
  open();
  await openRegistration();
  fireEvent.change(await screen.findByLabelText("common:name"), { target: { value: "New Cashier" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "cashier@example.com" } });
  fireEvent.change(screen.getByLabelText("profile:password"), { target: { value: "secret123" } });
  fireEvent.change(screen.getByLabelText("auth:confirmPassword"), { target: { value: "secret123" } });
  fireEvent.click(screen.getByLabelText("Building Seven"));
  fireEvent.click(screen.getByRole("button", { name: "auth:register" }));
  await waitFor(() => expect(toast.success).toHaveBeenCalled());
  expect(registerCashier).toHaveBeenCalledWith({ name: "New Cashier", email: "cashier@example.com", password: "secret123", confirmPassword: "secret123", condominiumIds: [7], language: "bg" });
  expect(screen.getByText("New Cashier")).toBeInTheDocument();
  expect(saveUser).not.toHaveBeenCalled();
});

test("hides registration when the configured limit is reached", async () => {
  getCashiers.mockResolvedValue({ ...overview, cashierLimit: 0 });
  open();
  await screen.findByText("cashierPage.limit");
  expect(screen.queryByRole("button", { name: "auth:register" })).not.toBeInTheDocument();
});

test("cashiers see their assigned condominiums and no manager registration", () => {
  useUser.mockReturnValue({ user: { id: 2, roles: ["CASHIER"], condominiums: [building] } });
  open();
  expect(screen.getByText("Building Seven")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "dashboard:funds" })).toHaveAttribute("href", "/fund/condominiums/7");
  expect(screen.queryByText("cashierPage.register")).not.toBeInTheDocument();
  expect(getCashiers).not.toHaveBeenCalled();
});

test("load failures can be retried", async () => {
  getCashiers.mockRejectedValueOnce(new Error("offline"));
  open();
  fireEvent.click(await screen.findByRole("button", { name: "cashierPage.retry" }));
  await screen.findByRole("button", { name: "cashierPage.register" });
  expect(getCashiers).toHaveBeenCalledTimes(2);
});

test("retains the form after the server rejects registration", async () => {
  registerCashier.mockRejectedValue({ response: { status: 409 } });
  open();
  await openRegistration();
  const input = await screen.findByLabelText("common:name");
  fireEvent.change(input, { target: { value: "New Cashier" } });
  fireEvent.submit(input.closest("form"));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("cashierPage.limitOrEmail"));
  expect(input).toHaveValue("New Cashier");
});

test("registration opens in a dialog and cancellation resets it on reopening", async () => {
  open();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await openRegistration();
  expect(screen.getByRole("dialog")).toHaveAccessibleName("cashierPage.register");
  fireEvent.change(screen.getByLabelText("common:name"), { target: { value: "Cancelled name" } });
  fireEvent.click(screen.getByRole("button", { name: "common:cancel" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await openRegistration();
  expect(screen.getByLabelText("common:name")).toHaveValue("");
  expect(registerCashier).not.toHaveBeenCalled();
});
