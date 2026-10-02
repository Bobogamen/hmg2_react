import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Users from "./Users";
import userLabels from "./userLabels";
import { getAdminUsers, updateAdminUser, getAdminUserSettings } from "../../api/services/adminUserService";
jest.mock("../../api/services/adminUserService", () => ({ getAdminUsers: jest.fn(), updateAdminUser: jest.fn(), getAdminUserSettings: jest.fn() }));
jest.mock("react-i18next", () => { const t = key => key; return { useTranslation: () => ({ t, i18n: { language: "en" } }) }; });
jest.mock("../breadcrumb/BreadcrumpContext", () => { const setBreadcrumbs = jest.fn(); return { useBreadcrumb: () => ({ setBreadcrumbs }) }; });
const user = { id: 2, name: "Manager", email: "manager@example.test", roles: ["MANAGER"], registeredOn: "2026-09-01", condominiumCount: 2, condominiumLimit: 3, blocked: false };
const page = { content: [user], totalElements: 1, totalPages: 1 };
beforeEach(() => { jest.clearAllMocks(); getAdminUserSettings.mockResolvedValue([]); getAdminUsers.mockResolvedValue(page); updateAdminUser.mockResolvedValue(user); });
const label = key => userLabels[key];

test("searches and filters on the server", async () => {
  render(<Users />);
  await screen.findAllByText(user.email);
  fireEvent.change(screen.getByLabelText(label("search")), { target: { value: "manager" } });
  fireEvent.click(screen.getByRole("button", { name: label("find") }));
  await waitFor(() => expect(getAdminUsers).toHaveBeenLastCalledWith({ search: "manager", page: 0 }));
  fireEvent.change(screen.getByLabelText(label("status")), { target: { value: "true" } });
  await waitFor(() => expect(getAdminUsers).toHaveBeenLastCalledWith({ search: "manager", page: 0, blocked: "true" }));
});

test("validates limits and submits explicit status and limit changes", async () => {
  render(<Users />);
  fireEvent.click((await screen.findAllByRole("button", { name: `${label("edit")} ${user.email}` }))[0]);
  const dialog = within(screen.getByRole("dialog"));
  fireEvent.change(dialog.getByLabelText(label("limit")), { target: { value: "1" } });
  expect(dialog.getByRole("button", { name: label("saveAccount") })).toBeDisabled();
  fireEvent.change(dialog.getByLabelText(label("limit")), { target: { value: "0" } });
  fireEvent.click(dialog.getByLabelText(label("blockAccount")));
  fireEvent.click(dialog.getByRole("button", { name: label("saveAccount") }));
  await waitFor(() => expect(updateAdminUser).toHaveBeenCalledWith(2, { blocked: true, condominiumLimit: 0 }));
  await screen.findByText(label("saved"));
});

test("protects administrator accounts from blocking", async () => {
  getAdminUsers.mockResolvedValue({ ...page, content: [{ ...user, roles: ["ADMIN"] }] });
  render(<Users />);
  fireEvent.click((await screen.findAllByRole("button", { name: `${label("edit")} ${user.email}` }))[0]);
  expect(within(screen.getByRole("dialog")).getByLabelText(label("blockAccount"))).toBeDisabled();
});

test("shows failed saves and retains the edit form", async () => {
  updateAdminUser.mockRejectedValue(new Error("offline"));
  render(<Users />);
  fireEvent.click((await screen.findAllByRole("button", { name: `${label("edit")} ${user.email}` }))[0]);
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: label("saveAccount") }));
  await screen.findByText(label("saveError"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
